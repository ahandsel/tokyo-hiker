---
name: file-folder-name-linter
description: Lint repository file and folder names for format compliance. Use when users ask to check naming conventions, enforce file extensions, or validate notes naming patterns; applies a fixed set of rules from the skill and reports any discovered repository style guides for reviewer reference.
---

# File and folder name linter

Sweep the repository for file and folder names that drift from the project's naming conventions. Use this skill when the user asks to check naming, enforce file extensions, validate `notes/` naming, or sweep the repo for non-compliant paths.

The skill enforces a fixed set of rules from this `SKILL.md` and surfaces every discovered repository style guide (`AGENTS.md`, `your-style-guide/*`, etc.) at the end of the report so the reviewer can sanity-check intent on gray-area findings.


## Rules

The linter enforces three rules on every run:

1. **`notes/` naming.** Files under `notes/` (including subfolders such as `notes/img/`) must match `YYYY-MM-DD-<kebab-name>.<ext>`. For example, `notes/2026-05-19-pr-1-audit.md` passes; `notes/pr1.md`, `notes/note.md`, and `notes/2026-5-19-foo.md` fail. Allowed extensions: `.md`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`.
2. **`.yaml` not `.yml`.** Any tracked file ending in `.yml` is flagged with a `.yaml` suggestion. This is the only rule the linter can auto-fix.
3. **Kebab-case.** File basenames (before the first dot) and folder names must match `^[a-z0-9][a-z0-9-]*$` - lowercase letters, digits, and hyphens, starting with a letter or digit. No underscores, no uppercase, no spaces.


## Scope

In scope:

* Every file tracked by git that is not covered by a default ignore or a `.namelintignore` pattern.
* Every folder that contains at least one in-scope file.

Out of scope (the linter skips these):

* Anything excluded by `.gitignore` (handled implicitly because the linter uses `git ls-files` to enumerate paths).
* Standard repo docs anywhere in the tree: `README.md`, `AGENTS.md`, `MEMORY.md`, `ONBOARDING.md`, `LICENSE` (with or without an extension), `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `AUTHORS`, `NOTICE`.
* Dotfiles and dot-folders: any path segment that starts with `.` (`.gitignore`, `.editorconfig`, `.claude/`, `.github/`, `.vscode/`, and so on).
* Package manager files: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig*.json`.
* Vendored Figma skills under `skills/figma-*/` (these are imported from the official `figma@claude-plugins-official` plugin and follow upstream naming).
* Anything matched by the repo-root `.namelintignore` file.


## Quick start

Run the bundled linter through `pnpm`:

```bash
# Scan the whole repo and print a grouped report.
pnpm lint-naming

# Scan a subset of paths.
pnpm lint-naming notes/ localization/

# Rename *.yml to *.yaml in place (the only auto-fixable rule).
pnpm lint-naming --fix

# Machine-readable output for piping.
pnpm lint-naming --json

# Print help and exit.
pnpm lint-naming --help
```

Direct invocation (what `pnpm lint-naming` resolves to):

```bash
node skills/file-folder-name-linter/scripts/lint-names.mjs [args]
```

Exit codes:

* `0` - no violations found.
* `1` - one or more violations.
* `2` - configuration error (not a git checkout, unreadable `.namelintignore`, and so on).


## Workflow

1. **Scope the run.**
   * If the user just touched a folder, pass that folder so the report stays focused: `pnpm lint-naming notes/`.
   * For a repo-wide sweep, run with no arguments.

2. **Lint.** Run `pnpm lint-naming`. Read the grouped report. Violations are grouped by rule (`notes/` naming, `.yml` extension, kebab-case) so the fix list stays clear.

3. **Report.** Summarize for the user: which paths violate which rule, and which violations are auto-fixable.

4. **Fix.**
   * **`.yml` files:** run `pnpm lint-naming --fix` to rename them in place to `.yaml`. Safe in this repo - no link rewrites needed.
   * **`notes/` naming violations:** rename manually. The date prefix depends on the note's actual date, which the linter cannot infer.
   * **Kebab-case violations:** rename manually. Renames may break Markdown reference links elsewhere in the repo; review each one and update any inbound links in the same change.
   * **False positives:** if a path is intentionally non-compliant (a third-party artifact, a generated file, an external dependency), add a glob to `.namelintignore` with a one-line `#` comment explaining why. Do not edit the script's default ignore list for project-specific cases.

5. **Re-lint.** Run `pnpm lint-naming` again. Confirm the verdict is now clean (exit `0`).

6. **Sanity-check intent.** When in doubt about a rule, consult the style guides printed at the end of the report (informational `ℹ️` block) before changing the script's defaults.


## Bundled resources


### scripts/lint-names.mjs

Scans tracked files and the folders they live in, applies the three rules, and prints a per-rule report.

Behavior:

* Locates the repo root via `git rev-parse --show-toplevel`.
* Enumerates tracked paths via `git ls-files -z`, which honors `.gitignore` automatically.
* Builds the set of unique folder paths from those file paths.
* Skips default ignores (standard docs, dotfiles, package manager files, vendored Figma skills) and any path matched by `.namelintignore`.
* Runs three rule checks (`notes/` naming, `.yml` extension, kebab-case) and groups the findings.
* Prints a human-readable report by default, or `{ violations: [...], styleGuides: [...] }` with `--json`.
* With `--fix`, renames `*.yml` to `*.yaml` in place. Other rules report only.
* Discovers and prints style-guide files (`*style-guide*`, `*-rules.md`, `AGENTS.md`, `repo-commit-style-guide.md`) as informational pointers - never affects the exit code.

The script reads files for discovery and only writes when `--fix` is passed; in that case, the only mutation is the `.yml` -> `.yaml` rename.


## Constraints

* Do not add new rules to this skill without confirming with the user. The skill enforces a fixed set of three rules by design.
* Do not edit the script's hardcoded default ignore list to silence a project-specific finding. Add a glob to `.namelintignore` instead, with a one-line `#` comment explaining why.
* Do not auto-rename for the kebab-case or `notes/` naming rules. Renames in those categories need human review for link breakage and content-dependent dates.
* Do not silence a violation by deleting the file. Confirm with the user first - the file may be intentional and just needs a rename.
* Before acting on a flagged finding, read the surrounding context. The checks are heuristic in the sense that a rule may legitimately not apply to a vendored asset or a generated artifact; in those cases, add an ignore entry rather than rename.
