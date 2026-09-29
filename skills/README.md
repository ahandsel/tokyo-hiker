# Skills

This folder contains local Codex skills used by this repository.


## Usage

To use a skill, enter the skill's name in the AI interface (VS Code extension, terminal prompt, or desktop app) with the appropriate prefix for AI tool.

| Tool           | Input       | Example                                        |
| -------------- | ----------- | ---------------------------------------------- |
| Claude         | /skill-name | `/ai-commit --auto` or `/gh-pr-reporter <URL>` |
| Codex          | $skill-name | `$ai-commit --auto` or `$gh-pr-reporter <URL>` |
| GitHub Copilot | @skill-name | `@ai-commit --auto` or `@gh-pr-reporter <URL>` |

> [!TIP]
> Ask the AI `What does [skill name] do?` to get a description of the skill's functionality and usage instructions.


## Available skills


### Daily utility skills

| Skill                                          | Description                                                                                                                                                                                                                                                    | Last updated (UTC) |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [`ai-commit`][ai-commit]                       | Auto-gather git changes, confirm scope with the user, and draft a commit title and message following the project commit style guide.                                                                                                                           | 2026-06-03 13:30   |
| [`general-en-polisher`][general-en-polisher]   | Polishes Markdown files to enforce the repo core writing rules (straight quotes, no contractions, the Oxford comma, sentence case headings, plain hyphens, and more), then runs `link-polisher` on the same files.                                             | 2026-06-03 09:37   |
| [`blog-md-linter`][blog-md-linter]             | Lints and polishes a Markdown file, or every Markdown file under a folder such as `contents/`: runs the repo auto-fixers, refreshes any table of contents, converts links to reference-style links per the repo convention, and checks style-guide compliance. | 2026-06-14 00:00   |
| [`blog-content-auditor`][blog-content-auditor] | Audits one content Markdown file for content quality: verifies facts are correct and up-to-date, checks style-guide compliance, and confirms the content is logically sound and complete, then reports findings grouped by accuracy, style, and sense.         | 2026-06-26 00:00   |


### Repository maintenance skills

| Skill                                                  | Description                                                                                                                                                                                    | Last updated (UTC) |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [`file-folder-name-linter`][file-folder-name-linter]   | Lints repository file and folder names against three fixed rules (`notes/` date prefix, `.yaml` not `.yml`, kebab-case) via `pnpm lint-naming`, with style-guide pointers for the reviewer.    | 2026-06-05 00:00   |
| [`folder-readme-maintainer`][folder-readme-maintainer] | Audits the repository for missing or outdated folder `README.md` files and creates or updates them. Run after adding, moving, or renaming folder contents.                                     | 2026-06-09 00:00   |
| [`script-auditor`][script-auditor]                     | Audits helper scripts in `scripts/` and `skills/*/scripts/` against the `AGENTS.md` script guidelines (no Python, prefer `.mjs` or zsh, require `--help`, a notes section, and status emojis). | 2026-06-04 01:36   |
| [`skill-allowlist-syncer`][skill-allowlist-syncer]     | Fully syncs the `Skill(<name>)` entries in `.claude/settings.json` under `permissions.allow` with the skills in the repo `skills/` folder, adding new skills and removing deleted ones.        | 2026-06-01 09:37   |


### Other utility skills

| Skill                              | Description                                                                                                                                                      | Last updated (UTC) |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [`gh-cli`][gh-cli]                 | Interact with GitHub repositories using the GitHub CLI (gh). Covers PRs, issues, releases, workflow runs, and branch operations.                                 | 2026-05-14 06:13   |
| [`gh-pr-reporter`][gh-pr-reporter] | Fetches every comment on a GitHub PR (reviews, inline review comments, and general comments) and emits a single consolidated Markdown report.                    | 2026-06-04 14:30   |
| [`link-polisher`][link-polisher]   | Rewrites raw URLs in Markdown files as Markdown links with a human-readable label fetched from the source (Figma file name, GitHub issue or pull request title). | 2026-06-03 04:16   |


## Imported skills

Imported from the local `ahandsel.github.io` repository on 2026-09-29 and adapted to Tokyo Hiker.
Existing customized skills remain the source of truth for overlapping workflows.

