#!/usr/bin/env node
// check-vitepress-includes.mjs notes
// General notes:
// * Purpose: Validate VitePress `@include:` directives in Markdown files for strict comment formatting and resolvable target paths.
// * This is a behavior-faithful port of the retired `check_vitepress_includes.py`, matching its flags, findings, finding order, and exit codes.
// * The finding lines match the Python output byte for byte; the success, warning, and summary lines instead carry the status emojis that the repo script rules require.
// * A directory argument is scanned recursively for names ending in `.md`, which reproduces the Python `rglob("*.md")` behavior: hidden files and hidden folders are included, the match is case-sensitive, and directory symlinks are not followed.
// * A file argument is accepted when its suffix is `.md` in any letter case, which reproduces the Python `suffix.lower()` check.
// * Fenced code blocks are skipped, and the fence state toggles on any line whose first non-whitespace characters are ``` or ~~~.
// * An include path that starts with `/` resolves against `--repo-root`, and every other path resolves against the folder of the source file.
// * A `#fragment` suffix is ignored when checking that the target file exists.
// Usage:
//   node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs
//   node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents
//   node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents/en contents/ja
//   node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents --repo-root .
// Options:
//   --paths <path...>  Markdown files or directories to scan (default: contents).
//   --repo-root <dir>  Repository root used to resolve an absolute include path (default: .).
//   -h, --help         Show the usage text and exit.
// Output:
// * One line per finding on stdout, formatted as `file:line:column [CODE] message`, where the file is an absolute resolved path.
// * A trailing summary line reporting the number of findings and the number of affected files.
// * A single success or warning line when there is nothing to report.
// * Exit codes: 0 = no findings, 1 = at least one finding or an unreadable file, 2 = invalid arguments.
// Version history:
// * v1.3 - 2026-09-29 - Accept closing whitespace used by Tokyo Hiker include directives.
// * v1.2 - 2026-08-24 - Keep `..` after a symlink in include paths, and reject a `--repo-root` value that starts with `-`.
// * v1.1 - 2026-08-21 - Order findings by path component to match Python's PosixPath ordering, and document the emoji summary lines.
// * v1.0 - 2026-08-21 - Initial release, replacing the retired `check_vitepress_includes.py` with a behavior-faithful Node.js port.

import { readdirSync, readFileSync, readlinkSync, statSync } from 'node:fs';
import { basename, isAbsolute, join } from 'node:path';

// The character class that Python's `str.isspace()` treats as whitespace.
// It drives the ports of `lstrip()`, `strip()`, and the `\s` groups in the directive pattern.
// U+FEFF is deliberately absent, because Python does not count a byte order mark as whitespace, so a directive on a line that starts with one is skipped.
const PY_SPACE =
  '\\t\\n\\v\\f\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000';

const PY_LSTRIP_RE = new RegExp(`^[${PY_SPACE}]+`);
const PY_RSTRIP_RE = new RegExp(`[${PY_SPACE}]+$`);

// The line boundaries that Python's `str.splitlines()` recognizes.
// This is a smaller set than PY_SPACE, so a character such as U+001F splits nothing but still strips.
const PY_LINE_BOUNDARY_RE = /\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/;

const DIRECTIVE_RE = new RegExp(
  `^<!--(?<spaceAfterOpen>[${PY_SPACE}]*)@include:(?<path>.*?)(?<spaceBeforeClose>[${PY_SPACE}]*)-->$`,
);

