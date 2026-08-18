// audit-helper-scripts.mjs notes
// General notes:
// * Purpose: Audit helper scripts in this repo against the "Scripts" guidelines in AGENTS.md.
// * Checks each script for: allowed language (no Python; prefer `.mjs` or zsh), a `--help`
//   flag, a top-of-file notes section (general notes, usage, output, version history), and
//   status emojis.
// * The checks are heuristics meant to surface candidates for review, not a hard gate.
//
// Usage:
//   node skills/script-auditor/scripts/audit-helper-scripts.mjs
//   node skills/script-auditor/scripts/audit-helper-scripts.mjs --repo-root /path/to/repo
//   node skills/script-auditor/scripts/audit-helper-scripts.mjs --json
//   node skills/script-auditor/scripts/audit-helper-scripts.mjs path/to/one-script.mjs ...
//
// Output:
// * Human-readable per-script report with a ✅ / ⚠️ / ❌ verdict per check, or `--json` for a
//   machine-readable array of findings.
// * Final status line: `result:ok`, `result:findings`, or via exit code on configuration error.
// * Exit codes: 0 = all scripts pass, 1 = at least one warning or failure, 2 = configuration error.
//
// Version history:
// * v1.1 - 2026-06-04 - Add a version history check to the notes section audit.
// * v1.0 - 2026-06-04 - Initial release: language, --help, notes, and emoji checks.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, isAbsolute, join, resolve } from 'node:path';

// Raised when input is invalid; surfaces as exit code 2.
class ConfigError extends Error {}

// Extensions we treat as helper scripts.
const SCRIPT_EXTS = new Set([
  '.mjs',
  '.js',
  '.cjs',
  '.sh',
  '.zsh',
  '.bash',
  '.py',
]);

// Keywords that mark each required part of the notes section.
const NOTES_GENERAL_RE = /\b(general notes|description|purpose|notes)\b/i;
const NOTES_USAGE_RE = /\busage\b/i;
const NOTES_OUTPUT_RE = /\boutput\b/i;
const NOTES_VERSION_RE = /\bversion history\b/i;

// Status emojis the guidelines call for (plus a few common siblings).
const STATUS_EMOJI_RE = /[✅⚠️❌🔍ℹ️🚀⛔️🟢🟡🔴]/u;

function printUsage() {
  console.log(
    [
      'Usage: node audit-helper-scripts.mjs [options] [files...]',
      '',
      'Audit helper scripts against the AGENTS.md "Scripts" guidelines.',
      '',
      'Options:',
      '  --repo-root <dir>  Override repo root detection (default: git toplevel).',
      '  --json             Emit machine-readable JSON instead of a report.',
      '  -h, --help         Show this help and exit.',
      '',
      'Arguments:',
      '  files...           Specific script paths to audit. When omitted, all',
      '                     tracked scripts under scripts/ and skills/*/scripts/',
      '                     are discovered automatically.',
      '',
      'Exit codes:',
      '  0  all audited scripts pass',
      '  1  at least one warning or failure',
      '  2  configuration error',
    ].join('\n'),
  );
}

