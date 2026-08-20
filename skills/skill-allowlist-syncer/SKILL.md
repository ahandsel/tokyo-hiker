---
name: skill-allowlist-syncer
description: Fully sync the managed `permissions.allow` entries in `.claude/settings.json` with the repo's `skills/` folder - one `Skill(<name>)` entry per skill and one `Bash(<runner> <path>:*)` entry per runnable script stored within a skill - adding entries for new skills and scripts and removing entries that no longer exist.
---

# Skill allowlist syncer skill

Scan the repo's `skills/` folder and reconcile `.claude/settings.json` so two managed groups of `permissions.allow` entries exactly match what is on disk:

1. **Skills** - one `Skill(<name>)` entry per `skills/*/SKILL.md`.
2. **Scripts** - one `Bash(<runner> <path>:*)` entry per runnable script stored within a skill folder, so those scripts are allowed to run by default.

Add entries for new skills and scripts, and remove entries for skills and scripts that no longer exist. Permission entries that belong to neither managed group (other `Bash(...)`, `Read(...)`, `WebSearch`, etc.) are never touched.


## Runnable scripts

A "runnable script" is a file inside a skill folder whose extension maps to a command runner:

| Extension | Runner | Generated entry       |
| --------- | ------ | --------------------- |
| `.mjs`    | `node` | `Bash(node <path>:*)` |
| `.zsh`    | `zsh`  | `Bash(zsh <path>:*)`  |

* Scripts are discovered recursively within each skill folder (for example both `skills/<skill>/scripts/<name>.mjs` and `skills/<skill>/<name>.mjs`).
* Paths are written relative to the repo root, because that is where the agent runs them from.
* The `:*` suffix matches the script run with or without arguments, so a no-argument invocation is allowed too.
* Plain `.js` files are intentionally ignored: in this repo they are Figma Plugin API snippets passed to the `use_figma` MCP tool, not commands executed via Bash, so they must not receive a Bash allow entry.


## Quick start

Run the bundled script from anywhere inside the repo (requires Node.js 24+):

```bash
# Check mode: report drift and exit non-zero if any is found.
node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs

# Write mode: reconcile `.claude/settings.json` in place.
node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --write
```

Exit codes:

* `0` - allowlist is in sync (check mode) or write succeeded.
* `1` - drift detected in check mode (one or more `Skill(<name>)` or script `Bash(...)` entries to add or remove).
* `2` - configuration error (missing repo root, missing `settings.json`, invalid JSON, missing skills folder).


## Workflow

1. **Check.** Run the script without `--write` from the repo root. Read the printed report.
2. **If `result:ok`,** stop. The allowlist already matches the skills folder.
3. **If `result:drift`,** show the user the lists of entries to add and remove (for both the Skills and Scripts groups) and ask for a one-line yes/no confirmation before applying.
4. **Apply.** On confirmation, rerun with `--write`. Confirm the final status line is `result:written`.
5. **Report.** Print the final list of entries added and removed, plus the absolute path of the file that was updated (the script prints both).


## Output format

The script prints a header, a Skills section, a Scripts section, and a final status line. Each section lists the entries already in sync, to add, and to remove (empty sub-lists are omitted):

```text
🔍 settings:           <absolute path>
🔍 skills_dir:         <absolute path>
🔍 skills_found:       <count>
🔍 scripts_found:      <count>
🔍 other_entries:      <count>

== Skills ==
✅ Already in sync (<count>):
  - Skill(<name>)
  ...
➕ To add (<count>):
  - Skill(<name>)
  ...
➖ To remove (skill folder no longer exists) (<count>):
  - Skill(<name>)
  ...

== Scripts ==
✅ Already in sync (<count>):
  - Bash(<runner> <path>:*)
  ...
➕ To add (<count>):
  - Bash(<runner> <path>:*)
  ...
➖ To remove (script no longer exists) (<count>):
  - Bash(<runner> <path>:*)
  ...

result:ok|drift|written
```


## Bundled resources


### scripts/check-skill-allowlist.mjs

Checks (and, with `--write`, fixes) the managed `Skill(<name>)` and script `Bash(<runner> <path>:*)` entries in `.claude/settings.json` against the `skills/` folder.

Behavior:

* Locates the repo root via `git rev-parse --show-toplevel` (override with `--repo-root <dir>`).
* Reads `.claude/settings.json`. Uses `skills.directory` if set; otherwise defaults to `skills`.
* Collects desired skill entries from each immediate `skills/*/SKILL.md`, parsing the `name:` field from YAML frontmatter. Falls back to the directory name when `name:` is missing or empty. Subdirectories without `SKILL.md` are skipped.
* Collects desired script entries by recursively scanning each skill folder for files whose extension is in the runner map (`.mjs` -> `node`, `.zsh` -> `zsh`), skipping `node_modules`, `.git`, and dotfiles. Each becomes `Bash(<runner> <repo-relative-path>:*)`.
* Buckets `permissions.allow` entries: `^Skill\(([^)]+)\)$` identifies the Skills group; a runner-and-extension pattern under the skills directory identifies the Scripts group. Entries in neither group (other `Bash(...)`, `Read(...)`, `WebSearch`, etc.) are always preserved untouched.
* On `--write`, rebuilds `permissions.allow` by keeping every unmanaged entry in its original position, then appending the desired script entries and the desired `Skill(<name>)` entries, each sorted case-insensitively. Writes back with 2-space indentation and a trailing newline.

The script does not invoke any skills; it only edits the settings file.


## Constraints

* Operate only on `.claude/settings.json` (the project-shared settings file). Do not modify `.claude/settings.local.json` or any user-level settings.
* Use the format `Skill(<name>)` exactly, with no extra whitespace inside the parentheses.
* Use the format `Bash(<runner> <path>:*)` exactly for script entries, where `<runner>` is `node` for `.mjs` and `zsh` for `.zsh`, `<path>` is the repo-root-relative path with forward slashes, and the trailing `:*` is always present.
* Derive each skill name from the `name:` frontmatter field in `SKILL.md`. Only fall back to the directory name when the frontmatter is missing or empty.
* Only add or remove entries that match a managed pattern: the literal `Skill(<name>)` pattern, or the script `Bash(<runner> <path>:*)` pattern under the skills directory. Never remove, reorder, or rewrite any other `permissions.allow` entry.
* When removing a stale managed entry, only remove it if its skill folder or script file no longer exists.
* Never generate a Bash entry for a plain `.js` file; only the extensions in the runner map are runnable scripts.
* Do not modify any other key in `settings.json` (for example, `$schema`, `skills`, `env`, `hooks`).
* If `.claude/settings.json` exists but is not valid JSON, the script exits with code 2; stop and ask the user to fix it before proceeding.
* Do not invoke any of the skills or scripts being granted; this skill only edits the settings file.
