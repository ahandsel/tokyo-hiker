#!/usr/bin/env node

// extract-branch-notes.mjs notes
// General notes:
// * Purpose: For a single branch, write the unique commits (relative to a base
//   branch) as a `unique-commits.patch` file and a populated `summary.md`
//   scaffold into an audit folder. Used by the audit-gh-branches skill to
//   capture branch content before a branch is retired.
// * Read-only against git: never deletes, rebases, pushes, or modifies any
//   branch.
// * Handles local-only, remote-only, and local+remote branches. When a branch
//   exists on both sides, the governing ref is resolved with the same rule as
//   collect-branches.mjs: the local ref governs when it holds commits the
//   remote lacks, otherwise the remote ref does. A branch that has diverged in
//   both directions is extracted from whichever ref is further ahead of base,
//   and the divergence is called out in summary.md and on stderr.
// * The patch is streamed from git straight to disk, so its size is not
//   limited by the child-process output buffer.
// Usage:
//   node skills/audit-gh-branches/scripts/extract-branch-notes.mjs <branch> --output-dir <dir>
//   node skills/audit-gh-branches/scripts/extract-branch-notes.mjs <branch> --output-dir <dir> --base-branch main
//   node skills/audit-gh-branches/scripts/extract-branch-notes.mjs <branch> --output-dir <dir> --remote origin
//   node skills/audit-gh-branches/scripts/extract-branch-notes.mjs <branch> --output-dir <dir> --stale-days 90
//   node skills/audit-gh-branches/scripts/extract-branch-notes.mjs <branch> --output-dir <dir> --force
// Options:
//   <branch>              Branch name (without remote prefix), e.g. feature-x.
//   --output-dir <dir>    Audit folder root (e.g. notes/2026-06-16-branch-audit). Required.
//   --base-branch <name>  Base branch. Defaults to main.
//   --remote <name>       Remote used to resolve a remote-only branch. Defaults to origin.
//   --stale-days <n>      Days after which a branch is considered stale. Defaults to 60.
//                         Pass the same value given to collect-branches.mjs.
//   --force               Overwrite an existing summary.md (the patch is always overwritten).
//   --help, -h            Show this message.
// Output:
// * <output-dir>/<sanitized-branch>/unique-commits.patch  - full git log -p
//   of <base>..<branch> in chronological (--reverse) order.
// * <output-dir>/<sanitized-branch>/summary.md            - markdown scaffold
//   pre-filled with metadata, key commits, and files of interest.
// * One status line on stderr.
// * Exit codes: 0 success, 1 git failure, 2 invalid arguments,
//   3 refused overwrite (summary.md exists; pass --force to overwrite).
// Version history:
// * v1.3 - 2026-09-29 - Resolve the governing ref with the same rule as collect-branches.mjs v1.3 instead of always preferring the local ref, and report two-way divergence in summary.md and on stderr.
// * v1.2 - 2026-09-29 - Stream the patch to disk (no 1 MiB buffer limit), add --stale-days, make keep-active reachable, reject ref values starting with "-", exit 1 on every git failure, and remove a partial patch on failure.
// * v1.1 - 2026-09-06 - Import into tokyo-geek; drop the retired prompt-file reference from the notes.
// * v1.0 - 2026-06-16 - Initial release. Extracted from inline data-gathering steps.

import { spawnSync } from 'node:child_process';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

function printUsage() {
  console.log(`Usage: node extract-branch-notes.mjs <branch> --output-dir <dir> [options]

Extract the unique commits of <branch> against a base branch and write
\`unique-commits.patch\` and a populated \`summary.md\` scaffold under
<output-dir>/<sanitized-branch>/.

Arguments:
  <branch>              Branch name (without remote prefix), e.g. feature-x.

Options:
  --output-dir <dir>    Audit folder root (e.g. notes/2026-06-16-branch-audit).
                        Required.
  --base-branch <name>  Base branch. Defaults to main.
  --remote <name>       Remote for resolving remote-only branches. Defaults to
                        origin.
  --stale-days <n>      Days after which a branch is stale. Defaults to 60.
                        Pass the same value given to collect-branches.mjs.
  --force               Overwrite an existing summary.md (the patch is always
                        overwritten).
  --help, -h            Show this message.

Exit codes:
  0  Success.
  1  Git failure (missing branch, missing base, no unique commits, failed git
     command, etc.).
  2  Invalid arguments.
  3  Refused overwrite of an existing summary.md (pass --force).
`);
}

function fail(code, message) {
  console.error(`❌ ${message}`);
  process.exit(code);
}

function git(args) {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  if (r.error) fail(1, `Failed to run git: ${r.error.message}`);
  return r;
}