function usageError(message) {
  console.error(`❌ ${message}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = { repoRoot: null, json: false, files: [] };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--json') {
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
    } else if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg.startsWith('-')) {
      usageError(`unrecognized argument: ${arg}`);
    } else {
      args.files.push(arg);
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

// Tracked files whose path lives under a `scripts/` segment (top-level or nested).
function discoverTrackedScripts(repoRoot) {
  const result = spawnSync('git', ['ls-files'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new ConfigError('git ls-files failed; pass explicit files instead');
  }
  return (
    result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter(
        (rel) =>
          rel === 'scripts' ||
          rel.startsWith('scripts/') ||
          /\/scripts\//.test(rel),
      )
      // Skip vendored Figma plugin scripts: they are Figma Plugin API snippets run
      // inside Figma via use_figma, not repo CLI helpers, so the guidelines do not apply.
      .filter((rel) => !/(^|\/)skills\/figma-[^/]+\//.test(rel))
      .filter((rel) => SCRIPT_EXTS.has(extname(rel)))
      .map((rel) => join(repoRoot, rel))
  );
}

function isScriptFile(absPath) {
  if (SCRIPT_EXTS.has(extname(absPath))) return true;
  // Fall back to a shebang for extensionless scripts.
  try {
    const fd = readFileSync(absPath, 'utf8');
    return fd.startsWith('#!');
  } catch {
    return false;
  }
}

// Classify the language and grade it against the policy.
//   ok   -> .mjs or zsh (the documented defaults)
//   warn -> other shells / non-mjs JavaScript (allowed but not the default)
//   fail -> Python (the policy bans it)
function checkLanguage(absPath, firstLine) {
  const ext = extname(absPath);
  if (ext === '.py' || /python/.test(firstLine)) {
    return {
      status: 'fail',
      note: 'Python is banned by policy; rewrite as a Node.js .mjs module or zsh.',
    };
  }
  if (ext === '.mjs') {
    return { status: 'ok', note: 'Node.js ES module (.mjs).' };
  }
  if (ext === '.js' || ext === '.cjs') {
    return {
      status: 'warn',
      note: 'Prefer Node.js ES modules (.mjs) over .js/.cjs.',
    };
  }
  if (ext === '.zsh' || /zsh/.test(firstLine)) {
    return { status: 'ok', note: 'zsh script.' };
  }
  if (ext === '.bash' || /bash/.test(firstLine)) {
    return {
      status: 'warn',
      note: 'Project default is zsh; consider zsh unless bash is required.',
    };
  }
  if (ext === '.sh') {
    return {
      status: 'warn',
      note: 'Shell script with no zsh shebang; prefer an explicit zsh shebang.',
    };
  }
  return { status: 'warn', note: `Unrecognized script type (${ext}).` };
}

function checkHelp(source) {
  if (/--help/.test(source)) {
    return { status: 'ok', note: 'Handles --help.' };
  }
  return {
    status: 'fail',
    note: 'No --help handling found; every script must document itself with --help.',
  };
}

// The notes section must live near the top, inside comments, and cover the four
// required parts. We scan the leading comment block (first ~60 lines).
function checkNotes(source) {
  const head = source.split('\n').slice(0, 60).join('\n');
  const missing = [];
  if (!NOTES_GENERAL_RE.test(head)) missing.push('general notes');
  if (!NOTES_USAGE_RE.test(head)) missing.push('usage');
  if (!NOTES_OUTPUT_RE.test(head)) missing.push('output');
  if (!NOTES_VERSION_RE.test(head)) missing.push('version history');
  if (missing.length === 0) {
    return {
      status: 'ok',
      note: 'Notes section covers general, usage, output, and version history.',
    };
  }
  return {
    status: 'fail',
    note: `Notes section missing: ${missing.join(', ')}.`,
  };
}

function checkEmoji(source) {
  if (STATUS_EMOJI_RE.test(source)) {
    return { status: 'ok', note: 'Uses status emojis.' };
  }
  return {
    status: 'warn',
    note: 'No status emojis found; use ✅ / ⚠️ / ❌ to clarify output.',
  };
}

function auditFile(absPath, repoRoot) {
  const source = readFileSync(absPath, 'utf8');
  const firstLine = source.split('\n', 1)[0] ?? '';
  const checks = {
    language: checkLanguage(absPath, firstLine),
    help: checkHelp(source),
    notes: checkNotes(source),
    emoji: checkEmoji(source),
  };
  const statuses = Object.values(checks).map((c) => c.status);
  const verdict = statuses.includes('fail')
    ? 'fail'
    : statuses.includes('warn')
      ? 'warn'
      : 'ok';
  const rel = absPath.startsWith(repoRoot + '/')
    ? absPath.slice(repoRoot.length + 1)
    : absPath;
  return { path: rel, verdict, checks };
}

const VERDICT_EMOJI = { ok: '✅', warn: '⚠️', fail: '❌' };
const CHECK_LABELS = {
  language: 'Language',
  help: '--help',
  notes: 'Notes section',
  emoji: 'Status emojis',
};

function printReport(results) {
  for (const result of results) {
    console.log(`${VERDICT_EMOJI[result.verdict]} ${result.path}`);
    for (const [key, label] of Object.entries(CHECK_LABELS)) {
      const check = result.checks[key];
      console.log(`   ${VERDICT_EMOJI[check.status]} ${label}: ${check.note}`);
    }
    console.log('');
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let repoRoot;
  let files;
  try {
    repoRoot = findRepoRoot(args.repoRoot);
    if (args.files.length > 0) {
      files = args.files
        .map((f) => (isAbsolute(f) ? f : resolve(repoRoot, f)))
        .filter((abs) => {
          if (!existsSync(abs) || !statSync(abs).isFile()) {
            console.error(`⚠️  Skipping (not a file): ${abs}`);
            return false;
          }
          return true;
        })
        .filter((abs) => {
          if (!isScriptFile(abs)) {
            console.error(`⚠️  Skipping (not a recognized script): ${abs}`);
            return false;
          }
          return true;
        });
    } else {
      files = discoverTrackedScripts(repoRoot);
    }
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`❌ ${err.message}`);
      process.exit(2);
    }
    throw err;
  }

  if (files.length === 0) {
    console.error('❌ No helper scripts found to audit.');
    process.exit(2);
  }

  const results = files.sort().map((abs) => auditFile(abs, repoRoot));

  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printReport(results);
  }

  const counts = {
    ok: results.filter((r) => r.verdict === 'ok').length,
    warn: results.filter((r) => r.verdict === 'warn').length,
    fail: results.filter((r) => r.verdict === 'fail').length,
  };

  if (!args.json) {
    console.log(
      `🔍 Audited ${results.length} script(s): ` +
        `✅ ${counts.ok} ok, ⚠️ ${counts.warn} warning, ❌ ${counts.fail} failing.`,
    );
  }

  if (counts.warn === 0 && counts.fail === 0) {
    if (!args.json) console.log('result:ok');
    process.exit(0);
  }
  if (!args.json) console.log('result:findings');
  process.exit(1);
}

main();
