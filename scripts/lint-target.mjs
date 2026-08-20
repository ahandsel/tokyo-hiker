// General notes:
//   Runs the repository lint pipeline against specific paths instead of the
//   whole tree. The pipeline is two stages and the order matters: Prettier
//   makes the bulk automatic edits first, then markdownlint-cli2 polishes the
//   result into the house style and has the last word. Running the stages in
//   the other order, or running only one of them, produces a different file.
//
//   This is the path-scoped form of `pnpm lint`. Use it when a task touches a
//   handful of files and a whole-repo format run would bury the real diff.
//
// Usage:
//   node scripts/lint-target.mjs <path> [<path>...] [options]
//   pnpm lint-target <path> [<path>...] [options]
//
//   Options:
//     --check       Report what would change without writing anything.
//     --help, -h    Show this help.
//
//   A path may be a file or a folder. Folders are scanned recursively.
//   Markdown files go through both stages; every other file type goes
//   through Prettier only.
//
// Output:
//   One line per stage with the files it touched, then a closing summary.
//   With --check, the files that would change are listed instead, and the
//   exit code is 1 when any file is out of date.
//
//   --check asks "does the pipeline change this file", not "is this file in
//   Prettier's output state". The two differ here: the second stage has the
//   last word, so a committed Markdown file is deliberately not in Prettier's
//   output state and `prettier --check` would fail on every one of them. The
//   check therefore snapshots the files, runs both stages, compares, and
//   restores the snapshot.
//
// Version history:
//   * v1.0 - 2026-08-19 - Initial version.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const HELP = `Run the repository lint pipeline against specific paths.

Usage:
  node scripts/lint-target.mjs <path> [<path>...] [options]
  pnpm lint-target <path> [<path>...] [options]

Options:
  --check       Report what would change without writing anything.
  -h, --help    Show this help.

The pipeline is two stages, in this order:
  1. Prettier makes the bulk automatic edits.
  2. markdownlint-cli2 polishes Markdown into the house style.

markdownlint has the last word, so the stages must run in that order.
A path may be a file or a folder; folders are scanned recursively.

Examples:
  pnpm lint-target contents/level-1/otama-walking-trail.md
  pnpm lint-target contents/level-1/ docs/
  pnpm lint-target --check contents/`;

const repoRoot = resolve(import.meta.dirname, '..');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

// Run a tool and hand back its output plus exit status. A lint tool uses a
// non-zero exit to report findings, so a failure here is data, not an error.
function run(command, args) {
  try {
    const stdout = execFileSync(command, args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, output: stdout };
  } catch (error) {
    if (error.code === 'ENOENT') {
      fail(`${command} not found. Run pnpm install first.`);
    }
    return {
      ok: false,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

function parseArgs(argv) {
  const paths = [];
  let check = false;

  for (const arg of argv) {
    if (arg === '--check') {
      check = true;
    } else if (arg.startsWith('-')) {
      fail(
        `Unknown option ${JSON.stringify(arg)}. Run with --help to see the usage.`,
      );
    } else {
      paths.push(arg);
    }
  }

  return { paths, check };
}

// Expand each path into the glob markdownlint-cli2 needs. A folder becomes a
// recursive Markdown glob; a Markdown file is passed through as-is; anything
// else has no second stage.
function markdownGlobFor(path) {
  const absolute = resolve(repoRoot, path);
  if (!existsSync(absolute)) fail(`No such file or folder: ${path}`);
  const rel = relative(repoRoot, absolute) || '.';
  if (statSync(absolute).isDirectory()) return `${rel}/**/*.md`;
  return rel.toLowerCase().endsWith('.md') ? rel : null;
}

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(HELP);
  process.exit(0);
}

const { paths, check } = parseArgs(argv);

if (paths.length === 0) {
  console.error('❌ No path given.\n');
  console.error(HELP);
  process.exit(1);
}

const markdownGlobs = paths.map(markdownGlobFor).filter(Boolean);

// The files under the given paths that the pipeline is allowed to touch.
// --cached picks up tracked files, --others --exclude-standard adds new files
// that are not gitignored, so a brand-new page is checked rather than skipped.
function targetFiles() {
  const listed = run('git', [
    'ls-files',
    '-z',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    ...paths,
  ]);
  return listed.output.split('\0').filter(Boolean);
}

// Run both stages in order. Prettier makes the bulk edits, markdownlint polishes.
function runPipeline() {
  const prettier = run('./node_modules/.bin/prettier', ['--write', ...paths]);
  let markdownlint = { ok: true, output: '' };
  if (markdownGlobs.length > 0) {
    markdownlint = run('./node_modules/.bin/markdownlint-cli2', [
      '--fix',
      ...markdownGlobs,
    ]);
  }
  return { prettier, markdownlint };
}

function report(stages) {
  console.log(`\n1️⃣  Prettier`);
  console.log(
    stages.prettier.output.trim().replace(/^/gm, '   ') ||
      '   (nothing to report)',
  );
  if (markdownGlobs.length > 0) {
    console.log(`\n2️⃣  markdownlint-cli2`);
    console.log(
      stages.markdownlint.output.trim().replace(/^/gm, '   ') ||
        '   (nothing to report)',
    );
  } else {
    console.log(
      '\n2️⃣  markdownlint-cli2 skipped, no Markdown in the given paths.',
    );
  }
}

console.log(
  `🔍 ${check ? 'Checking' : 'Linting'} ${paths.length} path${paths.length === 1 ? '' : 's'}: ${paths.join(', ')}`,
);

if (check) {
  // Snapshot, run the pipeline, compare, then put everything back. Restoring in
  // a finally keeps the working tree intact even if a stage throws.
  const files = targetFiles();
  const before = new Map(
    files.map((file) => [file, readFileSync(resolve(repoRoot, file))]),
  );

  let stages;
  let changed = [];
  try {
    stages = runPipeline();
    changed = files.filter(
      (file) => !readFileSync(resolve(repoRoot, file)).equals(before.get(file)),
    );
  } finally {
    for (const [file, contents] of before) {
      writeFileSync(resolve(repoRoot, file), contents);
    }
  }

  report(stages);

  console.log('');
  if (changed.length === 0) {
    console.log(
      `✅ Every file matches the lint pipeline output (${files.length} checked).`,
    );
    process.exit(0);
  }
  console.error(
    `❌ ${changed.length} file${changed.length === 1 ? '' : 's'} would change. Run the same command without --check.`,
  );
  for (const file of changed) console.error(`   ${file}`);
  process.exit(1);
}

const stages = runPipeline();
report(stages);

console.log('');
console.log('✅ Lint pipeline applied.');
if (!stages.prettier.ok || !stages.markdownlint.ok) {
  console.log(
    '⚠️  A tool reported findings it could not fix; see the output above.',
  );
  process.exit(1);
}
