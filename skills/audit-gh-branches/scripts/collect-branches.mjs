#!/usr/bin/env node

// collect-branches.mjs notes
// General notes:
// * Purpose: Read-only inventory of every local and remote branch in the current
//   repository, with ahead/behind, merge status, cherry-pick duplication, last
//   commit, and a proposed disposition (safe-to-delete, deletion-candidate,
//   needs-rebase, ice, keep-active). Drives the audit-gh-branches skill.
// * Runs `git fetch --all --prune` first by default. Use --no-fetch to operate
//   on the current local snapshot only.
// * A branch that exists both locally and on the remote is classified on the
//   local ref whenever the local ref holds commits the remote lacks (unpushed
//   work) and the remote is not ahead of local; otherwise the remote ref
//   governs. When both sides have unique commits (diverged), delete
//   dispositions are refused. Both sets of numbers are kept in the record
//   (localAhead, remoteAhead, localMerged, remoteMerged, and
//   localAheadOfRemote).
// * Never deletes, rebases, pushes, or modifies any branch. Only reads.
// Usage:
//   node skills/audit-gh-branches/scripts/collect-branches.mjs
//   node skills/audit-gh-branches/scripts/collect-branches.mjs --format markdown
//   node skills/audit-gh-branches/scripts/collect-branches.mjs --base-branch develop
//   node skills/audit-gh-branches/scripts/collect-branches.mjs --remote upstream
//   node skills/audit-gh-branches/scripts/collect-branches.mjs --stale-days 90
//   node skills/audit-gh-branches/scripts/collect-branches.mjs --no-fetch
// Options:
//   --base-branch <name>  Integration branch. Defaults to main.
//   --remote <name>       Remote to inventory. Defaults to origin.
//   --stale-days <n>      Days after which a branch is considered stale. Defaults to 60.
//   --format <fmt>        Output format: json (default) or markdown.
//   --no-fetch            Skip the initial `git fetch --all --prune`.
//   --help, -h            Show this message.
// Output:
// * JSON object on stdout (default) with a `branches` array of records, or a
//   Markdown summary table when --format markdown is given.
// * One status line on stderr summarizing counts per disposition.
// * Exit codes: 0 success, 1 git failure, 2 invalid arguments.
// Version history:
// * v1.3 - 2026-09-29 - Refuse safe-to-delete and deletion-candidate when local and remote have diverged (both sides have unique commits).
// * v1.2 - 2026-09-29 - Make keep-active reachable (0 behind), classify local+remote branches on the local ref when it has unpushed commits, keep both local and remote stats, reject ref values starting with "-", and exit 1 on every git failure.
// * v1.1 - 2026-09-06 - Import into tokyo-geek; drop the retired prompt-file reference from the notes.
// * v1.0 - 2026-06-16 - Initial release. Replaces inline data-gathering steps.

import { spawnSync } from 'node:child_process';

function printUsage() {
  console.log(`Usage: node collect-branches.mjs [options]

Inventory every local and remote branch in the current repository and propose a
disposition for each one. Read-only: only \`git fetch\` is allowed.

Options:
  --base-branch <name>  Integration branch. Defaults to main.
  --remote <name>       Remote to inventory. Defaults to origin.
  --stale-days <n>      Days after which a branch is stale. Defaults to 60.
  --format <fmt>        Output format: json (default) or markdown.
  --no-fetch            Skip the initial \`git fetch --all --prune\`.
  --help, -h            Show this message.

Exit codes:
  0  Success.
  1  Git failure (missing repo, missing base branch, failed git command, etc.).
  2  Invalid arguments.
`);
}

function fail(code, message) {
  console.error(`❌ ${message}`);
  process.exit(code);
}

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.error) fail(1, `Failed to run git: ${result.error.message}`);
  return result;
}

function gitOk(args, { allowEmpty = false } = {}) {
  const r = git(args);
  if (r.status !== 0) {
    fail(1, `git ${args.join(' ')} failed:\n${(r.stderr || '').trim()}`);
  }
  if (!allowEmpty && r.stdout == null) return '';
  return r.stdout;
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
    baseBranch: 'main',
    remote: 'origin',
    staleDays: 60,
    format: 'json',
    doFetch: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
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
      case '--format':
        opts.format = argv[++i];
        if (opts.format !== 'json' && opts.format !== 'markdown') {
          fail(2, '--format must be "json" or "markdown".');
        }
        break;
      case '--no-fetch':
        opts.doFetch = false;
        break;
      default:
        fail(2, `Unknown argument: ${a}. Run with --help for usage.`);
    }
  }
  return opts;
}

function ensureGitRepo() {
  const r = gitTry(['rev-parse', '--show-toplevel']);
  if (!r.ok) fail(1, 'Not inside a git repository.');
}

