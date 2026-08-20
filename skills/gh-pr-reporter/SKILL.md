---
name: gh-pr-reporter
description: Fetch all comments on a GitHub pull request (reviews, inline review comments, and general issue comments) and emit a single consolidated Markdown report. Use when a user wants to read, summarize, audit, or triage every comment on a PR in one place. Accepts a PR number, a `owner/repo#n` reference, or a github.com pull-request URL.
---

# gh PR reporter

Compile every comment on a GitHub pull request into a single Markdown report so the user can read or triage them in one place.

For the given PR, this skill collects:

1. **Reviews** - the review summary bodies and their state (`APPROVED`, `CHANGES_REQUESTED`, `COMMENTED`, `DISMISSED`).
2. **Inline review comments** - the line-anchored comments attached to a review, grouped by file and threaded by reply.
3. **General comments** - the top-level PR discussion ("issue comments" in the GitHub REST API).

The skill only reads from GitHub. It never posts, edits, or resolves comments.


## Required input

A pull request identifier in any of these forms:

* **Number only:** `498` - uses the repo of the current working directory (resolved via `gh repo view`).
* **Owner/repo + number:** `owner/example-repo#498`.
* **GitHub URL:** `https://github.com/owner/example-repo/pull/498` (an `/issues/<n>` URL with the same number is also accepted).

If the user gives a bare number while the current directory is not a clone of the target repo, ask for the repo or pass `--repo owner/repo` to the helper.


## Prerequisites

* `gh` CLI installed and authenticated (`gh auth status` succeeds).
* Read access to the target repo.
* Node.js 24+ for running the helper.


## Quick start

```bash
# Report on PR 498 in the current repo.
node skills/gh-pr-reporter/scripts/get-pr-comments.mjs 498

# Report on a PR in another repo by URL.
node skills/gh-pr-reporter/scripts/get-pr-comments.mjs https://github.com/owner/example-repo/pull/498

# Report on a PR in another repo by ref.
node skills/gh-pr-reporter/scripts/get-pr-comments.mjs owner/example-repo#498

# Override the repo when only a number is given.
node skills/gh-pr-reporter/scripts/get-pr-comments.mjs 498 --repo owner/example-repo

# Emit JSON for further processing instead of Markdown.
node skills/gh-pr-reporter/scripts/get-pr-comments.mjs 498 --json
```

Exit codes:

* `0` - success.
* `1` - fetch failure (authentication, network, or PR not found).
* `2` - invalid arguments.


## Default workflow

1. **Resolve the PR reference.** Accept whatever the user provided (number, `owner/repo#n`, or URL). If it is a bare number, confirm the current working directory is a clone of the target repo or ask for `--repo`.
2. **Run the helper.** Invoke `node skills/gh-pr-reporter/scripts/get-pr-comments.mjs <pr-ref>` from the repo root. Capture stdout as the Markdown report.
3. **Show the report to the user.** Display the helper's stdout directly. The helper already groups, sorts, and formats the content.
4. **Optional follow-up.** When the user asks for a summary or for action items, summarize from the report - do not re-fetch from GitHub.


## Report structure

The Markdown report has four sections in this order:

1. **Header.** PR title and link, author, state (`open`, `draft`, `merged`, `closed`), source and base branch, last updated timestamp, and counts.
2. **Reviews.** One block per review, sorted by submission time. Each block lists the reviewer, the review state, the timestamp, a link to the review on GitHub, and the review body as a blockquote.
3. **Inline review comments.** Grouped by file path, then by the root comment of each thread. Each thread shows the line (or line range), the root comment, and any replies indented underneath, all as blockquotes with author and timestamp.
4. **General comments.** Top-level PR discussion comments in chronological order.

Empty sections render as a single italicized placeholder ("_No reviews yet._", "_No inline comments._", "_No general comments._") so the user still sees the structure.


## Bundled resources


### scripts/get-pr-comments.mjs

The helper does all GitHub I/O.

Behavior:

* Parses `<pr-ref>` into `{ owner, repo, number }`. Resolves the repo from `gh repo view` when only a number is given.
* Fetches PR metadata, reviews, inline review comments, and issue comments using `gh api --paginate` with a page size of 100. Multi-page responses are concatenated and re-merged into a single array.
* Builds a Markdown report or, with `--json`, dumps a `{ pr, reviews, reviewComments, issueComments }` object on stdout.
* Prints a one-line success summary to stderr (so it does not pollute the report when stdout is piped to a file).
* Exits `0` on success, `1` on fetch failure, `2` on invalid arguments.

The helper only reads from GitHub. It never writes, posts, or resolves anything.


## Constraints

* Use the bundled helper - do not call `gh api` directly. The helper handles ref parsing, pagination, threading, and consistent formatting.
* Do not invent or paraphrase comments. The report quotes every comment body verbatim. When summarizing for the user, mark paraphrases as such and keep authors and timestamps intact.
* Do not post, edit, resolve, or react to any comment from this skill. For write actions on PR comments, use the [`gh-cli`][] skill instead.
* Do not strip or rewrite bot comments (for example, `@Copilot` review bodies). They count as comments and belong in the report.
* Bodies that contain Markdown that itself uses `>` blockquotes will look nested in the output - this is expected and does not need to be flattened.


## Related skills

* [`gh-cli`][] - general-purpose GitHub CLI usage, including replying to or resolving comments after this skill surfaces them.

[`gh-cli`]: ../gh-cli/SKILL.md