| Skill                                                | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`code-review`][code-review]                         | Review a Tokyo Hiker pull request or branch diff for correctness, content conventions, and repository integration. Report evidence-backed findings without editing files.                                                                                                                                                                                                                                                                                                                              |
| [`general-ja-polisher`][general-ja-polisher]         | Polish Japanese Markdown for natural phrasing, consistent terminology, and Tokyo Hiker writing conventions without changing facts. Apply edits by default; use --report-only for findings without edits.                                                                                                                                                                                                                                                                                               |
| [`gh-address-comments`][gh-address-comments]         | Help address review/issue comments on the open GitHub PR for the current branch using gh CLI; verify gh auth first and prompt the user to authenticate if not logged in.                                                                                                                                                                                                                                                                                                                               |
| [`gh-fix-ci`][gh-fix-ci]                             | Use when a user asks to debug or fix failing GitHub PR checks that run in GitHub Actions; use `gh` to inspect checks and logs, summarize failure context, draft a fix plan, and implement only after explicit approval. Treat external providers (for example Buildkite) as out of scope and report only the details URL.                                                                                                                                                                              |
| [`gh-pr-generator`][gh-pr-generator]                 | Draft a structured pull request body from the branch diff and open the pull request with the gh CLI. Use when a user asks to open, create, raise, or draft a pull request, or to refresh the body of the pull request that is already open for the current branch. Derives published site URLs for changed pages, groups pending tasks, and folds background detail into a collapsed section.                                                                                                          |
| [`gh-sync-with-main`][gh-sync-with-main]             | Bring the current git branch up to date with commits from the main branch. Use when the user asks to pull latest main, sync/refresh the branch, rebase onto main, or merge main into a feature branch.                                                                                                                                                                                                                                                                                                 |
| [`ja-readability-editor`][ja-readability-editor]     | Improve readability and scannability of Japanese Markdown documentation using plain Japanese and clear structure while preserving technical accuracy and repository terminology. Use when the user asks to simplify Japanese wording, improve flow, reduce jargon, or rewrite Japanese docs/articles for faster comprehension.                                                                                                                                                                         |
| [`ja-review-text`][ja-review-text]                   | AI が書いた日本語の文章を、人間が書いたように自然な日本語へ全面的に書き直す。AI 臭さ（テンプレ感、記号過多、過剰な丁寧さ、抽象語の空回り）を完全に除去する。使用トリガー: 'この文章を自然にして', '人間っぽく書き直して', 'AI 臭さを消して', 'humanize', '文章をリライトして'                                                                                                                                                                                                                          |
| [`playwright`][playwright]                           | Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow debugging) via `playwright-cli` or the bundled wrapper script.                                                                                                                                                                                                                                                                                      |
| [`pr-auditor`][pr-auditor]                           | Blunt merge audit of a code branch or pull request written by an AI coding agent, treating its description, comments, and green checks as claims to verify, and reporting severity-ranked findings without editing anything. Use when the user asks to audit, review, or gate a code diff, wants a merge-readiness verdict, or suspects AI-generated defects such as an invented API, a silent fallback, or a test that only confirms a mock. Reachable by `code-review` for the code paths in a diff. |
| [`readability-editor`][readability-editor]           | Improve readability and scannability of Markdown documentation using plain language and clear structure while preserving technical accuracy. Use when the user asks to simplify wording, improve flow, reduce jargon, or rewrite docs/articles for faster comprehension.                                                                                                                                                                                                                               |
| [`security-best-practices`][security-best-practices] | Review JavaScript, TypeScript, Vue, and browser security when requested.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [`security-threat-model`][security-threat-model]     | Repository-grounded threat modeling that enumerates trust boundaries, assets, attacker capabilities, abuse paths, and mitigations, and writes a concise Markdown threat model. Trigger only when the user explicitly asks to threat model a codebase or path, enumerate threats/abuse paths, or perform AppSec threat modeling. Do not trigger for general architecture summaries, code review, or non-security design work.                                                                           |
| [`vitepress-include-lint`][vitepress-include-lint]   | Verify VitePress markdown include directives (`@include:`) for strict comment formatting and valid target file paths. Use when users ask to check, lint, or validate `<!--@include: ...-->` usage across docs.                                                                                                                                                                                                                                                                                         |

<!-- Internal links -->

[ai-commit]: ./ai-commit/SKILL.md
[blog-content-auditor]: ./blog-content-auditor/SKILL.md
[blog-md-linter]: ./blog-md-linter/SKILL.md
[code-review]: code-review/SKILL.md
[file-folder-name-linter]: ./file-folder-name-linter/SKILL.md
[folder-readme-maintainer]: ./folder-readme-maintainer/SKILL.md
[general-en-polisher]: ./general-en-polisher/SKILL.md
[general-ja-polisher]: general-ja-polisher/SKILL.md
[gh-address-comments]: gh-address-comments/SKILL.md
[gh-cli]: ./gh-cli/SKILL.md
[gh-fix-ci]: gh-fix-ci/SKILL.md
[gh-pr-generator]: gh-pr-generator/SKILL.md
[gh-pr-reporter]: ./gh-pr-reporter/SKILL.md
[gh-sync-with-main]: gh-sync-with-main/SKILL.md
[ja-readability-editor]: ja-readability-editor/SKILL.md
[ja-review-text]: ja-review-text/SKILL.md
[link-polisher]: ./link-polisher/SKILL.md
[playwright]: playwright/SKILL.md
[pr-auditor]: pr-auditor/SKILL.md
[readability-editor]: readability-editor/SKILL.md
[script-auditor]: ./script-auditor/SKILL.md
[security-best-practices]: security-best-practices/SKILL.md
[security-threat-model]: security-threat-model/SKILL.md
[skill-allowlist-syncer]: ./skill-allowlist-syncer/SKILL.md
[vitepress-include-lint]: vitepress-include-lint/SKILL.md