function refExists(ref) {
  return gitTry(['rev-parse', '--verify', '--quiet', ref]).ok;
}

function resolveBaseRef(opts) {
  // Prefer the remote-tracking base (e.g. origin/main); fall back to local base.
  const remoteRef = `${opts.remote}/${opts.baseBranch}`;
  if (refExists(remoteRef)) return remoteRef;
  if (refExists(opts.baseBranch)) return opts.baseBranch;
  fail(
    1,
    `Base branch not found. Tried "${remoteRef}" and "${opts.baseBranch}".`,
  );
}

function listLocalBranches() {
  // name TAB lastDate TAB lastAuthor TAB upstream TAB upstreamTrack
  const fmt =
    '%(refname:short)\t%(committerdate:short)\t%(authorname)\t%(upstream:short)\t%(upstream:track)';
  const out = gitOk(['for-each-ref', `--format=${fmt}`, 'refs/heads/']);
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, lastDate, lastAuthor, upstream, track] = line.split('\t');
      return {
        name,
        lastDate,
        lastAuthor: lastAuthor || 'unknown',
        upstream: upstream || null,
        upstreamGone: /\[gone\]/.test(track || ''),
      };
    });
}

function listRemoteBranches(remote) {
  const fmt = '%(refname:short)\t%(committerdate:short)\t%(authorname)';
  const out = gitOk([
    'for-each-ref',
    `--format=${fmt}`,
    `refs/remotes/${remote}/`,
  ]);
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [refName, lastDate, lastAuthor] = line.split('\t');
      // refName looks like "origin/feature-x". Drop entries that do not match
      // the expected prefix (e.g. the bare "origin" symbolic ref or "origin/HEAD").
      const prefix = `${remote}/`;
      if (!refName.startsWith(prefix)) return null;
      const shortName = refName.slice(prefix.length);
      if (!shortName || shortName === 'HEAD') return null;
      return {
        name: shortName,
        fullName: refName,
        lastDate,
        lastAuthor: lastAuthor || 'unknown',
      };
    })
    .filter(Boolean);
}

// Commits reachable from `ref` but not `baseRef` (ahead) and the reverse (behind).
function aheadBehind(baseRef, ref) {
  const r = gitTry([
    'rev-list',
    '--left-right',
    '--count',
    `${baseRef}...${ref}`,
  ]);
  if (!r.ok) return { ahead: null, behind: null };
  const [behind, ahead] = r.stdout
    .trim()
    .split(/\s+/)
    .map((n) => Number(n));
  return { ahead, behind };
}

function isMerged(baseRef, ref) {
  return gitTry(['merge-base', '--is-ancestor', ref, baseRef]).ok;
}

function cherryStats(baseRef, ref) {
  const r = gitTry(['cherry', baseRef, ref]);
  if (!r.ok) return { unique: 0, duplicated: 0 };
  let unique = 0;
  let duplicated = 0;
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('+ ')) unique++;
    else if (line.startsWith('- ')) duplicated++;
  }
  return { unique, duplicated };
}

// Everything classify() needs about one ref, measured against the base.
function statsAgainstBase(baseRef, ref) {
  const { ahead, behind } = aheadBehind(baseRef, ref);
  return {
    ref,
    ahead,
    behind,
    merged: isMerged(baseRef, ref),
    cherry: cherryStats(baseRef, ref),
  };
}

function classify({
  merged,
  ahead,
  behind,
  lastDate,
  cherry,
  staleCutoffDate,
}) {
  if (merged || ahead === 0) {
    return {
      disposition: 'safe-to-delete',
      reason: merged ? 'Fully merged into base' : 'No commits ahead of base',
    };
  }
  if (cherry.unique === 0 && cherry.duplicated > 0) {
    return {
      disposition: 'deletion-candidate',
      reason: 'All commits patch-equivalent in base (squash or cherry-pick)',
    };
  }
  if (lastDate && lastDate < staleCutoffDate) {
    return {
      disposition: 'ice',
      reason: `Stale: last commit ${lastDate} is before cutoff ${staleCutoffDate}`,
    };
  }
  if (behind === 0) {
    return {
      disposition: 'keep-active',
      reason: 'Up to date with base and recently active',
    };
  }
  return {
    disposition: 'needs-rebase',
    reason:
      behind == null
        ? 'Has unique commits; behind count unknown'
        : `Has unique commits and is ${behind} behind base`,
  };
}

function computeStaleCutoff(staleDays) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000);
  return cutoff.toISOString().slice(0, 10);
}

