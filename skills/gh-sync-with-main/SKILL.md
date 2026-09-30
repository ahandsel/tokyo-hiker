---
name: gh-sync-with-main
description: Bring the current git branch up to date with commits from the main branch, or check whether it needs syncing without changing it. Use when the user asks to pull latest main, sync/refresh the branch, rebase onto main, merge main into a feature branch, or verify how far the branch is ahead of or behind main.
---

# GitHub sync with main branch skill


## Overview

Update the checked out branch from `main` with a small helper script instead of rebuilding the git sequence from scratch. Prefer rebase for a clean linear history, and switch to merge only when the user or repository workflow requires it.
Pass `--verify` for a read-only check that reports how far the branch is ahead of or behind `main`, previews conflicts, and recommends a strategy without changing anything.


## Workflow

1. Confirm the repository state first.
   * Run `git status --short`.
   * Run `git branch --show-current`.
   * Stop if the user is already on `main`.
2. Choose the update strategy.
   * Default to `rebase`.
   * Use `merge` when the user explicitly asks to merge, the branch is already shared and history should not be rewritten, or the repository conventions prefer merge commits.
   * In this repository the long-lived working branch is `dev` and pull requests target `main`. Rebasing `dev` rewrites history that is already on `origin/dev`, so confirm with the user or prefer `merge` when syncing `dev` itself.
3. Run the helper script.

   ```bash
   node "skills/gh-sync-with-main/scripts/update-branch-from-main.mjs"
   ```

4. Add flags only when needed.

   ```bash
   node "skills/gh-sync-with-main/scripts/update-branch-from-main.mjs" --strategy merge
   node "skills/gh-sync-with-main/scripts/update-branch-from-main.mjs" --base-branch main --remote origin
   node "skills/gh-sync-with-main/scripts/update-branch-from-main.mjs" --allow-dirty
   ```


## Verify mode

When the user only wants to know whether the branch needs syncing, run the script with `--verify` instead of syncing.
This mode is read-only: it fetches the base branch to update the remote-tracking ref, then reports the status without rebasing, merging, or changing the branch or working tree.

```bash
node "skills/gh-sync-with-main/scripts/update-branch-from-main.mjs" --verify
node "skills/gh-sync-with-main/scripts/update-branch-from-main.mjs" --verify --strategy merge
```

The report includes the branch name, the base ref, the working tree state, the ahead and behind commit counts, a conflict preview, and a recommendation.

* The recommendation is one of `up to date`, `sync recommended (rebase)`, or `sync recommended (merge)`, and it notes `resolve conflicts manually` when the conflict preview is `likely`.
* The `--strategy` flag selects which strategy the recommendation names; it defaults to `rebase`.
* The conflict preview uses `git merge-tree` and needs git 2.38 or newer. On older git it reports `unknown`.
* Verify exits `0` once the assessment completes, whatever it recommends, so the exit code does not signal whether a sync is needed. Read the recommendation from the output.


## Conflict handling

If git reports conflicts, stop normal automation and guide the user through resolution.

* For rebase conflicts: resolve files, `git add <files>`, then `git rebase --continue`.
* For merge conflicts: resolve files, `git add <files>`, then `git commit`.
* If the user wants to cancel: `git rebase --abort` or `git merge --abort`.


## After syncing

This repository's agent permissions deny `git push`, so never attempt to push the updated branch yourself.
Tell the user what to run and suggest they type it in the prompt so it runs in the session:

* After a merge or a fast-forward: `! git push`
* After a rebase of a branch that was already pushed: `! git push --force-with-lease`


## Guardrails

* Refuse to run on `main`. This applies to `--verify` as well, because there is nothing to compare against.
* Refuse to run with a dirty working tree unless the user explicitly accepts `--allow-dirty`. Note that `--allow-dirty` pairs best with `merge`, because `git rebase` still refuses to run with unstaged changes even after the script's own clean-tree check is bypassed. The dirty-tree refusal does not apply to `--verify`, which never changes the working tree.
* Fetch `origin/main` before changing history.
* Prefer `origin/main` over a stale local `main`.
* Show the exact git commands before execution so the user can see the plan.
* Use `--verify` when the user asks only to check the branch. It never rebases, merges, or edits the branch or working tree.


## Script behavior

The helper script:

* verifies the current branch is not the base branch
* checks whether the working tree is clean unless `--allow-dirty` is passed
* fetches the chosen base branch from the chosen remote
* rebases onto `origin/main` by default, or merges `origin/main` when requested
* exits immediately on the first git failure and leaves the repository in git's native conflict state for manual resolution
* with `--verify`, fetches the base branch and then reports the ahead and behind counts, a `git merge-tree` conflict preview, and a recommendation, without rebasing, merging, or changing the branch or working tree
