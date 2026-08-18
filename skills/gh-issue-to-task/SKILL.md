---
name: gh-issue-to-task
description: Generate a `tasks/<n>-<slug>.md` scaffold from a GitHub issue. Fetches the issue via `gh`, extracts linked spec issues and Figma URLs, infers the Phrase project, tag, and branch, and writes a minimal task file matching the existing `tasks/` style. Pass `--enrich` to also pull the body of every linked spec issue into a Spec details section. Accepts an issue number, `owner/repo#n`, or a github.com issue URL.
---

# GitHub issue to task scaffold skill

Generate a new `tasks/<issue-number>-<slug>.md` scaffold from a GitHub issue so a writer does not have to hand-copy links, infer the Phrase project, or set up the standard sections each time.

The scaffold matches the canonical shape documented in [`task-template.md`][], which covers both the minimal layout (default) and the enriched layout (with `--enrich`).
Drafting the UX copy itself is out of scope; this skill prepares the file so a writer can drop copy into the empty `## UX copy` table afterward.

[`task-template.md`]: task-template.md


## Required input

A GitHub issue identifier in any of these forms:

| Form                | Example                                            | Notes                                                                         |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Number only         | `494`                                              | Uses the repo of the current working directory (resolved via `gh repo view`). |
| Owner/repo + number | `owner/example-repo#494`                           |                                                                               |
| GitHub URL          | `https://github.com/owner/example-repo/issues/494` |                                                                               |

If the user gives a bare number while the current directory is not a clone of the target repo, ask for the repo or pass `--repo owner/repo` to the helper.


## Optional flags

* **`--enrich`** - after fetching the primary issue, also fetch every linked GitHub issue (cross-repo allowed) and include their bodies as subsections under `## Spec details`.
  Default off, because most issues are sparse and an enriched scaffold for a sparse issue is mostly empty headings.


## Prerequisites

* `gh` CLI installed and authenticated (`gh auth status` succeeds).
* Read access to the target repo and to every linked repo if `--enrich` is used.
* Node.js 24+ for running the helper.


## Quick start

```bash
# Minimal scaffold for issue 494 in the current repo.
node skills/gh-issue-to-task/scripts/fetch-issue.mjs 494

# Issue in another repo by URL.
node skills/gh-issue-to-task/scripts/fetch-issue.mjs https://github.com/owner/example-repo/issues/473

# Enriched scaffold: also pull the body of every linked spec issue.
node skills/gh-issue-to-task/scripts/fetch-issue.mjs 473 --enrich
```

Exit codes:

* `0` - success.
* `1` - fetch failure (authentication, network, or issue not found).
* `2` - invalid arguments.


## Default workflow

Follow these steps in order. Stop and report at the first failure.


### 1) Resolve the issue reference

Accept whatever the user provided (number, `owner/repo#n`, or URL). If it is a bare number, confirm the current working directory is a clone of the target repo or ask for `--repo`.


### 2) Run the helper

Invoke `node skills/gh-issue-to-task/scripts/fetch-issue.mjs <issue-ref> [--enrich]` from the repo root. Capture stdout as a single JSON object with this shape:

```json
{
  "issue":        { "owner", "repo", "number", "url", "title", "body", "labels", "assignees", "state" },
  "linkedIssues": [ { "ref", "owner", "repo", "number", "url", "title?", "body?", "error?" } ],
  "linkedFiles":  [ { "url", "owner", "repo", "ref", "path" } ],
  "figmaLinks":   [ { "url", "fileKey?", "nodeId?" } ],
  "otherLinks":   [ { "url" } ]
}
```

`title`, `body`, and `state` on each `linkedIssues` entry are only present when the helper was run with `--enrich` and the fetch succeeded; otherwise the entry has only the reference fields.


### 3) Propose the filename slug

Derive a kebab-case slug from the issue title. Strip boilerplate ("UX writing for", "feature in ... dashboard", trailing "(owner/spec-repo #NNN)") and shorten to the meaningful noun phrase. Examples:

| Issue title                                                     | Proposed slug         |
| --------------------------------------------------------------- | --------------------- |
| UX writing for Export Settings feature in the dashboard         | `export-settings`     |
| UX writing for Pre-built Assistant Agent (owner/spec-repo #598) | `pre-built-assistant` |

The output path is always `tasks/<issue-number>-<slug>.md`. Ask the user to confirm or override the slug before writing the file - the slug becomes the branch name too, so it should read cleanly. Do not auto-route by product folder; always write to `tasks/`.


### 4) Infer Phrase Strings metadata

Resolve **project**, **tag**, and **branch** from the fetched data and mark them as `extracted` (verbatim from the issue) or `inferred` (heuristically derived). Inference rules:

* **Project** - match against the `project_name` column of `localization/phrase-project-ids.csv`. Scan the title, body, and labels for product or surface keywords and map each match to its project id. Build the keyword-to-project map from the projects listed in the CSV (for example, a product name or its known aliases map to that product's project id). When no keyword matches, fall back to the default `general` (General) project. Keep this mapping in sync with the CSV as projects are added or renamed.
* **Tag** - if the title or body cites a parent spec issue in a spec repo (for example, `owner/spec-repo#570`), propose `<spec-number>-<spec-slug>` where the slug is the kebab-cased feature name from the issue title (drop "UX writing for" etc.). If no parent spec is linked, propose `<issue-number>-<slug>`.
* **Branch** - always the file slug (for example, `473-export-settings`).

Write all three values with a `(proposed, confirm before push)` note, matching the canonical shape in [`task-template.md`][]. The writer confirms or fixes them before pushing the keys to Phrase later.


### 5) Assemble the scaffold

Build the Markdown file in this order:

1. **H1 title** - `# <issue-number>-<slug>`.
2. **One-line description** - a single sentence derived from the issue title (a noun phrase about the feature, not "UX writing for ..."). If the issue title is too thin to derive a useful description, fall back to "UX writing for the `<feature>` feature." and flag it in the report so the writer can rewrite it.
3. **Links block** - a bulleted list with:
   * `GitHub: [<issue title>](<issue url>)`
   * `Figma: [<file name>](<figma url>)` if `figmaLinks[0]` is present; otherwise `Figma: TBD (no design file linked on the issue yet)`. Use the file name from the URL path when it is meaningful; otherwise use a short placeholder label.
4. **Specs section** - one bullet per `linkedIssues` entry and one per `linkedFiles` entry, in the order they appear. Use the linked issue's repo and number in the label (for example, `[[Feature] ... - Issue #570 - owner/spec-repo](<url>)`).
5. **Phrase Strings block** - the three inferred values from step 4 with the `(proposed, confirm before push)` note.
6. **Table of contents** - a bullet list of the H2 sections, wrapped with `<!-- omit in toc -->` like the existing files.
7. **`## UX copy`** - a short placeholder paragraph plus an empty table with the four canonical columns:

   ```markdown
   | English | Key | Description | Notes |
   | ------- | --- | ----------- | ----- |
   |         |     |             |       |
   ```

8. **`## Background`** - a short verbatim excerpt from the issue body's Background section if present; otherwise a single sentence stating the feature scope drawn from the issue title and labels. Do not invent details.
9. **`## Spec details`** (only when `--enrich` was used and at least one linked issue body was fetched successfully) - one `### A. ...`, `### B. ...` subsection per linked issue, with a reference-link definition for the issue URL and a verbatim excerpt of the linked issue's body. Skip entries whose `error` field is set; report each skipped link to the user.
10. **`## Changelog`** - one entry: `- YYYY-MM-DD: Created task scaffold from <owner>/<repo>#<n>.` using today's date.

Apply the repo core writing rules from `AGENTS.md` to every line you author yourself (straight quotes, no contractions, Oxford comma, plain hyphens, sentence-case headings, no sentence split across a line break). Do not rewrite verbatim excerpts.

Use **reference-style Markdown links** for any URL whose label is longer than a few words, per the repo Markdown links rule. Inline links are fine for very short labels.


### 6) Confirm before writing

Present a summary and ask for explicit confirmation before creating the file. Include:

* The output path (`tasks/<n>-<slug>.md`).
* The proposed slug and one-line description.
* The resolved Phrase project, tag, and branch, each marked `extracted` or `inferred`.
* The number of linked specs and Figma links that will be included.
* Whether `--enrich` data is present.

Do not write anything before the user confirms.


### 7) Write the file and update the index

On confirmation:

1. Refuse to overwrite an existing file. If `tasks/<n>-<slug>.md` already exists, stop and report the path so the user can decide whether to rename, delete, or skip.
2. Write the scaffold to `tasks/<n>-<slug>.md`.
3. Add one bullet to `tasks/README.md` under `## Contents`, sorted by issue number. Use the existing entry format: `- [<filename>](<filename>) - Task notes for <one-line description>.`

Stop and report the file path and the index update.


### 8) Hand off to follow-up steps

After the scaffold is written, tell the user about the next likely steps:

* Draft the UX copy in the empty `## UX copy` table.
* Audit the key naming against the naming rules.
* Confirm the Phrase metadata, then push the new keys to Phrase.


## Bundled resources


### scripts/fetch-issue.mjs

The helper does all GitHub I/O.

Behavior:

* Parses `<issue-ref>` into `{ owner, repo, number }`. Resolves the repo from `gh repo view` when only a number is given.
* Fetches the primary issue with `gh issue view --json title,body,url,number,labels,assignees,state`.
* Scans the issue body for URLs and classifies each as a linked issue (`/issues/<n>` or `/pull/<n>`), a linked file (`/blob/<ref>/<path>`), a Figma link, or a generic "other" link. De-duplicates linked issues by full ref.
* With `--enrich`, fetches each linked issue's body via `gh issue view` (cross-repo OK). On per-issue fetch failure, the entry includes an `error` field instead of `title`/`body`; the helper does not abort the run.
* Prints a single JSON object on stdout and a one-line success summary on stderr.
* Exits `0` on success, `1` on fetch failure for the primary issue, `2` on invalid arguments.

The helper only reads from GitHub. It never writes, posts, or modifies anything.


## Constraints

* Use the bundled helper - do not call `gh issue view` directly for the primary issue. The helper handles ref parsing, URL extraction, and consistent output.
* Never overwrite an existing `tasks/<n>-<slug>.md`. Stop and ask the user instead.
* Always update `tasks/README.md` when adding a new file, so the index stays in sync.
* Treat inferred metadata as proposed, not authoritative. The Phrase project, tag, and branch all flow into the Phrase push later, and an incorrect project will push keys to the wrong CSV.
* When `--enrich` is used and a linked issue fails to fetch, include the entry in the Spec details placeholder block with the helper-reported error and ask the user to confirm whether to proceed without it. Do not silently drop it.
* Do not draft UX copy. The `## UX copy` table is intentionally empty; copy belongs to follow-up review steps.
* Do not modify the source GitHub issue. This skill only reads.
* Follow the repo core writing rules in `AGENTS.md` for any prose you author (titles, descriptions, Background fallback line, Changelog entry).


## Output format

1. **Result:** one sentence stating the state (inspection only, waiting for confirmation, or file written).
2. **Issue summary:** the resolved `<owner>/<repo>#<n>`, the issue title, and the number of linked specs and Figma links found.
3. **Proposed scaffold:** filename, slug, one-line description, Phrase project, tag, branch (each marked `extracted` or `inferred`), and whether `--enrich` data is included.
4. **What changed:** the new file path under `tasks/` and the new bullet appended to `tasks/README.md`.
5. **Next step:** one or two follow-up steps the writer is likely to want.


## Related skills

* [`gh-cli`][] - general-purpose GitHub CLI usage; useful for editing the source issue after this skill scaffolds the task file.
* [`gh-pr-reporter`][] - the sibling skill for pull requests; consolidates every comment on a PR into a Markdown report.

[`gh-cli`]: ../gh-cli/SKILL.md
[`gh-pr-reporter`]: ../gh-pr-reporter/SKILL.md