function buildIndex(opts) {
  const baseRef = resolveBaseRef(opts);
  const locals = listLocalBranches();
  const remotes = listRemoteBranches(opts.remote);

  const staleCutoffDate = computeStaleCutoff(opts.staleDays);
  const byName = new Map();
  const localStatsByName = new Map();

  for (const local of locals) {
    if (local.name === opts.baseBranch) continue;
    const stats = statsAgainstBase(baseRef, local.name);
    localStatsByName.set(local.name, stats);
    const cls = classify({
      ...stats,
      lastDate: local.lastDate,
      staleCutoffDate,
    });
    byName.set(local.name, {
      name: local.name,
      sanitized: local.name.replace(/\//g, '-'),
      location: local.upstreamGone ? 'local-only-remote-gone' : 'local',
      localLastDate: local.lastDate,
      localLastAuthor: local.lastAuthor,
      lastDate: local.lastDate,
      lastAuthor: local.lastAuthor,
      upstream: local.upstream,
      upstreamGone: local.upstreamGone,
      ahead: stats.ahead,
      behind: stats.behind,
      merged: stats.merged,
      localAhead: stats.ahead,
      localBehind: stats.behind,
      localMerged: stats.merged,
      remoteAhead: null,
      remoteBehind: null,
      remoteMerged: null,
      localAheadOfRemote: null,
      remoteAheadOfLocal: null,
      cherryUnique: stats.cherry.unique,
      cherryDuplicated: stats.cherry.duplicated,
      duplicatedElsewhere: stats.cherry.duplicated > 0,
      disposition: cls.disposition,
      reason: cls.reason,
      baseRef,
      ref: stats.ref,
    });
  }

  for (const remote of remotes) {
    if (remote.name === opts.baseBranch) continue;
    const ref = remote.fullName; // origin/<name>
    const existing = byName.get(remote.name);
    const remoteStats = statsAgainstBase(baseRef, ref);
    if (existing) {
      const localStats = localStatsByName.get(remote.name);
      // Commits only on the local ref (unpushed) and only on the remote ref.
      const divergence = aheadBehind(ref, localStats.ref);
      const localAheadOfRemote = divergence.ahead;
      const remoteAheadOfLocal = divergence.behind;
      const diverged =
        (localAheadOfRemote ?? 0) > 0 && (remoteAheadOfLocal ?? 0) > 0;
      // The local ref governs when it holds commits the remote lacks and the
      // remote is not ahead of local, so unpushed work is never reported as
      // merged or safe to delete. When both sides have unique commits, pick
      // the ref with more commits ahead of base, then refuse delete
      // dispositions. Otherwise the remote ref is a superset of the local one
      // and governs.
      let governLocal;
      let governing;
      if (diverged) {
        governLocal = (localStats.ahead ?? 0) >= (remoteStats.ahead ?? 0);
        governing = governLocal ? localStats : remoteStats;
      } else {
        governLocal = (localAheadOfRemote ?? 0) > 0;
        governing = governLocal ? localStats : remoteStats;
      }
      // Prefer the newer of the two commit dates for the staleness check.
      const lastDate =
        remote.lastDate > existing.localLastDate
          ? remote.lastDate
          : existing.localLastDate;
      const lastAuthor =
        remote.lastDate > existing.localLastDate
          ? remote.lastAuthor
          : existing.localLastAuthor;
      let cls = classify({
        ...governing,
        lastDate,
        staleCutoffDate,
      });
      if (
        diverged &&
        (cls.disposition === 'safe-to-delete' ||
          cls.disposition === 'deletion-candidate')
      ) {
        cls = {
          disposition: 'needs-rebase',
          reason: `Diverged from remote (${localAheadOfRemote} unpushed, ${remoteAheadOfLocal} remote-only); not safe to delete`,
        };
      } else if (governLocal && !diverged) {
        cls = {
          ...cls,
          reason: `${cls.reason}; ${localAheadOfRemote} unpushed local commit(s)`,
        };
      } else if (diverged) {
        cls = {
          ...cls,
          reason: `${cls.reason}; diverged (${localAheadOfRemote} unpushed, ${remoteAheadOfLocal} remote-only)`,
        };
      }
      byName.set(remote.name, {
        ...existing,
        location: 'local-and-remote',
        remoteLastDate: remote.lastDate,
        remoteLastAuthor: remote.lastAuthor,
        lastDate,
        lastAuthor,
        ahead: governing.ahead,
        behind: governing.behind,
        merged: governing.merged,
        remoteAhead: remoteStats.ahead,
        remoteBehind: remoteStats.behind,
        remoteMerged: remoteStats.merged,
        localAheadOfRemote,
        remoteAheadOfLocal,
        cherryUnique: governing.cherry.unique,
        cherryDuplicated: governing.cherry.duplicated,
        duplicatedElsewhere: governing.cherry.duplicated > 0,
        disposition: cls.disposition,
        reason: cls.reason,
        ref: governing.ref,
      });
    } else {
      const cls = classify({
        ...remoteStats,
        lastDate: remote.lastDate,
        staleCutoffDate,
      });
      byName.set(remote.name, {
        name: remote.name,
        sanitized: remote.name.replace(/\//g, '-'),
        location: 'remote',
        remoteLastDate: remote.lastDate,
        remoteLastAuthor: remote.lastAuthor,
        lastDate: remote.lastDate,
        lastAuthor: remote.lastAuthor,
        upstream: null,
        upstreamGone: false,
        ahead: remoteStats.ahead,
        behind: remoteStats.behind,
        merged: remoteStats.merged,
        localAhead: null,
        localBehind: null,
        localMerged: null,
        remoteAhead: remoteStats.ahead,
        remoteBehind: remoteStats.behind,
        remoteMerged: remoteStats.merged,
        localAheadOfRemote: null,
        remoteAheadOfLocal: null,
        cherryUnique: remoteStats.cherry.unique,
        cherryDuplicated: remoteStats.cherry.duplicated,
        duplicatedElsewhere: remoteStats.cherry.duplicated > 0,
        disposition: cls.disposition,
        reason: cls.reason,
        baseRef,
        ref,
      });
    }
  }

  return {
    baseBranch: opts.baseBranch,
    baseRef,
    remote: opts.remote,
    staleDays: opts.staleDays,
    staleCutoffDate,
    branches: [...byName.values()].sort((a, b) => {
      const order = [
        'safe-to-delete',
        'deletion-candidate',
        'needs-rebase',
        'ice',
        'keep-active',
      ];
      const da = order.indexOf(a.disposition);
      const db = order.indexOf(b.disposition);
      if (da !== db) return da - db;
      return (b.lastDate || '').localeCompare(a.lastDate || '');
    }),
  };
}

const LOCATION_LABEL = {
  local: 'Local',
  remote: 'Remote',
  'local-and-remote': 'Local + Remote',
  'local-only-remote-gone': 'Local (remote gone)',
};

const DISPOSITION_LABEL = {
  'safe-to-delete': 'Safe to delete',
  'deletion-candidate': 'Deletion candidate',
  'needs-rebase': 'Needs rebase',
  ice: 'Ice',
  'keep-active': 'Keep active',
};

function locationLabel(b) {
  const base = LOCATION_LABEL[b.location] || b.location;
  if (b.localAheadOfRemote > 0) {
    return `${base} (${b.localAheadOfRemote} unpushed)`;
  }
  return base;
}

function buildMarkdown(index) {
  const rows = index.branches.map((b) => {
    const dup =
      b.cherryDuplicated > 0 && b.cherryUnique === 0
        ? 'Yes (all)'
        : b.cherryDuplicated > 0
          ? `Partial (${b.cherryDuplicated}/${b.cherryDuplicated + b.cherryUnique})`
          : 'No';
    return [
      b.name,
      locationLabel(b),
      b.lastDate || '',
      `${b.ahead ?? '?'} / ${b.behind ?? '?'}`,
      b.merged ? 'Yes' : 'No',
      dup,
      DISPOSITION_LABEL[b.disposition] || b.disposition,
      b.reason,
    ];
  });

  const headers = [
    'Branch',
    'Local/Remote',
    'Last commit',
    'Ahead/Behind',
    'Merged?',
    'Duplicated elsewhere?',
    'Disposition',
    'One-line reason',
  ];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)),
  );
  const pad = (s, w) => String(s ?? '').padEnd(w, ' ');
  const lines = [];
  lines.push(
    `# Branch audit summary - base: ${index.baseRef}, stale cutoff: ${index.staleCutoffDate}`,
  );
  lines.push('');
  lines.push(`| ${headers.map((h, i) => pad(h, widths[i])).join(' | ')} |`);
  lines.push(`| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`);
  for (const r of rows) {
    lines.push(`| ${r.map((c, i) => pad(c, widths[i])).join(' | ')} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function summarizeCounts(index) {
  const counts = {};
  for (const b of index.branches) {
    counts[b.disposition] = (counts[b.disposition] || 0) + 1;
  }
  return counts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  ensureGitRepo();

  if (opts.doFetch) {
    const r = spawnSync('git', ['fetch', '--all', '--prune'], {
      stdio: 'inherit',
    });
    if (r.status !== 0) fail(1, '`git fetch --all --prune` failed.');
  }

  const index = buildIndex(opts);

  if (opts.format === 'markdown') {
    process.stdout.write(`${buildMarkdown(index)}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(index, null, 2)}\n`);
  }

  const counts = summarizeCounts(index);
  const summary = Object.entries(counts)
    .map(([k, v]) => `${DISPOSITION_LABEL[k] || k}: ${v}`)
    .join(', ');
  console.error(
    `✅ Inventoried ${index.branches.length} branch(es) against ${index.baseRef} (${summary}).`,
  );
}

main();