function gitOk(args) {
  const r = git(args);
  if (r.status !== 0) {
    fail(1, `git ${args.join(' ')} failed:\n${(r.stderr || '').trim()}`);
  }
  return r.stdout || '';
}

function gitTry(args) {
  const r = git(args);
  return { ok: r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '' };
}

// Values that reach git as ref names must not look like git options.
function requireRefValue(flag, value) {
  if (!value) fail(2, `${flag} requires a value.`);
  if (value.startsWith('-')) {
    fail(2, `${flag} value must not start with "-": ${value}`);
  }
  return value;
}

function parseArgs(argv) {
  const opts = {
    branch: null,
    outputDir: null,
    baseBranch: 'main',
    remote: 'origin',
    staleDays: 60,
    force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
        break;
      case '--output-dir':
        opts.outputDir = argv[++i];
        if (!opts.outputDir) fail(2, '--output-dir requires a value.');
        break;
      case '--base-branch':
        opts.baseBranch = requireRefValue('--base-branch', argv[++i]);
        break;
      case '--remote':
        opts.remote = requireRefValue('--remote', argv[++i]);
        break;
      case '--stale-days': {
        const v = Number(argv[++i]);
        if (!Number.isFinite(v) || v < 0)
          fail(2, '--stale-days requires a non-negative number.');
        opts.staleDays = v;
        break;
      }
      case '--force':
        opts.force = true;
        break;
      default:
        if (a.startsWith('-')) fail(2, `Unknown option: ${a}`);
        if (opts.branch !== null)
          fail(2, `Unexpected positional argument: ${a}`);
        opts.branch = a;
    }
  }
  if (!opts.branch) fail(2, 'Missing required <branch> argument.');
  if (!opts.outputDir) fail(2, 'Missing required --output-dir <dir>.');
  return opts;
}

function ensureGitRepo() {
  const r = gitTry(['rev-parse', '--show-toplevel']);
  if (!r.ok) fail(1, 'Not inside a git repository.');
}

function refExists(ref) {
  return gitTry(['rev-parse', '--verify', '--quiet', ref]).ok;
}

// Mirrors the ref-governance rule in collect-branches.mjs; keep the two in step.
// * Present on one side only: that ref governs.
// * Present on both, local holds commits the remote lacks: the local ref
//   governs, so unpushed work is never dropped from the extract.
// * Present on both, remote is a superset: the remote ref governs.
// * Diverged (both sides hold unique commits): the ref further ahead of base
//   governs, and the divergence is reported in summary.md and on stderr so the
//   commits left out of the patch are never silent.
function resolveBranchRef(branch, remote, baseRef) {
  const localExists = refExists(branch);
  const remoteRef = `${remote}/${branch}`;
  const remoteExists = refExists(remoteRef);
  if (!localExists && !remoteExists) {
    fail(1, `Branch not found locally or on ${remote}: "${branch}".`);
  }
  if (!remoteExists) return { ref: branch, divergence: null };
  if (!localExists) return { ref: remoteRef, divergence: null };

  // Commits only on the local ref (unpushed) and only on the remote ref.
  const { ahead: localAheadOfRemote, behind: remoteAheadOfLocal } = aheadBehind(
    remoteRef,
    branch,
  );
  const localOnly = localAheadOfRemote ?? 0;
  const remoteOnly = remoteAheadOfLocal ?? 0;
  if (localOnly > 0 && remoteOnly > 0) {
    const localAhead = aheadBehind(baseRef, branch).ahead ?? 0;
    const remoteAhead = aheadBehind(baseRef, remoteRef).ahead ?? 0;
    const ref = localAhead >= remoteAhead ? branch : remoteRef;
    return {
      ref,
      divergence: {
        localOnly,
        remoteOnly,
        otherRef: ref === branch ? remoteRef : branch,
      },
    };
  }
  return { ref: localOnly > 0 ? branch : remoteRef, divergence: null };
}

function resolveBaseRef(baseBranch, remote) {
  const remoteRef = `${remote}/${baseBranch}`;
  if (refExists(remoteRef)) return remoteRef;
  if (refExists(baseBranch)) return baseBranch;
  fail(1, `Base branch not found. Tried "${remoteRef}" and "${baseBranch}".`);
}

function sanitize(name) {
  return name.replace(/\//g, '-');
}

function listUniqueCommits(baseRef, branchRef) {
  // Hash, short hash, date, author, subject, separated by TABs.
  const fmt = '%H\t%h\t%cs\t%an\t%s';
  const out = gitOk([
    'log',
    '--reverse',
    `--format=${fmt}`,
    `${baseRef}..${branchRef}`,
  ]);
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, short, date, author, ...subjectParts] = line.split('\t');
      return { hash, short, date, author, subject: subjectParts.join('\t') };
    });
}

