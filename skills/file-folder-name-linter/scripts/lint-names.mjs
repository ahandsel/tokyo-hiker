// lint-names.mjs notes
// General notes:
// * Purpose: Lint repository file and folder names against three fixed rules
//   from skills/file-folder-name-linter/SKILL.md - notes/ naming, .yaml not
//   .yml, and kebab-case for everything else.
// * Honors .gitignore implicitly by enumerating paths via `git ls-files -z`.
// * Honors the repo-root .namelintignore (one glob per line, # for comments).
// * Hardcoded default ignores cover standard repo docs (README.md, AGENTS.md,
//   MEMORY.md, ONBOARDING.md, LICENSE, CHANGELOG.md, ...), dotfiles and
//   dot-folders, package manager files (package.json, pnpm-lock.yaml,
//   tsconfig*.json), and vendored Figma skills (skills/figma-*/).
// Usage:
//   node skills/file-folder-name-linter/scripts/lint-names.mjs
//   node skills/file-folder-name-linter/scripts/lint-names.mjs notes/
//   node skills/file-folder-name-linter/scripts/lint-names.mjs --fix
//   node skills/file-folder-name-linter/scripts/lint-names.mjs --json
//   pnpm lint-naming                # equivalent to the no-arg form
// Output:
// * Human-readable report grouped by rule, then an informational list of
//   style guides discovered in the repo for reviewer reference.
// * With --json: { violations: [...], styleGuides: [...] } on stdout.
// * Exit codes: 0 = clean, 1 = violations found, 2 = configuration error.
// Version history:
// * v1.0 - 2026-06-05 - Initial release.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, statSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

const NOTES_PREFIX = 'notes/';
const NOTES_NAME_RE =
  /^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*\.(md|png|jpg|jpeg|gif|webp|svg)$/;
const KEBAB_RE = /^[a-z0-9][a-z0-9-]*$/;

// Standard repo docs and tool-convention files - matched by basename anywhere
// in the tree. These are the well-known fixed filenames that ecosystems
// require (Anthropic skills, Homebrew, Make, Docker, ...), so a kebab-case
// check against them is always a false positive.
const STANDARD_DOC_BASENAMES = new Set([
  'README.md',
  'README.txt',
  'AGENTS.md',
  'MEMORY.md',
  'ONBOARDING.md',
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'CHANGELOG.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'AUTHORS',
  'AUTHORS.md',
  'NOTICE',
  'NOTICE.md',
  'SKILL.md',
  'Brewfile',
  'Makefile',
  'Dockerfile',
  'Procfile',
  'Gemfile',
  'Rakefile',
  'Caddyfile',
  'Justfile',
  'Vagrantfile',
]);

// Exact package-manager files at any depth (rare outside the root, but cheap
// to allow everywhere).
const PACKAGE_MANAGER_BASENAMES = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'yarn.lock',
]);

// Vendored skill directory prefixes. Anything under one of these is skipped
// entirely, both file and folder checks.
const VENDORED_DIR_PREFIXES = ['skills/figma-'];

// Heuristic style-guide discovery patterns. Pure informational; never affects
// exit code.
const STYLE_GUIDE_PATTERNS = [
  /(^|\/)AGENTS\.md$/,
  /(^|\/)repo-commit-style-guide\.md$/,
  /style-guide/i,
  /-rules\.md$/,
];

class ConfigError extends Error {}

function printUsage() {
  console.log(`Usage: pnpm lint-naming [options] [paths...]
       node skills/file-folder-name-linter/scripts/lint-names.mjs [options] [paths...]

Options:
  --fix              Rename *.yml to *.yaml in place. Other rules report only.
  --json             Emit machine-readable JSON instead of the grouped report.
  --repo-root <dir>  Override repo-root detection (default: git rev-parse).
  -h, --help         Show this help and exit.

Positional paths scope the run to files and folders under those prefixes.
Without any positional paths, the linter scans the whole repo.

Exit codes:
  0  no violations
  1  one or more violations
  2  configuration error`);
}