const FENCE_RE = /^(```|~~~)/;

// A symlink chain longer than this is treated as unresolvable rather than followed forever.
const MAX_SYMLINK_HOPS = 40;

const DEFAULT_PATHS = ['contents'];
const DEFAULT_REPO_ROOT = '.';

// Raised when a Markdown file cannot be read, which surfaces as exit code 1.
class ReadError extends Error {}

function printUsage() {
  console.log(
    [
      'Usage: node check-vitepress-includes.mjs [options]',
      '',
      'Validate VitePress @include directives for strict formatting and resolvable paths.',
      '',
      'Options:',
      '  --paths <path...>  Markdown file(s) or directories to scan. (default: contents)',
      '  --repo-root <dir>  Repository root used for absolute include path resolution. (default: .)',
      '  -h, --help         Show this help and exit.',
      '',
      'Output:',
      '  One line per finding, formatted as file:line:column [CODE] message.',
      '',
      'Exit codes:',
      '  0  no include issues found',
      '  1  at least one finding, or a Markdown file could not be read',
      '  2  invalid arguments',
    ].join('\n'),
  );
}

function usageError(message) {
  console.error(`❌ ${message}`);
  process.exit(2);
}

// Parse argv:
//   --paths <path...>  one or more Markdown files or directories
//   --repo-root <dir>  root for absolute include path resolution
function parseArgs(argv) {
  const args = { paths: null, repoRoot: null };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--paths') {
      i += 1;
      const values = [];
      while (i < argv.length && !argv[i].startsWith('-')) {
        values.push(argv[i]);
        i += 1;
      }
      if (values.length === 0)
        usageError('argument --paths: expected at least one argument');
      args.paths = values;
    } else if (arg.startsWith('--paths=')) {
      args.paths = [arg.slice('--paths='.length)];
      i += 1;
    } else if (arg === '--repo-root') {
      i += 1;
      if (i >= argv.length || argv[i].startsWith('-'))
        usageError('argument --repo-root: expected one argument');
      args.repoRoot = argv[i];
      i += 1;
    } else if (arg.startsWith('--repo-root=')) {
      args.repoRoot = arg.slice('--repo-root='.length);
      if (!args.repoRoot || args.repoRoot.startsWith('-'))
        usageError('argument --repo-root: expected one argument');
      i += 1;
    } else if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else {
      usageError(`unrecognized arguments: ${arg}`);
    }
  }
  return {
    paths: args.paths ?? DEFAULT_PATHS,
    repoRoot: args.repoRoot ?? DEFAULT_REPO_ROOT,
  };
}

// Port of Python's `str.lstrip()` with no argument.
function pyLstrip(value) {
  return value.replace(PY_LSTRIP_RE, '');
}

// Port of Python's `str.strip()` with no argument.
function pyStrip(value) {
  return value.replace(PY_LSTRIP_RE, '').replace(PY_RSTRIP_RE, '');
}

// Port of Python's `str.splitlines()`, which drops the final empty field and returns nothing for an empty string.
function pySplitLines(text) {
  if (text === '') return [];
  const lines = text.split(PY_LINE_BOUNDARY_RE);
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

// Port of Python's `PurePath.suffix`, which reports no suffix for a name such as `.md` or `trailing.`.
function pySuffix(name) {
  const index = name.lastIndexOf('.');
  if (index > 0 && index < name.length - 1) return name.slice(index);
  return '';
}

// Port of Python's `Path.resolve()`: make the path absolute, resolve a symlink before applying the `..` that follows it, and leave a missing tail in place.
function pyResolve(rawPath) {
  const absolute = isAbsolute(rawPath) ? rawPath : join(process.cwd(), rawPath);
  const pending = absolute.split('/').reverse();
  const resolved = [];
  let hops = 0;

  while (pending.length > 0) {
    const segment = pending.pop();
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      resolved.pop();
      continue;
    }

    const candidate = `/${[...resolved, segment].join('/')}`;
    let target = null;
    if (hops < MAX_SYMLINK_HOPS) {
      try {
        target = readlinkSync(candidate);
      } catch {
        target = null;
      }
    }

    if (target === null) {
      resolved.push(segment);
      continue;
    }

    hops += 1;
    if (isAbsolute(target)) resolved.length = 0;
    const parts = target.split('/');
    for (let index = parts.length - 1; index >= 0; index -= 1)
      pending.push(parts[index]);
  }

  return `/${resolved.join('/')}`;
}

// Port of Python's `Path.is_file()`, which reports false rather than raising when the path cannot be inspected.
function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

// Port of Python's `Path.is_dir()`, with the same tolerance for an unreadable path.
function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

// Port of `Path.rglob("*.md")`.
// Every entry whose name ends in `.md` is collected, including a directory, and recursion stops at a symlinked directory.
function collectMarkdownUnder(directory, found) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.name.endsWith('.md')) found.push(path);
    if (entry.isDirectory()) collectMarkdownUnder(path, found);
  }
}

// Compare two absolute paths the way Python orders PosixPath values: component by component, each component by code point.
// A plain string comparison would deviate twice over: a separator can outrank a character inside a sibling name (sorting `a.b/` before `a/`), and JavaScript compares UTF-16 code units rather than code points.
function comparePaths(left, right) {
  const leftParts = left.split('/');
  const rightParts = right.split('/');
  const shared = Math.min(leftParts.length, rightParts.length);
  for (let index = 0; index < shared; index += 1) {
    const difference = compareCodePoints(leftParts[index], rightParts[index]);
    if (difference !== 0) return difference;
  }
  return leftParts.length - rightParts.length;
}

// Compare two strings by code point, the way Python compares the strings inside a PosixPath parts tuple.
function compareCodePoints(left, right) {
  const leftPoints = [...left];
  const rightPoints = [...right];
  const shared = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < shared; index += 1) {
    const difference =
      leftPoints[index].codePointAt(0) - rightPoints[index].codePointAt(0);
    if (difference !== 0) return difference;
  }
  return leftPoints.length - rightPoints.length;
}

function iterMarkdownFiles(inputPaths) {
  const files = [];
  const seen = new Set();

  const remember = (path) => {
    const resolved = pyResolve(path);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    files.push(resolved);
  };

  for (const rawPath of inputPaths) {
    if (isFile(rawPath)) {
      if (pySuffix(basename(rawPath)).toLowerCase() === '.md')
        remember(rawPath);
      continue;
    }
    if (!isDirectory(rawPath)) continue;

    const found = [];
    collectMarkdownUnder(rawPath, found);
    for (const path of found) remember(path);
  }

  return files.sort(comparePaths);
}

// Join two POSIX path strings without collapsing `.` or `..`, so pyResolve still sees a symlink before a following `..`.
function joinRaw(base, relative) {
  const right = relative.replace(/^\/+/, '');
  if (base === '/') return `/${right}`;
  const left = base.replace(/\/+$/, '');
  return `${left}/${right}`;
}

function resolveTarget(sourceFile, includePath, repoRoot) {
  if (includePath.startsWith('/'))
    return pyResolve(joinRaw(repoRoot, includePath));
  const sourceDirectory =
    sourceFile.slice(0, sourceFile.lastIndexOf('/')) || '/';
  return pyResolve(joinRaw(sourceDirectory, includePath));
}

function collectFindings(filePath, repoRoot) {
  const findings = [];
  let contents;
  try {
    contents = readFileSync(filePath).toString('utf8');
  } catch (error) {
    throw new ReadError(`cannot read ${filePath}: ${error.message}`);
  }

  const record = (line, column, code, message) => {
    findings.push({ filePath, line, column, code, message });
  };

  let insideFence = false;
  const lines = pySplitLines(contents);

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    const stripped = pyLstrip(line);

    if (FENCE_RE.test(stripped)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;
    if (!stripped.startsWith('<!--')) continue;
    if (!stripped.includes('@include:')) continue;

    const column = line.length - stripped.length + 1;
    const endIndex = stripped.indexOf('-->');
    if (endIndex < 0) {
      record(
        lineNumber,
        column,
        'INCLUDE_UNTERMINATED',
        "Include directive comment is missing closing '-->'.",
      );
      continue;
    }

    const comment = stripped.slice(0, endIndex + 3);
    const trailing = stripped.slice(endIndex + 3);
    if (pyStrip(trailing)) {
      record(
        lineNumber,
        column,
        'INCLUDE_TRAILING_TEXT',
        'Include directive must be a standalone comment line.',
      );
    }

    const match = DIRECTIVE_RE.exec(comment);
    if (match === null) {
      record(
        lineNumber,
        column,
        'INCLUDE_MALFORMED',
        "Include directive does not match '<!--@include: path -->'.",
      );
      continue;
    }

    if (match.groups.spaceAfterOpen) {
      record(
        lineNumber,
        column,
        'INCLUDE_SPACE_AFTER_OPEN',
        "Do not put spaces between '<!--' and '@include:'.",
      );
    }

    const includeValue = pyStrip(match.groups.path);
    if (!includeValue) {
      record(
        lineNumber,
        column,
        'INCLUDE_PATH_EMPTY',
        'Include directive is missing a file path.',
      );
      continue;
    }

    const includePath = includeValue.split('#')[0];
    if (!includePath) {
      record(
        lineNumber,
        column,
        'INCLUDE_PATH_EMPTY',
        "Include file path is empty before fragment '#...'.",
      );
      continue;
    }

    const targetPath = resolveTarget(filePath, includePath, repoRoot);
    if (!isFile(targetPath)) {
      record(
        lineNumber,
        column,
        'INCLUDE_PATH_NOT_FOUND',
        `Resolved include path does not exist: '${includePath}' -> '${targetPath}'.`,
      );
    }
  }

  return findings;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = pyResolve(args.repoRoot);
  const files = iterMarkdownFiles(args.paths);

  if (files.length === 0) {
    console.log('⚠️  No markdown files found for the provided --paths.');
    return 0;
  }

  const findings = [];
  for (const filePath of files) {
    try {
      findings.push(...collectFindings(filePath, repoRoot));
    } catch (error) {
      if (!(error instanceof ReadError)) throw error;
      console.error(`❌ ${error.message}`);
      return 1;
    }
  }

  if (findings.length === 0) {
    console.log(
      `✅ Checked ${files.length} markdown file(s); no include issues found.`,
    );
    return 0;
  }

  for (const finding of findings) {
    console.log(
      `${finding.filePath}:${finding.line}:${finding.column} [${finding.code}] ${finding.message}`,
    );
  }

  const affected = new Set(findings.map((finding) => finding.filePath)).size;
  console.log(
    `\n❌ Found ${findings.length} issue(s) across ${affected} file(s).`,
  );
  return 1;
}

process.exit(main());
