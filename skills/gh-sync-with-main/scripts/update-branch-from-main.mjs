#!/usr/bin/env node

// update-branch-from-main.mjs notes
// General notes:
// * Purpose: Bring the current git branch up to date with a base branch
//   (default `main`) using rebase by default, or merge when requested. Used by
//   the gh-sync-with-main skill.
// * Refuses to run while checked out on the base branch and refuses a dirty
//   working tree unless --allow-dirty is passed.
// * Fetches the base branch from the remote first, then rebases or merges onto
//   the remote-tracking ref (e.g. origin/main). Exits on the first git failure
//   and leaves the repository in git's native conflict state for manual
//   resolution.
// * With --verify, runs a read-only assessment instead: it fetches the base
//   branch (updating the remote-tracking ref only), reports the ahead and
//   behind commit counts, previews conflicts, and prints a recommendation. It
//   never rebases, merges, or changes the branch or working tree.
// Usage:
//   node skills/gh-sync-with-main/scripts/update-branch-from-main.mjs
//   node skills/gh-sync-with-main/scripts/update-branch-from-main.mjs --strategy merge
//   node skills/gh-sync-with-main/scripts/update-branch-from-main.mjs --base-branch main --remote origin
//   node skills/gh-sync-with-main/scripts/update-branch-from-main.mjs --allow-dirty
//   node skills/gh-sync-with-main/scripts/update-branch-from-main.mjs --verify
// Options:
//   --base-branch <name>  Base branch to sync from. Defaults to main.
//   --remote <name>       Remote to fetch from. Defaults to origin.
//   --strategy <mode>     Update strategy: rebase or merge. Defaults to rebase.
//                         In --verify mode this selects the recommended strategy.
//   --allow-dirty         Allow updating even if the working tree has local changes.
//   --verify              Read-only assessment. Report ahead and behind counts,
//                         a conflict preview, and a recommendation without
//                         rebasing, merging, or changing the branch.
//   --help, -h            Show this message.
// Output:
// * Sync mode: prints the planned git commands, then runs them, then a final
//   status line.
// * Verify mode: prints the fetch plan, then a read-only assessment (branch,
//   base, working tree, ahead and behind counts, conflict preview, and a
//   recommendation), then a final status line.
// * Status emojis: ✅ success or up to date, ⚠️ refusal or sync recommended,
//   ❌ git command failure.
// * Exit codes: 0 success (including a completed --verify assessment, whatever
//   it recommends), 1 refusal (on base branch, dirty tree, no branch),
//   2 invalid arguments, or the failing git command's exit code.
// Version history:
// * v1.2 - 2026-09-29 - Fail on a rev-list error instead of reporting 0 behind, separate "git too old" from a merge-tree error in the conflict preview, and reject ref values starting with "-".
// * v1.1 - 2026-07-14 - Add --verify read-only assessment mode (ahead and behind
//   counts, merge-tree conflict preview, and a recommendation) with no changes.
// * v1.0 - 2026-06-08 - Initial release. Port of update_branch_from_main.py to a Node.js ES module.

import { spawnSync } from 'node:child_process';

function printUsage() {
  console.log(`Usage: node update-branch-from-main.mjs [options]

Bring the current git branch up to date with a base branch. Rebases by default
for a clean linear history; use --strategy merge when history should not be
rewritten. Use --verify for a read-only check that reports the sync status
without changing anything.

Options:
  --base-branch <name>  Base branch to sync from. Defaults to main.
  --remote <name>       Remote to fetch from. Defaults to origin.
  --strategy <mode>     Update strategy: rebase or merge. Defaults to rebase.
                        In --verify mode this selects the recommended strategy.
  --allow-dirty         Allow updating even if the working tree has local
                        changes. Ignored in --verify mode.
  --verify              Read-only assessment. Fetch the base branch, then report
                        the ahead and behind counts, a conflict preview, and a
                        recommendation without rebasing, merging, or changing
                        the branch or working tree.
  --help, -h            Show this message.

Exit codes:
  0  Success, including a completed --verify assessment whatever it recommends.
  1  Refusal (checked out on the base branch, dirty working tree, or the
     current branch could not be determined).
  2  Invalid arguments.
  *  The failing git command's exit code on a git error.
`);
}