function usageError(message) {
  console.error(`❌ ${message}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = { fix: false, json: false, repoRoot: null, scope: [] };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg === '--fix') {
      args.fix = true;
      i += 1;
    } else if (arg === '--json') {
      args.json = true;
      i += 1;
    } else if (arg === '--repo-root') {
      i += 1;
      if (i >= argv.length)
        usageError('argument --repo-root: expected one argument');
      args.repoRoot = argv[i];
      i += 1;
    } else if (arg.startsWith('--repo-root=')) {
      args.repoRoot = arg.slice('--repo-root='.length);
      i += 1;
    } else if (arg.startsWith('--')) {
      usageError(`unrecognized argument: ${arg}`);
    } else {
      args.scope.push(arg);
      i += 1;
    }
  }
  return args;
}

function findRepoRoot(explicit) {
  if (explicit) {
    const abs = isAbsolute(explicit) ? explicit : resolve(explicit);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) {
      throw new ConfigError(`--repo-root is not a directory: ${abs}`);
    }
    return abs;
  }
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new ConfigError(
      'could not determine repo root (not a git checkout); pass --repo-root',
    );
  }
  return result.stdout.trim();
}

function listTrackedFiles(repoRoot) {
  const result = spawnSync('git', ['-C', repoRoot, 'ls-files', '-z'], {
    encoding: 'buffer',
  });
  if (result.status !== 0) {
    throw new ConfigError(
      `git ls-files failed: ${result.stderr.toString('utf8').trim()}`,
    );
  }
  return result.stdout
    .toString('utf8')
    .split('\0')
    .filter((path) => path.length > 0);
}

function readIgnoreFile(repoRoot) {
  const path = join(repoRoot, '.namelintignore');
  if (!existsSync(path)) return [];
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new ConfigError(`could not read .namelintignore: ${err.message}`);
  }
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

// Translate a minimal glob (with `*`, `**`, and trailing-slash directory
// scoping) to an anchored regex. Patterns match against repo-relative POSIX
// paths.
function globToRegex(glob) {
  let pattern = glob;
  let isDir = false;
  if (pattern.endsWith('/')) {
    isDir = true;
    pattern = pattern.slice(0, -1);
  }
  let regex = '';
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        regex += '.*';
        i += 2;
        if (pattern[i] === '/') i += 1;
      } else {
        regex += '[^/]*';
        i += 1;
      }
    } else if (c === '?') {
      regex += '[^/]';
      i += 1;
    } else if ('.+^$()|{}[]\\'.includes(c)) {
      regex += '\\' + c;
      i += 1;
    } else {
      regex += c;
      i += 1;
    }
  }
  return new RegExp(isDir ? `^${regex}(/|$)` : `^${regex}$`);
}

function buildUserIgnoreMatcher(patterns) {
  const regexes = patterns.map(globToRegex);
  return (path) => regexes.some((re) => re.test(path));
}

function isInVendoredDir(path) {
  return VENDORED_DIR_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function hasDotSegment(path) {
  return path.split('/').some((segment) => segment.startsWith('.'));
}

function isDefaultIgnoredFile(path) {
  if (isInVendoredDir(path)) return true;
  if (hasDotSegment(path)) return true;
  const base = path.includes('/')
    ? path.slice(path.lastIndexOf('/') + 1)
    : path;
  if (STANDARD_DOC_BASENAMES.has(base)) return true;
  if (PACKAGE_MANAGER_BASENAMES.has(base)) return true;
  if (/^tsconfig(\..+)?\.json$/.test(base)) return true;
  return false;
}

function isDefaultIgnoredFolder(folder) {
  if (isInVendoredDir(folder + '/')) return true;
  if (hasDotSegment(folder)) return true;
  return false;
}

function inScope(path, scope) {
  if (scope.length === 0) return true;
  return scope.some(
    (s) =>
      path === s ||
      path === s.replace(/\/+$/, '') ||
      path.startsWith(s.endsWith('/') ? s : s + '/'),
  );
}

// Folder names derived from in-scope file paths. Returns a sorted array of
// unique folder paths (repo-relative, no trailing slash).
function collectFolders(files) {
  const folders = new Set();
  for (const file of files) {
    const parts = file.split('/');
    for (let i = 1; i < parts.length; i += 1) {
      folders.add(parts.slice(0, i).join('/'));
    }
  }
  return [...folders].sort();
}

function checkFile(path) {
  const findings = [];
  const base = path.includes('/')
    ? path.slice(path.lastIndexOf('/') + 1)
    : path;

  if (path.startsWith(NOTES_PREFIX)) {
    if (!NOTES_NAME_RE.test(base)) {
      findings.push({
        rule: 'notes-naming',
        path,
        expected: 'YYYY-MM-DD-<kebab-name>.<md|png|jpg|jpeg|gif|webp|svg>',
      });
    }
    return findings;
  }

  if (base.toLowerCase().endsWith('.yml')) {
    findings.push({
      rule: 'yml-extension',
      path,
      expected: path.slice(0, -4) + '.yaml',
      autoFixable: true,
    });
  }

  const stem = base.includes('.') ? base.slice(0, base.indexOf('.')) : base;
  if (!KEBAB_RE.test(stem)) {
    findings.push({
      rule: 'kebab-case',
      path,
      kind: 'file',
      offending: stem,
      expected: 'lowercase letters, digits, and hyphens only (kebab-case)',
    });
  }
  return findings;
}

function checkFolder(folder) {
  const segment = folder.includes('/')
    ? folder.slice(folder.lastIndexOf('/') + 1)
    : folder;
  if (KEBAB_RE.test(segment)) return [];
  return [
    {
      rule: 'kebab-case',
      path: folder + '/',
      kind: 'folder',
      offending: segment,
      expected: 'lowercase letters, digits, and hyphens only (kebab-case)',
    },
  ];
}

function discoverStyleGuides(files) {
  const found = [];
  const seen = new Set();
  for (const file of files) {
    if (seen.has(file)) continue;
    if (STYLE_GUIDE_PATTERNS.some((re) => re.test(file))) {
      found.push(file);
      seen.add(file);
    }
  }
  return found.sort();
}

const RULE_LABELS = {
  'notes-naming': 'notes/ naming',
  'yml-extension': '.yml extension',
  'kebab-case': 'kebab-case',
};

function groupByRule(violations) {
  const grouped = new Map();
  for (const v of violations) {
    if (!grouped.has(v.rule)) grouped.set(v.rule, []);
    grouped.get(v.rule).push(v);
  }
  return grouped;
}

function printHumanReport(violations, styleGuides, fixed) {
  console.log('File and folder name lint report');
  console.log('');

  if (fixed.length > 0) {
    console.log(`🛠 Auto-fixed (${fixed.length}):`);
    for (const f of fixed) console.log(`  ${f.from} -> ${f.to}`);
    console.log('');
  }

  if (violations.length === 0) {
    console.log('✅ No violations found.');
  } else {
    const grouped = groupByRule(violations);
    for (const [rule, items] of grouped) {
      console.log(`❌ ${RULE_LABELS[rule]} (${items.length})`);
      for (const v of items) {
        console.log(`  ${v.path}`);
        if (v.rule === 'yml-extension') {
          console.log(`    suggest: ${v.expected}  (auto-fixable with --fix)`);
        } else if (v.rule === 'notes-naming') {
          console.log(`    expected: ${v.expected}`);
        } else if (v.rule === 'kebab-case') {
          console.log(
            `    offending: "${v.offending}" (${v.kind}); ${v.expected}`,
          );
        }
      }
      console.log('');
    }
  }

  if (styleGuides.length > 0) {
    console.log('ℹ️ Style guides found in this repo (for reviewer reference):');
    for (const g of styleGuides) console.log(`  - ${g}`);
    console.log('');
  }

  const ruleCount = new Set(violations.map((v) => v.rule)).size;
  if (violations.length > 0) {
    console.log(
      `Summary: ${violations.length} violation(s) across ${ruleCount} rule(s).`,
    );
  }
}

function applyFixes(repoRoot, violations) {
  const fixed = [];
  const remaining = [];
  for (const v of violations) {
    if (v.rule !== 'yml-extension' || !v.autoFixable) {
      remaining.push(v);
      continue;
    }
    const fromAbs = join(repoRoot, v.path);
    const toAbs = join(repoRoot, v.expected);
    if (existsSync(toAbs)) {
      console.error(
        `⚠️  cannot rename ${v.path} -> ${v.expected}: target already exists`,
      );
      remaining.push(v);
      continue;
    }
    try {
      renameSync(fromAbs, toAbs);
      fixed.push({ from: v.path, to: v.expected });
    } catch (err) {
      console.error(`❌ rename failed for ${v.path}: ${err.message}`);
      remaining.push(v);
    }
  }
  return { fixed, remaining };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let repoRoot;
  let files;
  let userIgnore;
  try {
    repoRoot = findRepoRoot(args.repoRoot);
    files = listTrackedFiles(repoRoot);
    userIgnore = readIgnoreFile(repoRoot);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`❌ ${err.message}`);
      process.exit(2);
    }
    throw err;
  }

  const matchesUserIgnore = buildUserIgnoreMatcher(userIgnore);

  const inScopeFiles = files.filter((path) => {
    if (!inScope(path, args.scope)) return false;
    if (isDefaultIgnoredFile(path)) return false;
    if (matchesUserIgnore(path)) return false;
    return true;
  });

  const folders = collectFolders(inScopeFiles).filter((folder) => {
    if (!inScope(folder, args.scope) && !inScope(folder + '/', args.scope))
      return false;
    if (isDefaultIgnoredFolder(folder)) return false;
    if (matchesUserIgnore(folder) || matchesUserIgnore(folder + '/'))
      return false;
    return true;
  });

  let violations = [];
  for (const file of inScopeFiles) violations.push(...checkFile(file));
  for (const folder of folders) violations.push(...checkFolder(folder));

  let fixed = [];
  if (args.fix) {
    const result = applyFixes(repoRoot, violations);
    fixed = result.fixed;
    violations = result.remaining;
  }

  const styleGuides = discoverStyleGuides(files);

  if (args.json) {
    console.log(JSON.stringify({ violations, fixed, styleGuides }, null, 2));
  } else {
    printHumanReport(violations, styleGuides, fixed);
  }

  process.exit(violations.length === 0 ? 0 : 1);
}

main();
