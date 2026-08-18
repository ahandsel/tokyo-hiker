---
name: skill-allowlist-syncer
description: Fully sync `Skill(<name>)` entries in `.claude/settings.json` under `permissions.allow` with the skills in the repo's `skills/` folder, adding entries for new skills and removing entries for skills that no longer exist.
---

# Skill allowlist syncer

Scan the repo's `skills/` folder for skill definitions and reconcile `.claude/settings.json` so the set of `Skill(<name>)` entries in `permissions.allow` exactly matches the current skills. Add entries for new skills and remove entries for skills that no longer exist. Non-skill permission entries (for example `Bash(...)`, `Read(...)`) are never touched.


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
* `1` - drift detected in check mode (one or more `Skill(<name>)` entries to add or remove).
* `2` - configuration error (missing repo root, missing `settings.json`, invalid JSON, missing skills folder).


## Workflow

1. **Check.** Run the script without `--write` from the repo root. Read the printed report.
2. **If `result:ok`,** stop. The allowlist already matches the skills folder.
3. **If `result:drift`,** show the user the lists of entries to add and remove and ask for a one-line yes/no confirmation before applying.
4. **Apply.** On confirmation, rerun with `--write`. Confirm the final status line is `result:written`.
5. **Report.** Print the final list of skill entries added and removed, plus the absolute path of the file that was updated (the script prints both).


## Output format

The script prints a header, three optional sections, and a final status line:

```text
🔍 settings:           <absolute path>
🔍 skills_dir:         <absolute path>
🔍 skills_found:       <count>
🔍 non_skill_entries:  <count>

✅ Already in sync (<count>):
  - Skill(<name>)
  ...

➕ To add (<count>):
  - Skill(<name>)
  ...

➖ To remove (skill folder no longer exists) (<count>):
  - Skill(<name>)
  ...

result:ok|drift|written
```


## Bundled resources


### scripts/check-skill-allowlist.mjs

Checks (and, with `--write`, fixes) `Skill(<name>)` entries in `.claude/settings.json` against `skills/` subdirectories.

Behavior:

* Locates the repo root via `git rev-parse --show-toplevel` (override with `--repo-root <dir>`).
* Reads `.claude/settings.json`. Uses `skills.directory` if set; otherwise defaults to `skills`.
* Collects desired skill names from each immediate `skills/*/SKILL.md`, parsing the `name:` field from YAML frontmatter. Falls back to the directory name when `name:` is missing or empty. Subdirectories without `SKILL.md` are skipped.
* Buckets `permissions.allow` entries against the regex `^Skill\(([^)]+)\)$`. Non-Skill entries (`Bash(...)`, `Read(...)`, `WebSearch`, etc.) are always preserved untouched.
* On `--write`, rebuilds `permissions.allow` by keeping every non-Skill entry in its original position, then appending the desired `Skill(<name>)` entries sorted case-insensitively. Writes back with 2-space indentation and a trailing newline.

The script does not invoke any skills; it only edits the settings file.


## Constraints

* Operate only on `.claude/settings.json` (the project-shared settings file). Do not modify `.claude/settings.local.json` or any user-level settings.
* Use the format `Skill(<name>)` exactly, with no extra whitespace inside the parentheses.
* Derive each skill name from the `name:` frontmatter field in `SKILL.md`. Only fall back to the directory name when the frontmatter is missing or empty.
* Only add or remove entries that match the literal pattern `Skill(<name>)`. Never remove, reorder, or rewrite non-skill `permissions.allow` entries.
* When removing a stale `Skill(<name>)` entry, only remove it if `<name>` is not in the desired skills set.
* Do not modify any other key in `settings.json` (for example, `$schema`, `skills`, `env`, `hooks`).
* If `.claude/settings.json` exists but is not valid JSON, the script exits with code 2; stop and ask the user to fix it before proceeding.
* Do not invoke any of the skills being granted; this skill only edits the settings file.
