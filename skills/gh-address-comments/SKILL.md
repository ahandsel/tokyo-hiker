---
name: gh-address-comments
description: Help address review/issue comments on the open GitHub PR for the current branch using gh CLI; verify gh auth first and prompt the user to authenticate if not logged in.
metadata:
  short-description: Address comments in a GitHub PR review
---

# PR Comment Handler

Guide to find the open PR for the current branch and address its comments with gh CLI. Run all `gh` commands with elevated network access.

Prereq: ensure `gh` is authenticated (for example, run `gh auth login` once), then run `gh auth status` with escalated permissions (include workflow/repo scopes) so `gh` commands succeed. If sandboxing blocks `gh auth status`, approve the command when prompted or adjust permission settings to allow it.


## 1) Inspect comments needing attention

* Run the bundled script, which prints every comment and review thread on the PR as JSON:

  ```bash
  node skills/gh-address-comments/scripts/fetch-pr-comments.mjs
  ```

* Each entry under `review_threads` carries `isResolved` and `isOutdated`. Treat a resolved or outdated thread as already handled unless the user says otherwise.


## 2) Ask the user for clarification

* Number all the review threads and comments and provide a short summary of what would be required to apply a fix for it
* Ask the user which numbered comments should be addressed


## 3) If user chooses comments

* Apply fixes for the selected comments

Notes:

* If gh hits auth/rate issues mid-run, prompt the user to re-authenticate with `gh auth login`, then retry.


## Bundled resources


### scripts/fetch-pr-comments.mjs

Dumps every comment on the pull request for the current branch as JSON.

```bash
node skills/gh-address-comments/scripts/fetch-pr-comments.mjs
node skills/gh-address-comments/scripts/fetch-pr-comments.mjs > notes/2026-09-29-pr-comments.json
```

Options:

* `-h`, `--help` - show the help message and exit.

Output keys:

* `pull_request` - number, url, title, state, owner, and repo.
* `conversation_comments` - top-level comments on the pull request.
* `reviews` - review submissions, each with its state and body.
* `review_threads` - inline threads, each with `isResolved`, `isOutdated`, `path`, `line`, `resolvedBy`, and its comments.

Behavior:

* Uses `gh api graphql`, because the REST endpoints do not expose thread grouping or resolution state.
* Resolves the pull request from its url, so a cross-repository (fork) pull request reads from the right repository.
* Writes JSON to stdout and a summary line to stderr, so redirecting stdout yields clean JSON.
* Exits 0 on success, 1 when the fetch fails (not authenticated, no pull request for the branch, GraphQL error), and 2 on an unknown option.
