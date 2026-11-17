// check.mjs notes
//
// General notes:
// * Purpose: Run every check a change must pass before it merges into main,
//   in one command: the lint pipeline, the naming and include linters, the
//   tests, the site build, and the sitemap check.
// * The lint stage runs `pnpm lint`, which applies the Prettier and
//   markdownlint fixes in place, so the later stages check the fixed files.
//   The closing summary lists every file the check edited, ready to review
//   and commit. The build writes only to the gitignored
//   contents/.vitepress/dist and cache folders.
// * Every stage runs even when an earlier one fails, so one run reports every
//   problem. The sitemap check is the exception: it reads the build output,
//   so it is skipped when the build fails.
// * Each stage calls a package.json script, so the check stays in step with
//   the commands it wraps.
//
// Usage:
//   pnpm check
//   node scripts/check.mjs
//   node scripts/check.mjs --help
//
// Output:
// * One line per stage as it starts, then ✅ or ❌ with its duration. A failed
//   stage also prints the last lines of its command output, where each tool
//   puts its verdict. Rerun the stage command on its own to see everything.
// * A ⚠️ warning when the working tree has uncommitted changes, because the
//   stages then check files that are not part of the branch yet.
// * A ⚠️ list of the files the check edited, so the fixes can be reviewed and
//   committed.
// * A closing summary. Exit 0 when every stage passes, 1 when any stage fails
//   or is skipped, 2 on bad arguments. Edits alone do not fail the check.
//
// Version history:
// * v1.1 - 2026-11-17 - Require pnpm 12 or newer in the missing-pnpm error.
// * v1.0 - 2026-11-17 - Initial release.

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const HELP = `Run every check a change must pass before it merges into main.

Usage:
  pnpm check
  node scripts/check.mjs [--help]

Stages, in order:
  1. Lint and format        pnpm lint (applies fixes in place)
  2. File and folder names  pnpm lint-naming
  3. Include directives     pnpm lint-includes
  4. Tests                  pnpm test
  5. Site build             pnpm build
  6. Sitemap                pnpm check-sitemap (skipped when the build fails)

Every stage runs even when an earlier one fails. The lint stage edits files in
place, and the summary lists every file the check edited so you can commit it.

Options:
  -h, --help    Show this help.

Exit codes: 0 = every stage passed, 1 = a stage failed, 2 = bad arguments.`;

const STAGES = [
  { label: 'Lint and format', script: 'lint' },
  { label: 'File and folder names', script: 'lint-naming' },
  { label: 'Include directives', script: 'lint-includes' },
  { label: 'Tests', script: 'test' },
  { label: 'Site build', script: 'build' },
  { label: 'Sitemap', script: 'check-sitemap', needs: 'build' },
];

// A failed stage prints this many lines from the end of its output.
const OUTPUT_TAIL_LINES = 40;

const repoRoot = resolve(import.meta.dirname, '..');

function commandFor(stage) {
  return ['pnpm', stage.script, ...(stage.args ?? [])].join(' ');
}

