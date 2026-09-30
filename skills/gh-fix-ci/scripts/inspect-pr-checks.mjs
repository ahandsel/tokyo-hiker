#!/usr/bin/env node

// inspect-pr-checks.mjs notes
//
// General notes:
// * Purpose: find the failing checks on a pull request, fetch the GitHub Actions log for each one, and cut the log down to the part that explains the failure.
// * For every failing check it resolves the run id (and job id when present) out of the check's details url, reads the run metadata, then pulls the log and extracts a window around the last failure marker.
// * A check whose details url points somewhere other than GitHub Actions is reported as `external` and left alone, because only Actions logs are reachable through `gh`.
// * Requires the GitHub CLI installed and authenticated, and a path inside the target Git repository.
//
// Usage:
//   node skills/gh-fix-ci/scripts/inspect-pr-checks.mjs --repo . --pr 123
//   node skills/gh-fix-ci/scripts/inspect-pr-checks.mjs --repo . --pr https://github.com/org/repo/pull/123 --json
//   node skills/gh-fix-ci/scripts/inspect-pr-checks.mjs --repo . --max-lines 200 --context 40
//   node skills/gh-fix-ci/scripts/inspect-pr-checks.mjs --help
//
// Output:
// * A text report on stdout by default, one block per failing check, or a JSON object with `pr` and `results` keys when `--json` is given.
// * Exit codes follow the original tool, where a non-zero exit is the normal result of finding a problem: 0 means no failing check was detected, 1 means either failing checks were analyzed and reported or the inspection could not run, and 2 means the arguments were invalid.
// * Because 1 covers both outcomes, read the report rather than the exit code to tell a found failure from a broken run.
//
// Version history:
// * v1.0 - 2026-08-28 - Initial release. Ports inspect_pr_checks.py to a Node.js ES module, keeping its output shape, field fallbacks, and exit codes, and adding status emojis.

import { execFileSync } from 'node:child_process';

const FAILURE_CONCLUSIONS = new Set([
  'failure',
  'cancelled',
  'timed_out',
  'action_required',
]);

const FAILURE_STATES = new Set([
  'failure',
  'error',
  'cancelled',
  'timed_out',
  'action_required',
]);

const FAILURE_BUCKETS = new Set(['fail']);

const FAILURE_MARKERS = [
  'error',
  'fail',
  'failed',
  'traceback',
  'exception',
  'assert',
  'panic',
  'fatal',
  'timeout',
  'segmentation fault',
];

const DEFAULT_MAX_LINES = 160;
const DEFAULT_CONTEXT_LINES = 30;

const PENDING_LOG_MARKERS = [
  'still in progress',
  'log will be available when it is complete',
];

const HELP = `Inspect failing GitHub PR checks, fetch GitHub Actions logs, and extract a failure snippet.

Usage:
  node skills/gh-fix-ci/scripts/inspect-pr-checks.mjs [options]

Options:
  --repo <path>       Path inside the target Git repository (default: .).
  --pr <ref>          PR number or URL (default: the current branch's PR).
  --max-lines <n>     Maximum lines in a snippet or tail (default: ${DEFAULT_MAX_LINES}).
  --context <n>       Lines of context around the failure marker (default: ${DEFAULT_CONTEXT_LINES}).
  --json              Emit JSON instead of the text report.
  -h, --help          Show this message and exit.

Exit codes:
  0  No failing check was detected.
  1  Failing checks were analyzed and reported, or the inspection could not run.
  2  The arguments were invalid.

Note that 1 covers both a successful analysis of failing checks and a failure to
run at all, so read the report rather than the exit code to tell them apart.
`;

// Mirrors the original's GhResult: a non-zero exit is data to inspect, not an exception.
function runGh(args, cwd, { raw = false } = {}) {
  try {
    const stdout = execFileSync('gh', args, {
      cwd,
      encoding: raw ? 'buffer' : 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 256 * 1024 * 1024,
    });
    return { returncode: 0, stdout, stderr: '' };
  } catch (error) {
    const stdout = raw
      ? (error.stdout ?? Buffer.alloc(0))
      : error.stdout
        ? String(error.stdout)
        : '';
    const stderr = error.stderr ? String(error.stderr) : (error.message ?? '');
    // A missing gh binary has no exit status of its own.
    return { returncode: error.status ?? 1, stdout, stderr };
  }
}

function parseJsonOr(text, fallback) {
  try {
    return JSON.parse(text || fallback);
  } catch {
    return undefined;
  }
}

