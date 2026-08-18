# AGENTS.md

Rules for AI agents working in the `tokyo-hiker` repository. This is the canonical instructions file; `CLAUDE.md` and the files under `.github/` point here.


## Project overview

`Tokyo Hiker` is a personal blog about hiking in Tokyo and the surrounding areas.

* Static site built with [VitePress](https://vitepress.dev/).
* Content root is `contents/`, not `docs/`. Published pages moved there, which freed `docs/` to hold repository documentation instead.
* Deployed to GitHub Pages at <https://ahandsel.github.io/tokyo-hiker/>, with `base: '/tokyo-hiker/'`.
* Source of truth for site config is [contents/.vitepress/config.mts](contents/.vitepress/config.mts).


## Repository structure

| Path                 | Purpose                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `contents/`          | Published site content (Markdown) plus `.vitepress/` config, theme, and build. |
| `contents/level-1/`  | Easy hikes.                                                                    |
| `contents/level-2/`  | Intermediate hikes.                                                            |
| `contents/level-3/`  | Challenging hikes.                                                             |
| `contents/area/`     | Area guides and multi-route roundups.                                          |
| `contents/snippets/` | Reusable Markdown fragments included into pages.                               |
| `contents/public/`   | Static assets served at the site root, including images.                       |
| `scripts/`           | Helper scripts. See [scripts/README.md](scripts/README.md).                    |
| `prompts/`           | Reusable prompt files, shared by every agent tool.                             |
| `tests/`             | Node test-runner tests, including the vendored Mermaid CSS drift guard.        |
| `docs/`              | Repository documentation, including the generated `site-structure.md`.         |
| `notes/`             | Generated notes, audits, and reports.                                          |
| `.github/workflows/` | CI: PR lint and format, plus the GitHub Pages deploy.                          |

Save generated artifacts inside this repo: notes, audits, and reports go in `notes/`, repository documentation goes in `docs/`, and prompts go in `prompts/`.


### Agent instruction and prompt files

`AGENTS.md` is the single source of truth for repository rules. The tool-specific files are thin pointers to it, so edit `AGENTS.md` and leave the pointers alone:

* [.claude/CLAUDE.md](.claude/CLAUDE.md) - Claude Code.
* [.github/copilot-instructions.md](.github/copilot-instructions.md) and [.github/instructions/copilot-instructions.md](.github/instructions/copilot-instructions.md) - GitHub Copilot.

Prompt files live in `prompts/` only. Both `.claude/commands` and `.github/prompts` are symlinks to that folder, so each tool picks the same files up. Add a new prompt to `prompts/`, never to a symlinked path, and keep the `.prompt.md` suffix that GitHub Copilot requires.


## Setup and commands

Node.js 24 or newer and pnpm 11 or newer are required. `pnpm-workspace.yaml` sets `engineStrict: true`, so `pnpm install` fails fast on a mismatched toolchain.

**pnpm only.** Never suggest or run `npm` or `yarn`; the repo ships shims in `.aliases/` that forward both to pnpm.

| Command                  | What it does                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `pnpm setup-full`        | Full first-time setup: Brewfile, `.node-version` via nodenv, install, and the pre-commit hook. |
| `pnpm install`           | Install dependencies.                                                                          |
| `pnpm dev`               | `vitepress dev contents` - start the dev server.                                               |
| `pnpm build`             | `vitepress build contents`.                                                                    |
| `pnpm preview`           | Preview the production build.                                                                  |
| `pnpm lint`              | `code-format` then `md-lint`. Run this before finishing any change.                            |
| `pnpm md-lint:check`     | Markdown lint in check-only mode, as CI runs it.                                               |
| `pnpm code-format:check` | Prettier in check-only mode, as CI runs it.                                                    |
| `pnpm test`              | `node --test tests/**/*.test.mjs`, including the Mermaid CSS drift guard.                      |
| `pnpm tree`              | Regenerate `docs/site-structure.md` from the `contents/` tree.                                 |
| `pnpm index`             | List every pnpm script with its command.                                                       |
| `pnpm cleanup`           | List and optionally delete temporary files.                                                    |

Run `pnpm tree` after adding, moving, or renaming content, then `pnpm lint` and `pnpm test` before finishing.

A pre-commit hook installed by `pnpm setup-pre-commit` runs `pnpm lint` on every commit.


## Content authoring

Every content page carries this frontmatter and body opening:

```md
---
title: 'Mt. Mitake + Rock Garden'
description: 'Hiking route on Mitakesan (御岳山) with a Mononoke Hime vibe that is perfect for beginners.'
excludeFromSidebar: false
---

# {{$frontmatter.title}}

{{$frontmatter.description}}
```

* `title` - the page title, also used as the sidebar label.
* `description` - one sentence describing the route, also rendered as the opening line.
* `excludeFromSidebar` - set to `true` to hide the page from the sidebar and from the folder landing list.
* Do not hardcode the H1 or the opening line; keep the `{{$frontmatter.*}}` interpolations so the two stay in sync.

Other conventions:

* The sidebar is generated by `vitepress-sidebar` from frontmatter, so no manual sidebar entries exist. Files matching the `excludeByGlobPattern` entries in [contents/.vitepress/config.mts](contents/.vitepress/config.mts) are excluded. The entries are globs, not regexes, so the `temp-.*` entry matches `temp-.` plus any suffix, not every `temp-` file.
* Each content folder has an `index.md` that supplies the folder title and link. The landing pages list their pages through the `md-index-list` snippet, which applies the same exclusions as the sidebar: `index.md`, pages with `excludeFromSidebar: true`, and the glob-excluded file names. Keep the snippet's filter in sync with `excludeByGlobPattern` when the config changes.
* Reuse shared blocks from `contents/snippets/` with an include directive, for example `<!--@include: ../snippets/md-index-list.md-->`.
* Images live in `contents/public/` and are referenced from the site root, for example `/images/foo.png`. `.markdown-link-check.json` rewrites those paths to `public/...` when checking links.
* Add Japanese place names and other repo-specific vocabulary to the `words` list in [.cspell.json](.cspell.json) rather than leaving them flagged.


## Mermaid diagrams

Write diagrams in a fenced `mermaid` code block. Diagrams render with the forest theme in light mode and the dark theme in dark mode, so a hardcoded color must never rely on a theme-picked partner.

* Prefer theme defaults; avoid `style` and `classDef` color overrides where you can.
* When a directive hardcodes a `fill`, also hardcode a readable label `color`, for example `style DIR fill:#FFFACD,stroke:#333,stroke-width:1px,color:#333`.
* Check every diagram in both color modes before shipping it.
* Each diagram sits in a pan-and-zoom container with a height ceiling of `70vh`. Override it per page with the `mermaidHeight` frontmatter field, using any valid CSS `max-height` value.
* Diagrams render lazily via an IntersectionObserver, so scroll a diagram into view before testing or screenshotting it.

[contents/.vitepress/theme/vitepress-mermaid-renderer.css](contents/.vitepress/theme/vitepress-mermaid-renderer.css) vendors the upstream plugin stylesheet above a banner comment, then layers local overrides below it. The vendored block must stay a verbatim copy of the installed plugin, and `pnpm test` fails when it drifts. On a plugin upgrade, re-copy both parts as the banner describes, then re-run `pnpm test`.

See [README.md](README.md) for the longer explanation.


## Markdown formatting

Prettier ignores `*.md` on purpose; [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) owns Markdown style. Follow [.markdownlint.json](.markdownlint.json):

* Use `*` for unordered list items, never `-` or `+`.
* Use 2-space indentation for nested lists.
* Leave 2 blank lines above a heading and 1 blank line below.
* Leave at most 2 consecutive blank lines.
* Inline HTML is restricted to `<br>`, `<pre>`, `<ul>`, `<li>`, and `<ol>`.
* Line length is unrestricted, so do not hard-wrap for width.

Prettier owns everything else (`.mts`, `.ts`, `.mjs`, `.vue`, `.json`, `.yaml`): 2-space indent, single quotes.


## Writing style

Apply these rules when creating or reviewing prose:

* Use straight quotes, not curly quotes.
* Never use an en-dash or em-dash; always use a plain hyphen (`-`).
* Use sentence case for headings, capitalizing only the first word and proper nouns.
* Do not use contractions; write "do not" instead of "don't".
* Use the Oxford comma.
* Keep wording simple for non-native English speakers, and avoid slang and idioms.
* Do not split a single sentence across a line break. Break only at sentence boundaries.
* Keep capitalization and punctuation consistent within a document.


## File and folder naming

* Use `lowercase-with-dashes` for file and folder names.
* When renaming a file or folder, update every reference to it across content, scripts, config, and documentation.
* Each folder that holds working files should carry a `README.md` describing its contents, kept current when the folder changes.


## Scripts

Helper scripts live in `scripts/` and are indexed in [scripts/README.md](scripts/README.md), which also states the authoring rules. In short:

* Default to Node.js ES modules (`.mjs`) or zsh. Python is banned.
* Every script supports `--help` and prints clear usage.
* Every script carries a top-of-file notes section covering general notes, usage, output, and a reverse-chronological version history.
* Bump the version and add a history entry on every change, and name the script and its new version in the commit title.
* Use status emojis in output: ✅ for success, ⚠️ for warnings, and ❌ for errors.

Update `scripts/README.md` whenever a script is added, removed, or changed.


## CI and deployment

* [.github/workflows/pr-linter.yml](.github/workflows/pr-linter.yml) runs `md-lint:check`, `code-format:check`, and `test` on every non-draft pull request.
* [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys to GitHub Pages on pushes to `main`.
* Both workflows read the pnpm version from `packageManager` in `package.json` and the Node.js version from `.node-version`. Keep those two files as the single source of truth instead of hardcoding versions in a workflow.
* Every GitHub Action is pinned to a commit SHA with a trailing version comment, for example `uses: actions/checkout@3d3c... # actions/checkout@v7.0.1, pinned`. Preserve that pattern when adding or bumping an action.


## Git and commits

* Never add a `Co-Authored-By` trailer to a commit message.
* Use the `ai-commit` skill to draft commit messages.
* Commit titles start with a gitmoji and use sentence case, for example `✨ Add Mermaid height ceiling and CSS guard`.
* `main` is the default branch and the deploy source; day-to-day work happens on `dev`.
