---
name: code-review
description: Review a Tokyo Hiker pull request or branch diff for correctness, content conventions, and repository integration. Report evidence-backed findings without editing files.
---

# Code review

Review the complete diff against `AGENTS.md`, then read the surrounding code, callers, tests, and linked pages needed to establish the effect of each change.
Use the PR base branch when available, otherwise compare the current branch with `main`.
Use `gh auth status`, `gh pr view`, and `gh pr diff` for an existing PR; use local git diffs when GitHub access is unavailable.
Do not edit, commit, push, or post findings unless the user requests those actions.


## Checks

Run `pnpm lint-target --check <changed-paths>`, `pnpm test`, and `pnpm lint-naming` as applicable.
Run `pnpm build` for site changes and `pnpm lint-includes` for include changes.
Record unrun checks as unverified.
The required full `pnpm lint` and content tree regeneration write files; run them in an isolated checkout for a report-only review.
Never discard user changes to clean up a check.

* Content pages follow the frontmatter and opening interpolations in `AGENTS.md`.
* Japanese counterparts use the `.ja.md` suffix and `excludeFromSidebar: true`. Translations are optional; do not require a mirrored locale tree.
* Review route facts, Japanese place names, emoji, and Markdown against `docs/hiking-blog-style-guide.md` and `docs/markdown-style-guide.md`.
* Sidebar entries are generated. Check exclusions and the folder landing snippet together when either changes.
* Content additions, moves, and renames require an updated `docs/site-structure.md` from `pnpm tree`.
* Mermaid changes need visual verification in light and dark mode after scrolling the diagram into view.
* Scripts need usage, output, version history, and the corresponding `scripts/README.md` entry.
* Skills need a matching name, complete bundled resources, a `skills/README.md` entry, and a synchronized skill allowlist.
* Workflow actions retain SHA pins and read toolchain versions from the existing sources of truth.

Use `pr-auditor` when a deeper code behavior review is needed.
Use editing skills only as references during a report-only review, without applying their edits.


## Report

Order findings by severity. Give each finding a location, the triggering condition, observed or inferred impact, evidence, and the smallest useful correction.
Separate confirmed defects from uncertainties and preferences.
Report pre-existing failures separately from regressions introduced by the diff.
If no findings remain, say so and state the scope reviewed and verification limits.