function fail(code, message) {
  console.error(message);
  process.exit(code);
}

// Run git and capture its output. Used for read-only inspection commands.
function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.error) {
    fail(1, `❌ Failed to run git: ${result.error.message}`);
  }
  return result;
}

// Values that reach git as ref names must not look like git options.
function requireRefValue(flag, value) {
  if (!value) fail(2, `❌ ${flag} requires a value.`);
  if (value.startsWith('-')) {
    fail(2, `❌ ${flag} value must not start with "-": ${value}`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    baseBranch: 'main',
    remote: 'origin',
    strategy: 'rebase',
    allowDirty: false,
    verify: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
        break;
      case '--base-branch':
        options.baseBranch = requireRefValue('--base-branch', argv[++i]);
        break;
      case '--remote':
        options.remote = requireRefValue('--remote', argv[++i]);
        break;
      case '--strategy':
        options.strategy = argv[++i];
        if (options.strategy !== 'rebase' && options.strategy !== 'merge') {
          fail(2, '❌ --strategy must be "rebase" or "merge".');
        }
        break;
      case '--allow-dirty':
        options.allowDirty = true;
        break;
      case '--verify':
        options.verify = true;
        break;
      default:
        fail(2, `❌ Unknown argument: ${arg}. Run with --help for usage.`);
    }
  }

  return options;
}

function ensureGitRepo() {
  const result = git(['rev-parse', '--show-toplevel']);
  if (result.status !== 0) {
    fail(1, '❌ Not inside a git repository.');
  }
}

function currentBranch() {
  return git(['branch', '--show-current']).stdout.trim();
}

function isWorktreeClean() {
  return git(['status', '--short']).stdout.trim() === '';
}

function printPlan(commands) {
  console.log('Plan:');
  for (const command of commands) {
    console.log(`  ${command.join(' ')}`);
  }
}

// Count the commits in a revision range, or exit with git's own status when
// the count cannot be trusted (never report 0 for a failed command).
function countCommits(range) {
  const args = ['rev-list', '--count', range];
  const result = git(args);
  if (result.status !== 0) {
    const code = result.status === null ? 1 : result.status;
    fail(
      code,
      `❌ Command failed with exit code ${code}: git ${args.join(' ')}\n${(result.stderr || '').trim()}`,
    );
  }
  const count = Number(result.stdout.trim());
  if (!Number.isInteger(count)) {
    fail(
      1,
      `❌ Unexpected output from git ${args.join(' ')}: ${result.stdout}`,
    );
  }
  return count;
}

// Return true when the installed git is at least the given major.minor version.
// Used to gate the merge-tree conflict preview, which requires git 2.38+.
function gitVersionAtLeast(major, minor) {
  const match = git(['--version']).stdout.match(/(\d+)\.(\d+)/);
  if (!match) return false;
  const [, gotMajor, gotMinor] = match.map(Number);
  return gotMajor > major || (gotMajor === major && gotMinor >= minor);
}

// Preview whether merging baseRef into HEAD would conflict. The trial merge
// touches no refs, index, or working tree; it may leave loose tree objects in
// .git/objects that git gc reclaims. Returns { state, detail } where state is
// "none", "likely", or "unknown".
function previewConflicts(baseRef) {
  if (!gitVersionAtLeast(2, 38)) {
    return { state: 'unknown', detail: 'requires git 2.38+' };
  }
  const result = git(['merge-tree', '--write-tree', baseRef, 'HEAD']);
  if (result.status === 0) return { state: 'none', detail: '' };
  if (result.status === 1) return { state: 'likely', detail: '' };
  const firstLine = (result.stderr || '').trim().split('\n')[0] || '';
  return {
    state: 'unknown',
    detail: `git merge-tree exited ${result.status}${firstLine ? `: ${firstLine}` : ''}`,
  };
}