function listChangedFiles(baseRef, branchRef) {
  // numstat: <added>\t<deleted>\t<path>
  const out = gitOk([
    'log',
    '--reverse',
    '--pretty=format:',
    '--numstat',
    `${baseRef}..${branchRef}`,
  ]);
  const totals = new Map(); // path -> { added, deleted }
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    const [addedRaw, deletedRaw, ...pathParts] = line.split('\t');
    const path = pathParts.join('\t');
    if (!path) continue;
    const added = addedRaw === '-' ? 0 : Number(addedRaw) || 0;
    const deleted = deletedRaw === '-' ? 0 : Number(deletedRaw) || 0;
    const cur = totals.get(path) || { added: 0, deleted: 0 };
    cur.added += added;
    cur.deleted += deleted;
    totals.set(path, cur);
  }
  return [...totals.entries()]
    .map(([path, t]) => ({ path, ...t }))
    .sort((a, b) => b.added + b.deleted - (a.added + a.deleted));
}

function aheadBehind(baseRef, branchRef) {
  const r = gitTry([
    'rev-list',
    '--left-right',
    '--count',
    `${baseRef}...${branchRef}`,
  ]);
  if (!r.ok) return { ahead: null, behind: null };
  const [behind, ahead] = r.stdout.trim().split(/\s+/).map(Number);
  return { ahead, behind };
}

function isMerged(baseRef, branchRef) {
  return gitTry(['merge-base', '--is-ancestor', branchRef, baseRef]).ok;
}

function cherryStats(baseRef, branchRef) {
  const r = gitTry(['cherry', baseRef, branchRef]);
  if (!r.ok) return { unique: 0, duplicated: 0 };
  let unique = 0;
  let duplicated = 0;
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('+ ')) unique++;
    else if (line.startsWith('- ')) duplicated++;
  }
  return { unique, duplicated };
}

function describeLocation(branch, remote) {
  const local = refExists(branch);
  const remoteRef = `${remote}/${branch}`;
  const onRemote = refExists(remoteRef);
  if (local && onRemote) return 'Local + Remote';
  if (local) return `Local (remote ${remote}/${branch} gone)`;
  if (onRemote) return `Remote (${remote}/${branch})`;
  return 'Unknown';
}

// Mirrors classify() in collect-branches.mjs; keep the two in step.
function classify({
  merged,
  ahead,
  behind,
  lastDate,
  cherryUnique,
  cherryDuplicated,
  staleCutoffDate,
}) {
  if (merged || ahead === 0) {
    return merged
      ? 'Safe to delete (fully merged)'
      : 'Safe to delete (no commits ahead)';
  }
  if (cherryUnique === 0 && cherryDuplicated > 0) {
    return 'Deletion candidate (all commits patch-equivalent in base)';
  }
  if (lastDate && lastDate < staleCutoffDate) {
    return `Ice (stale: last commit ${lastDate} before cutoff ${staleCutoffDate})`;
  }
  if (behind === 0) {
    return 'Keep active (up to date with base, recently active)';
  }
  return behind == null
    ? 'Needs rebase (unique commits, behind count unknown)'
    : `Needs rebase (unique commits, ${behind} behind base)`;
}

function buildSummaryMarkdown({
  branch,
  branchRef,
  baseBranch,
  baseRef,
  commits,
  files,
  ahead,
  behind,
  merged,
  cherryUnique,
  cherryDuplicated,
  location,
  staleCutoffDate,
  divergence,
}) {
  const lastCommit = commits[commits.length - 1] || null;
  const disposition = classify({
    merged,
    ahead,
    behind,
    lastDate: lastCommit ? lastCommit.date : null,
    cherryUnique,
    cherryDuplicated,
    staleCutoffDate,
  });
  const lines = [];
  lines.push(`# ${branch}`);
  lines.push('');
  lines.push(`* **Disposition:** ${disposition}`);
  lines.push(`* **Branch ref:** \`${branchRef}\``);
  lines.push(`* **Base:** \`${baseRef}\` (\`${baseBranch}\`)`);
  lines.push(`* **Location:** ${location}`);
  if (divergence) {
    lines.push(
      `* **⚠️ Diverged:** ${divergence.localOnly} commit(s) only on the local ref, ${divergence.remoteOnly} only on the remote. This patch covers \`${branchRef}\` only; review \`${divergence.otherRef}\` separately before retiring the branch.`,
    );
  }
  if (lastCommit) {
    lines.push(`* **Last commit:** ${lastCommit.date} by ${lastCommit.author}`);
  }
  lines.push(
    `* **Ahead/behind ${baseBranch}:** ${ahead ?? '?'} ahead / ${behind ?? '?'} behind`,
  );
  lines.push(
    `* **Unique commits vs ${baseBranch}:** ${commits.length} (\`git cherry\`: +${cherryUnique} / -${cherryDuplicated})`,
  );
  lines.push('');
  lines.push('## What the unique work does');
  lines.push('');
  lines.push(
    '<!-- TODO: One paragraph describing the unique work on this branch. Reviewer fills this in. -->',
  );
  lines.push('');
  lines.push('## Key commits');
  lines.push('');
  if (commits.length === 0) {
    lines.push('_No unique commits found relative to the base._');
  } else {
    for (const c of commits) {
      lines.push(`* \`${c.short}\` ${c.subject}`);
    }
  }
  lines.push('');
  lines.push('## Files of interest');
  lines.push('');
  if (files.length === 0) {
    lines.push('_No file changes._');
  } else {
    const top = files.slice(0, 20);
    for (const f of top) {
      lines.push(`* \`${f.path}\` (+${f.added} / -${f.deleted})`);
    }
    if (files.length > top.length) {
      lines.push(
        `* ...and ${files.length - top.length} more (see [\`unique-commits.patch\`](./unique-commits.patch)).`,
      );
    }
  }
  lines.push('');
  lines.push('Full diff: [`unique-commits.patch`](./unique-commits.patch).');
  lines.push('');
  return lines.join('\n');
}

