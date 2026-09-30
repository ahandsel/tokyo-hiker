---
name: skill-allowlist-syncer
description: Fully sync the managed `permissions.allow` entries in `.claude/settings.json` with the repo's `skills/` folder - one `Skill(<name>)` entry per skill and one `Bash(<runner> <path>:*)` entry per runnable script stored within a skill - adding entries for new skills and scripts and removing entries that no longer exist.
---

# Skill allowlist syncer

Scan the repo's `skills/` folder and reconcile `.claude/settings.json` so two managed groups of `permissions.allow` entries exactly match what is on disk:

1. **Skills** - one `Skill(<name>)` entry per `skills/*/SKILL.md`.
2. **Scripts** - one `Bash(<runner> <path>:*)` entry per runnable script stored within a skill folder, so those scripts are allowed to run by default.

Add entries for new skills and scripts, and remove entries for skills and scripts that no longer exist. Permission entries that belong to neither managed group (other `Bash(...)`, `Read(...)`, `WebSearch`, etc.) are never touched.


## Runnable scripts

A "runnable script" is a file inside a skill folder whose extension maps to a command runner:

| Extension | Runner | Generated entry       |
| --------- | ------ | --------------------- |
| `.mjs`    | `node` | `Bash(node <path>:*)` |
| `.sh`     | `zsh`  | `Bash(zsh <path>:*)`  |
| `.zsh`    | `zsh`  | `Bash(zsh <path>:*)`  |

* Both shell extensions map to `zsh`, matching the shell helpers currently bundled under `skills/`. Confirm the runner before adding a new shell helper.
* Scripts are discovered recursively within each skill folder, so both `skills/<skill>/scripts/<name>.mjs` and `skills/<skill>/<name>.mjs` are picked up.
* Paths are written relative to the repo root, because that is where the agent runs them from.
* The `:*` suffix matches the script run with or without arguments, so a no-argument invocation is allowed too.
* Plain `.js` files are intentionally ignored; they are not declared standalone helpers by the runner map.


## Quick start

Run the bundled script from anywhere inside the repo (requires Node.js 24+):

```bash
# Check mode: report drift and exit non-zero if any is found.
node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs

# Write mode: reconcile `.claude/settings.json` in place.
node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --write

# Usage and options.
node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --help
```

Exit codes:

* `0` - allowlist is in sync (check mode) or write succeeded.
* `1` - drift detected in check mode (one or more `Skill(<name>)` or script `Bash(...)` entries to add, remove, or de-duplicate).
* `2` - configuration error (missing repo root, missing `settings.json`, invalid JSON, missing skills folder).


## Workflow

1. **Check.** Run the script without `--write` from the repo root. Read the printed report.
2. **If `result:ok`,** stop. The allowlist already matches the skills folder.
3. **If `result:drift`,** show the user the lists of entries to add, remove, and de-duplicate, for both the Skills group and the Scripts group, and ask for a one-line yes/no confirmation before applying.
4. **Apply.** On confirmation, rerun with `--write`. Confirm the final status line is `result:written`.
5. **Report.** Print the final list of entries added and removed, plus the absolute path of the file that was updated (the script prints both).


## Output format

The script prints a header, a Skills section, a Scripts section, and a final status line. Each section lists the entries already in sync, the entries to add, the stale entries to remove, and any duplicate entries to collapse; empty sub-lists are omitted:

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
➖ To remove (duplicate entry) (<count>):
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
➖ To remove (duplicate entry) (<count>):
  - Bash(<runner> <path>:*)
  ...

result:ok|drift|written
```


## Bundled resources


### scripts/check-skill-allowlist.mjs

Checks (and, with `--write`, fixes) the managed `Skill(<name>)` and script `Bash(<runner> <path>:*)` entries in `.claude/settings.json` against the `skills/` folder.

Behavior:

* Locates the repo root via `git rev-parse --show-toplevel` (override with `--repo-root <dir>` or `--repo-root=<dir>`).
* Reads `.claude/settings.json`. Uses `skills.directory` if set; otherwise defaults to `skills`.
* Collects desired skill entries from each immediate `skills/*/SKILL.md`, parsing the `name:` field from YAML frontmatter. Falls back to the directory name when `name:` is missing or empty. Subdirectories without `SKILL.md` are skipped.
* Collects desired script entries by recursively scanning each skill folder for files whose extension is in the runner map (`.mjs` -> `node`, `.sh` and `.zsh` -> `zsh`), skipping `node_modules`, `.git`, and dotfiles. Each match becomes `Bash(<runner> <repo-relative-path>:*)`.
* Buckets `permissions.allow` entries: `^Skill\(([^)]+)\)$` identifies the Skills group, and a `Bash(<runner> <path>:*)` entry whose path sits under the skills directory and whose extension matches the declared runner identifies the Scripts group. The runner alternation in that pattern is built from the runner map at load time, so a new runner cannot fall out of the managed group. Entries in neither group (other `Bash(...)`, `Read(...)`, `WebSearch`, etc.) are always preserved untouched.
* Treats a repeated managed entry as drift and reports the extra copies under `To remove (duplicate entry)`, because the writer rebuilds each group from a `Set` and would otherwise collapse them without saying so.
* On `--write`, rebuilds `permissions.allow` by keeping every unmanaged entry in its original position, then appending the desired script entries and the desired `Skill(<name>)` entries, each sorted case-insensitively. Writes back with 2-space indentation and a trailing newline.

The script does not invoke any skills; it only edits the settings file.

The notes block at the top of the script carries its version history. Bump the version and add an entry there whenever the script's behavior changes, and update this file to match.


## Constraints

* Operate only on `.claude/settings.json` (the project-shared settings file). Do not modify `.claude/settings.local.json` or any user-level settings.
* Use the format `Skill(<name>)` exactly, with no extra whitespace inside the parentheses.
* Use the format `Bash(<runner> <path>:*)` exactly for script entries, where `<runner>` is `node` for `.mjs` and `zsh` for `.sh` and `.zsh`, `<path>` is the repo-root-relative path with forward slashes, and the trailing `:*` is always present.
* Derive each skill name from the `name:` frontmatter field in `SKILL.md`. Only fall back to the directory name when the frontmatter is missing or empty.
* Only add or remove entries that match a managed pattern: the literal `Skill(<name>)` pattern, or the script `Bash(<runner> <path>:*)` pattern under the skills directory. Never remove, reorder, or rewrite any other `permissions.allow` entry.
* When removing a stale managed entry, only remove it if its skill folder or script file no longer exists, or if it is a duplicate of an entry that is already present.
* When adding a runner to the map, add it only to the map. The managed-entry pattern is derived from it, so nothing else needs to change.
* Never generate a Bash entry for a plain `.js` file; only the extensions in the runner map are runnable scripts.
* Do not modify any other key in `settings.json` (for example, `$schema`, `skills`, `env`, `hooks`).
* If `.claude/settings.json` exists but is not valid JSON, the script exits with code 2; stop and ask the user to fix it before proceeding.
* Do not invoke any of the skills or scripts being granted; this skill only edits the settings file.