function parseArgs(argv) {
  const options = {
    repo: '.',
    pr: null,
    maxLines: DEFAULT_MAX_LINES,
    context: DEFAULT_CONTEXT_LINES,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      process.stdout.write(HELP);
      process.exit(0);
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    const value = argv[i + 1];
    const needsValue = ['--repo', '--pr', '--max-lines', '--context'].includes(
      arg,
    );
    if (!needsValue) {
      console.error(`❌ Unknown option: ${arg}. Run with --help for usage.`);
      process.exit(2);
    }
    if (value === undefined || value.startsWith('--')) {
      console.error(
        `❌ Option ${arg} needs a value. Run with --help for usage.`,
      );
      process.exit(2);
    }

    if (arg === '--repo') options.repo = value;
    if (arg === '--pr') options.pr = value;
    if (arg === '--max-lines' || arg === '--context') {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isFinite(parsed)) {
        console.error(`❌ Option ${arg} needs an integer, got: ${value}`);
        process.exit(2);
      }
      if (arg === '--max-lines') options.maxLines = parsed;
      else options.context = parsed;
    }
    i += 1;
  }

  return options;
}

function findGitRoot(start) {
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: start,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return out.trim();
  } catch {
    return null;
  }
}

function ensureGhAvailable(repoRoot) {
  const result = runGh(['auth', 'status'], repoRoot);
  if (result.returncode === 0) {
    return true;
  }
  const message = (result.stderr || result.stdout || '').trim();
  console.error(
    `❌ ${message || 'Error: gh is not installed, not on PATH, or not authenticated.'}`,
  );
  return false;
}

function resolvePr(prValue, repoRoot) {
  if (prValue) {
    return prValue;
  }
  const result = runGh(['pr', 'view', '--json', 'number'], repoRoot);
  if (result.returncode !== 0) {
    const message = (result.stderr || result.stdout || '').trim();
    console.error(`❌ ${message || 'Error: unable to resolve PR.'}`);
    return null;
  }
  const data = parseJsonOr(result.stdout, '{}');
  if (data === undefined) {
    console.error('❌ Error: unable to parse PR JSON.');
    return null;
  }
  if (!data?.number) {
    console.error('❌ Error: no PR number found.');
    return null;
  }
  return String(data.number);
}

// gh has changed the field names of `pr checks` across versions, so on a field
// error the available-field list in the message drives a second attempt.
function fetchChecks(prValue, repoRoot) {
  const primaryFields = [
    'name',
    'state',
    'conclusion',
    'detailsUrl',
    'startedAt',
    'completedAt',
  ];
  let result = runGh(
    ['pr', 'checks', prValue, '--json', primaryFields.join(',')],
    repoRoot,
  );

  if (result.returncode !== 0) {
    const message = [result.stderr, result.stdout]
      .filter(Boolean)
      .join('\n')
      .trim();
    const availableFields = parseAvailableFields(message);

    if (availableFields.length === 0) {
      console.error(`❌ ${message || 'Error: gh pr checks failed.'}`);
      return null;
    }

    const fallbackFields = [
      'name',
      'state',
      'bucket',
      'link',
      'startedAt',
      'completedAt',
      'workflow',
    ];
    const selectedFields = fallbackFields.filter((field) =>
      availableFields.includes(field),
    );
    if (selectedFields.length === 0) {
      console.error('❌ Error: no usable fields available for gh pr checks.');
      return null;
    }

    result = runGh(
      ['pr', 'checks', prValue, '--json', selectedFields.join(',')],
      repoRoot,
    );
    if (result.returncode !== 0) {
      const retryMessage = (result.stderr || result.stdout || '').trim();
      console.error(`❌ ${retryMessage || 'Error: gh pr checks failed.'}`);
      return null;
    }
  }

  const data = parseJsonOr(result.stdout, '[]');
  if (data === undefined) {
    console.error('❌ Error: unable to parse checks JSON.');
    return null;
  }
  if (!Array.isArray(data)) {
    console.error('❌ Error: unexpected checks JSON shape.');
    return null;
  }
  return data;
}

function normalizeField(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim().toLowerCase();
}

// gh reports an unsupported --json field by listing the supported ones after an
// "Available fields:" line, one per line. Every non-empty line after that marker
// is taken as a field name, matching the original tool.
function parseAvailableFields(message) {
  if (!message.includes('Available fields:')) {
    return [];
  }

  const fields = [];
  let collecting = false;
  for (const line of message.split(/\r?\n/)) {
    if (line.includes('Available fields:')) {
      collecting = true;
      continue;
    }
    if (!collecting) continue;
    const field = line.trim();
    if (field) fields.push(field);
  }
  return fields;
}