// Read-only assessment: fetch the base branch, then report ahead and behind
// counts, a conflict preview, and a recommendation. Never changes the branch.
function verify(options, branch) {
  const baseRef = `${options.remote}/${options.baseBranch}`;

  console.log(
    'Verify mode: read-only assessment (no rebase, merge, or working-tree changes).',
  );
  console.log('');
  printPlan([['git', 'fetch', options.remote, options.baseBranch]]);

  // Fetch to make the counts accurate. This updates the remote-tracking ref
  // only; it does not touch the current branch or working tree.
  const fetch = spawnSync(
    'git',
    ['fetch', options.remote, options.baseBranch],
    { stdio: 'inherit' },
  );
  if (fetch.status !== 0) {
    const code = fetch.status === null ? 1 : fetch.status;
    fail(
      code,
      `❌ Command failed with exit code ${code}: git fetch ${options.remote} ${options.baseBranch}`,
    );
  }

  if (git(['rev-parse', '--verify', '--quiet', baseRef]).status !== 0) {
    fail(
      1,
      `❌ Could not resolve ${baseRef} after fetch. Check the remote and base branch names.`,
    );
  }

  const ahead = countCommits(`${baseRef}..HEAD`);
  const behind = countCommits(`HEAD..${baseRef}`);
  const clean = isWorktreeClean();
  const conflicts = previewConflicts(baseRef);

  let recommendation;
  if (behind === 0) {
    recommendation = 'up to date';
  } else if (conflicts.state === 'likely') {
    recommendation = `sync recommended (${options.strategy}), resolve conflicts manually`;
  } else {
    recommendation = `sync recommended (${options.strategy})`;
  }

  console.log('');
  console.log(`Branch: ${branch}`);
  console.log(`Base: ${baseRef}`);
  console.log(`Working tree: ${clean ? 'clean' : 'has uncommitted changes'}`);
  console.log(`Ahead of base: ${ahead} commit(s)`);
  console.log(`Behind base: ${behind} commit(s)`);
  console.log(
    `Conflicts (merge preview): ${conflicts.state}${conflicts.detail ? ` (${conflicts.detail})` : ''}`,
  );
  console.log(`Recommendation: ${recommendation}`);
  console.log('');

  if (behind === 0) {
    console.log(`✅ ${branch} is up to date with ${baseRef}. No sync needed.`);
  } else {
    console.log(
      `⚠️ ${recommendation}. ${branch} is behind ${baseRef} by ${behind} commit(s).`,
    );
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  ensureGitRepo();

  const branch = currentBranch();
  if (!branch) {
    fail(1, '⚠️ Could not determine the current branch.');
  }

  if (branch === options.baseBranch) {
    const action = options.verify ? 'verify' : 'update';
    fail(
      1,
      `⚠️ Refusing to ${action} while checked out on ${options.baseBranch}. Switch to a feature branch first.`,
    );
  }

  if (options.verify) {
    verify(options, branch);
    return;
  }

  if (!options.allowDirty && !isWorktreeClean()) {
    fail(
      1,
      '⚠️ Working tree is not clean. Commit, stash, or rerun with --allow-dirty.',
    );
  }

  const baseRef = `${options.remote}/${options.baseBranch}`;
  const commands = [['git', 'fetch', options.remote, options.baseBranch]];
  if (options.strategy === 'rebase') {
    commands.push(['git', 'rebase', baseRef]);
  } else {
    commands.push(['git', 'merge', baseRef]);
  }

  printPlan(commands);

  for (const [, ...args] of commands) {
    const result = spawnSync('git', args, { stdio: 'inherit' });
    if (result.status !== 0) {
      const code = result.status === null ? 1 : result.status;
      fail(
        code,
        `❌ Command failed with exit code ${code}: git ${args.join(' ')}`,
      );
    }
  }

  console.log(
    `✅ Branch ${branch} is now updated from ${baseRef} using ${options.strategy}.`,
  );
}

main();