function computeStaleCutoff(days) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return cutoff.toISOString().slice(0, 10);
}

// Stream `git log -p` straight into the patch file. Piping through the child
// process buffer would abort with ENOBUFS once the patch exceeds 1 MiB.
function writePatch(baseRef, branchRef, patchPath, branchDir) {
  const args = ['log', '-p', '--reverse', `${baseRef}..${branchRef}`];
  const fd = openSync(patchPath, 'w');
  let r;
  try {
    r = spawnSync('git', args, {
      stdio: ['ignore', fd, 'pipe'],
      encoding: 'utf8',
    });
  } finally {
    closeSync(fd);
  }
  if (r.error || r.status !== 0) {
    // Do not leave a partial patch or an empty folder behind.
    rmSync(patchPath, { force: true });
    try {
      rmdirSync(branchDir);
    } catch {
      // Folder is not empty (pre-existing content); leave it alone.
    }
    const detail = r.error
      ? r.error.message
      : (r.stderr || '').trim() || `exit code ${r.status}`;
    fail(1, `git ${args.join(' ')} failed:\n${detail}`);
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  ensureGitRepo();

  const baseRef = resolveBaseRef(opts.baseBranch, opts.remote);
  const { ref: branchRef, divergence } = resolveBranchRef(
    opts.branch,
    opts.remote,
    baseRef,
  );

  const commits = listUniqueCommits(baseRef, branchRef);
  if (commits.length === 0) {
    fail(
      1,
      `No unique commits to extract: \`${branchRef}\` has nothing ahead of \`${baseRef}\`.`,
    );
  }

  const files = listChangedFiles(baseRef, branchRef);
  const { ahead, behind } = aheadBehind(baseRef, branchRef);
  const merged = isMerged(baseRef, branchRef);
  const cherry = cherryStats(baseRef, branchRef);
  const location = describeLocation(opts.branch, opts.remote);
  const staleCutoffDate = computeStaleCutoff(opts.staleDays);

  const sanitized = sanitize(opts.branch);
  const branchDir = join(opts.outputDir, sanitized);
  mkdirSync(branchDir, { recursive: true });

  const patchPath = join(branchDir, 'unique-commits.patch');
  writePatch(baseRef, branchRef, patchPath, branchDir);

  const summaryPath = join(branchDir, 'summary.md');
  if (existsSync(summaryPath) && !opts.force) {
    fail(
      3,
      `Refusing to overwrite existing ${summaryPath}. Re-run with --force to overwrite.`,
    );
  }
  const summary = buildSummaryMarkdown({
    branch: opts.branch,
    branchRef,
    baseBranch: opts.baseBranch,
    baseRef,
    commits,
    files,
    ahead,
    behind,
    merged,
    cherryUnique: cherry.unique,
    cherryDuplicated: cherry.duplicated,
    location,
    staleCutoffDate,
    divergence,
  });
  writeFileSync(summaryPath, summary);

  console.error(
    `✅ Extracted ${commits.length} commit(s) from ${branchRef} into ${branchDir}/ (patch + summary.md scaffold).`,
  );
  if (divergence) {
    console.error(
      `⚠️  ${opts.branch} has diverged: ${divergence.localOnly} commit(s) only on the local ref, ${divergence.remoteOnly} only on ${opts.remote}. Extracted from ${branchRef}; review \`${divergence.otherRef}\` separately.`,
    );
  }
}

main();