function isFailing(check) {
  if (FAILURE_CONCLUSIONS.has(normalizeField(check.conclusion))) {
    return true;
  }
  if (FAILURE_STATES.has(normalizeField(check.state ?? check.status))) {
    return true;
  }
  return FAILURE_BUCKETS.has(normalizeField(check.bucket));
}

function extractRunId(url) {
  if (!url) return null;
  for (const pattern of [/\/actions\/runs\/(\d+)/, /\/runs\/(\d+)/]) {
    const match = pattern.exec(url);
    if (match) return match[1];
  }
  return null;
}

function extractJobId(url) {
  if (!url) return null;
  return (
    (/\/actions\/runs\/\d+\/job\/(\d+)/.exec(url) ??
      /\/job\/(\d+)/.exec(url))?.[1] ?? null
  );
}

function fetchRunMetadata(runId, repoRoot) {
  const fields = [
    'conclusion',
    'status',
    'workflowName',
    'name',
    'event',
    'headBranch',
    'headSha',
    'url',
  ];
  const result = runGh(
    ['run', 'view', runId, '--json', fields.join(',')],
    repoRoot,
  );
  if (result.returncode !== 0) return null;

  const data = parseJsonOr(result.stdout, '{}');
  if (
    data === undefined ||
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    return null;
  }
  return data;
}

function fetchRepoSlug(repoRoot) {
  const result = runGh(['repo', 'view', '--json', 'nameWithOwner'], repoRoot);
  if (result.returncode !== 0) return null;
  const data = parseJsonOr(result.stdout, '{}');
  return data?.nameWithOwner ? String(data.nameWithOwner) : null;
}

function isLogPendingMessage(message) {
  const lowered = message.toLowerCase();
  return PENDING_LOG_MARKERS.some((marker) => lowered.includes(marker));
}

function isZipPayload(payload) {
  return payload.length >= 2 && payload[0] === 0x50 && payload[1] === 0x4b;
}

function fetchRunLog(runId, repoRoot) {
  const result = runGh(['run', 'view', runId, '--log'], repoRoot);
  if (result.returncode !== 0) {
    const error = (result.stderr || result.stdout || '').trim();
    return { log: '', error: error || 'gh run view failed' };
  }
  return { log: result.stdout, error: '' };
}

function fetchJobLog(jobId, repoRoot) {
  const repoSlug = fetchRepoSlug(repoRoot);
  if (!repoSlug) {
    return {
      log: '',
      error: 'Error: unable to resolve repository name for job logs.',
    };
  }

  const endpoint = `/repos/${repoSlug}/actions/jobs/${jobId}/logs`;
  const result = runGh(['api', endpoint], repoRoot, { raw: true });
  const stdoutBuffer = Buffer.isBuffer(result.stdout)
    ? result.stdout
    : Buffer.from(result.stdout);

  if (result.returncode !== 0) {
    const message = (result.stderr || stdoutBuffer.toString('utf8')).trim();
    return { log: '', error: message || 'gh api job logs failed' };
  }
  if (isZipPayload(stdoutBuffer)) {
    return {
      log: '',
      error: 'Job logs returned a zip archive; unable to parse.',
    };
  }
  return { log: stdoutBuffer.toString('utf8'), error: '' };
}

// A run log that is not ready yet may still have a readable per-job log, so the
// pending case falls back to the job endpoint before giving up.
function fetchCheckLog(runId, jobId, repoRoot) {
  const { log, error } = fetchRunLog(runId, repoRoot);
  if (!error) {
    return { log, error: '', status: 'ok' };
  }

  if (isLogPendingMessage(error) && jobId) {
    const job = fetchJobLog(jobId, repoRoot);
    if (job.log) {
      return { log: job.log, error: '', status: 'ok' };
    }
    if (job.error && isLogPendingMessage(job.error)) {
      return { log: '', error: job.error, status: 'pending' };
    }
    if (job.error) {
      return { log: '', error: job.error, status: 'error' };
    }
    return { log: '', error, status: 'pending' };
  }

  if (isLogPendingMessage(error)) {
    return { log: '', error, status: 'pending' };
  }

  return { log: '', error, status: 'error' };
}