// Run one stage with its output captured, so a passing stage stays to a
// single line and a failing one can print what went wrong. --silent drops
// pnpm's own command echo and lifecycle error, leaving the tool output.
function runStage(stage) {
  const started = performance.now();
  const result = spawnSync(
    'pnpm',
    ['--silent', 'run', stage.script, ...(stage.args ?? [])],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  if (result.error?.code === 'ENOENT') {
    console.error('❌ pnpm not found. Install pnpm 12 or newer first.');
    process.exit(1);
  }
  return {
    ok: result.status === 0,
    seconds: ((performance.now() - started) / 1000).toFixed(1),
    output: `${result.stdout ?? ''}${result.stderr ?? ''}${result.error?.message ?? ''}`,
  };
}

function printTail(stage, output) {
  const lines = output.trimEnd().split('\n');
  if (lines.length > OUTPUT_TAIL_LINES) {
    console.log(
      `   ... showing the last ${OUTPUT_TAIL_LINES} of ${lines.length} lines. Run ${commandFor(stage)} to see them all.`,
    );
  }
  for (const line of lines.slice(-OUTPUT_TAIL_LINES)) console.log(`   ${line}`);
}

function hasUncommittedChanges() {
  try {
    return (
      execFileSync('git', ['status', '--porcelain'], {
        cwd: repoRoot,
        encoding: 'utf8',
      }).trim() !== ''
    );
  } catch {
    return false;
  }
}

// The files that differ from the index, plus new files that are not
// gitignored. A file outside this list matches the index, so only these need
// their contents saved to tell later which files the check edited.
function dirtyFiles() {
  try {
    return execFileSync(
      'git',
      ['ls-files', '-z', '--modified', '--others', '--exclude-standard'],
      { cwd: repoRoot, encoding: 'utf8' },
    )
      .split('\0')
      .filter(Boolean);
  } catch {
    return [];
  }
}

// A deleted or unreadable file reads as null.
function readOrNull(file) {
  try {
    return readFileSync(resolve(repoRoot, file));
  } catch {
    return null;
  }
}

function snapshotDirtyFiles() {
  return new Map(dirtyFiles().map((file) => [file, readOrNull(file)]));
}

// A file the check edited is either newly dirty, or was dirty already and now
// has different contents, including one an edit put back to the index state.
function editedFiles(snapshot) {
  const edited = new Set(dirtyFiles().filter((file) => !snapshot.has(file)));
  for (const [file, before] of snapshot) {
    const now = readOrNull(file);
    const same =
      before === null ? now === null : now !== null && before.equals(now);
    if (!same) edited.add(file);
  }
  return [...edited].sort();
}

const argv = process.argv.slice(2);
if (argv.includes('-h') || argv.includes('--help')) {
  console.log(HELP);
  process.exit(0);
}
if (argv.length > 0) {
  console.error(
    `❌ Unknown argument ${JSON.stringify(argv[0])}. Run with --help to see the usage.`,
  );
  process.exit(2);
}

console.log(
  `🔍 Checking that this branch is ready to merge into main (${STAGES.length} stages).`,
);
if (hasUncommittedChanges()) {
  console.log(
    '⚠️  The working tree has uncommitted changes, so the stages check files that are not committed yet.',
  );
}

const snapshot = snapshotDirtyFiles();
const results = new Map();
for (const stage of STAGES) {
  console.log(`\n▶️  ${stage.label}: ${commandFor(stage)}`);

  if (stage.needs && results.get(stage.needs) !== 'passed') {
    console.log(`⚠️  Skipped, because pnpm ${stage.needs} did not pass.`);
    results.set(stage.script, 'skipped');
    continue;
  }

  const { ok, seconds, output } = runStage(stage);
  results.set(stage.script, ok ? 'passed' : 'failed');
  if (ok) {
    console.log(`✅ Passed in ${seconds}s.`);
  } else {
    printTail(stage, output);
    console.log(`❌ Failed in ${seconds}s.`);
  }
}

const edited = editedFiles(snapshot);
const notPassed = STAGES.filter(
  (stage) => results.get(stage.script) !== 'passed',
);

console.log('');
if (edited.length > 0) {
  console.log(
    `⚠️  The check edited ${edited.length} file${edited.length === 1 ? '' : 's'}. Review the changes and commit them:`,
  );
  for (const file of edited) console.log(`   ${file}`);
}
if (notPassed.length === 0) {
  console.log(
    `✅ All ${STAGES.length} stages passed. ${edited.length > 0 ? 'Commit the edits above, and this' : 'This'} branch is ready to merge into main.`,
  );
  process.exit(0);
}
console.error(
  `❌ ${notPassed.length} of ${STAGES.length} stages did not pass, so this branch is not ready to merge into main:`,
);
for (const stage of notPassed) {
  console.error(`   ${stage.label} (${results.get(stage.script)})`);
}
process.exit(1);