// Python's str.splitlines() drops a single trailing newline rather than yielding
// a trailing empty element, which a plain split on newline would produce.
function splitLines(text) {
  const lines = String(text).split(/\r\n|\n|\r/);
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function findFailureIndex(lines) {
  for (let idx = lines.length - 1; idx >= 0; idx -= 1) {
    const lowered = lines[idx].toLowerCase();
    if (FAILURE_MARKERS.some((marker) => lowered.includes(marker))) {
      return idx;
    }
  }
  return null;
}

function extractFailureSnippet(logText, maxLines, context) {
  const lines = splitLines(logText);
  if (lines.length === 0) return '';

  const markerIndex = findFailureIndex(lines);
  if (markerIndex === null) {
    return lines.slice(Math.max(0, lines.length - maxLines)).join('\n');
  }

  const start = Math.max(0, markerIndex - context);
  const end = Math.min(lines.length, markerIndex + context);
  let window = lines.slice(start, end);
  if (window.length > maxLines) {
    window = window.slice(window.length - maxLines);
  }
  return window.join('\n');
}

function tailLines(text, maxLines) {
  if (maxLines <= 0) return '';
  const lines = splitLines(text);
  return lines.slice(Math.max(0, lines.length - maxLines)).join('\n');
}

function analyzeCheck(check, repoRoot, maxLines, context) {
  const url = check.detailsUrl || check.link || '';
  const runId = extractRunId(url);
  const jobId = extractJobId(url);
  const base = {
    name: check.name ?? '',
    detailsUrl: url,
    runId,
    jobId,
  };

  if (runId === null) {
    base.status = 'external';
    base.note = 'No GitHub Actions run id detected in detailsUrl.';
    return base;
  }

  const metadata = fetchRunMetadata(runId, repoRoot);
  const { log, error, status } = fetchCheckLog(runId, jobId, repoRoot);

  if (status === 'pending') {
    base.status = 'log_pending';
    base.note = error || 'Logs are not available yet.';
    if (metadata) base.run = metadata;
    return base;
  }

  if (error) {
    base.status = 'log_unavailable';
    base.error = error;
    if (metadata) base.run = metadata;
    return base;
  }

  base.status = 'ok';
  base.run = metadata ?? {};
  base.logSnippet = extractFailureSnippet(log, maxLines, context);
  base.logTail = tailLines(log, maxLines);
  return base;
}

function indentBlock(text, prefix = '  ') {
  return splitLines(text)
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

function renderResults(prNumber, results) {
  console.log(`❌ PR #${prNumber}: ${results.length} failing checks analyzed.`);

  for (const result of results) {
    console.log('-'.repeat(60));
    console.log(`Check: ${result.name ?? ''}`);
    if (result.detailsUrl) console.log(`Details: ${result.detailsUrl}`);
    if (result.runId) console.log(`Run ID: ${result.runId}`);
    if (result.jobId) console.log(`Job ID: ${result.jobId}`);
    console.log(`Status: ${result.status ?? 'unknown'}`);

    const runMeta = result.run ?? {};
    if (Object.keys(runMeta).length > 0) {
      const branch = runMeta.headBranch ?? '';
      const sha = (runMeta.headSha ?? '').slice(0, 12);
      const workflow = runMeta.workflowName || runMeta.name || '';
      const conclusion = runMeta.conclusion || runMeta.status || '';
      console.log(`Workflow: ${workflow} (${conclusion})`);
      if (branch || sha) console.log(`Branch/SHA: ${branch} ${sha}`);
      if (runMeta.url) console.log(`Run URL: ${runMeta.url}`);
    }

    if (result.note) console.log(`Note: ${result.note}`);

    if (result.error) {
      console.log(`⚠️  Error fetching logs: ${result.error}`);
      continue;
    }

    const snippet = result.logSnippet || '';
    if (snippet) {
      console.log('Failure snippet:');
      console.log(indentBlock(snippet, '  '));
    } else {
      console.log('No snippet available.');
    }
  }

  console.log('-'.repeat(60));
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  const repoRoot = findGitRoot(options.repo);
  if (repoRoot === null) {
    console.error('❌ Error: not inside a Git repository.');
    return 1;
  }

  if (!ensureGhAvailable(repoRoot)) {
    return 1;
  }

  const prValue = resolvePr(options.pr, repoRoot);
  if (prValue === null) {
    return 1;
  }

  const checks = fetchChecks(prValue, repoRoot);
  if (checks === null) {
    return 1;
  }

  const failing = checks.filter(isFailing);
  if (failing.length === 0) {
    console.log(`✅ PR #${prValue}: no failing checks detected.`);
    return 0;
  }

  const maxLines = Math.max(1, options.maxLines);
  const context = Math.max(1, options.context);
  const results = failing.map((check) =>
    analyzeCheck(check, repoRoot, maxLines, context),
  );

  if (options.json) {
    console.log(JSON.stringify({ pr: prValue, results }, null, 2));
  } else {
    renderResults(prValue, results);
  }

  // Non-zero because failing checks were found, matching the original tool.
  return 1;
}

process.exit(main());
