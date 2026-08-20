---
name: script-auditor
description: Audit and enforce the AGENTS.md "Scripts" guidelines for helper scripts in this repo - banning Python, preferring Node.js `.mjs` modules or zsh, requiring `--help` output, a top-of-file notes section (general notes, usage, output), and status emojis. Use when adding or reviewing a helper script, or to sweep the repo for scripts that do not follow the guidelines.
---

# Script auditor

Check helper scripts in this repository against the "Scripts" guidelines in `AGENTS.md`, and bring them into compliance. Use this skill when creating a new helper script, reviewing one in a diff, or sweeping the whole repo for drift.

The guidelines this skill enforces:

* **Language.** Default to Node.js ES modules (`.mjs`) or zsh. Python is banned (the overhead of managing Python environments across machines is not worth it). Non-module JavaScript (`.js` / `.cjs`) and non-zsh shells are allowed but not the default.
* **`--help`.** Every script must support `--help` and print clear, informative usage.
* **Notes section.** Every script must carry a notes section near the top with general notes (what it does), usage (how to invoke it), output (what it generates or returns), and a version history (a reverse-chronological list of versions with date and a summary of changes).
* **Status emojis.** Scripts should use emojis to clarify status, for example ✅ for success, ⚠️ for warnings, and ❌ for errors.


## Scope

In scope:

* Helper and tooling scripts tracked by git under a `scripts/` directory - both the top-level `scripts/` folder and a skill's own `skills/<skill-name>/scripts/` folder.
* Files with a script extension (`.mjs`, `.js`, `.cjs`, `.sh`, `.zsh`, `.bash`, `.py`).

Out of scope (the auditor skips these):

* Vendored Figma plugin scripts under `skills/figma-*/scripts/`. These are Figma Plugin API snippets run inside Figma via `use_figma`, not repo CLI helpers, so the script-authoring guidelines do not apply to them.
* Non-script files (Markdown, CSV, JSON, YAML, lockfiles).
* Source files that are not helper scripts and do not live under a `scripts/` directory.


## Quick start

Run the bundled auditor from anywhere inside the repo (requires Node.js 24+):

```bash
# Sweep all tracked helper scripts and print a per-script report.
node skills/script-auditor/scripts/audit-helper-scripts.mjs

# Audit specific scripts (for example, the ones in the current diff).
node skills/script-auditor/scripts/audit-helper-scripts.mjs scripts/my-tool.mjs

# Machine-readable output for further processing.
node skills/script-auditor/scripts/audit-helper-scripts.mjs --json
```

Exit codes:

* `0` - every audited script passes.
* `1` - at least one warning or failure was found.
* `2` - configuration error (not a git checkout, no scripts found, unreadable file).


## Workflow

1. **Scope the run.**
   * When the user just added or changed scripts, pass those paths explicitly so the report stays focused.
   * For a repo-wide health check, run with no file arguments to audit every tracked helper script.

2. **Audit.** Run the bundled script. Read the per-script report. Each script gets one of three verdicts:
   * ✅ ok - all four checks pass.
   * ⚠️ warning - a soft signal only (for example, a `.js` file that should be `.mjs`, or a bash script where zsh is the default). Mention it, but do not block on it.
   * ❌ failing - a hard guideline is broken (Python, missing `--help`, or an incomplete notes section).

3. **Report.** Summarize for the user: which scripts pass, which have warnings, and which fail and why. Group by guideline so the fix list is clear.

4. **Fix (on request or when authoring).**
   * **New script you are writing:** make it pass all four checks before finishing - use `.mjs` or zsh, add a notes section, wire up `--help`, and use status emojis. Use the template below.
   * **Existing failing script:** apply the smallest change that satisfies the guideline. Add a notes section, add `--help` handling, or swap status messages for emoji-prefixed ones. Do not rewrite a working script wholesale.
   * **Python script:** flag it for a rewrite to `.mjs` or zsh. This is a larger change - confirm with the user before rewriting, and preserve the script's behavior and any `pnpm` script wiring.

5. **Re-audit.** Run the auditor again on the changed files and confirm the verdict is now ✅.

6. **Update indexes.** If you added a new script, update `scripts/README.md` (or the relevant folder README) and any `pnpm` script wiring in `package.json`, per the project conventions.


## What each check looks for

The checks are heuristics that surface candidates for review, not a hard gate. Confirm a flagged finding by reading the file before acting on it.

* **Language.** Reads the file extension and shebang. `.py` or a `python` shebang fails. `.mjs` and zsh pass. `.js` / `.cjs` and non-zsh shells warn.
* **`--help`.** Looks for `--help` anywhere in the source. A script that parses `--help` but routes it elsewhere may need a manual check.
* **Notes section.** Scans the first ~60 lines (the leading comment block) for the words that mark the four required parts: a general description (`general notes`, `description`, `purpose`, or `notes`), `usage`, `output`, and `version history`. A script that documents these with different wording may need the keywords added so the intent is explicit.
* **Status emojis.** Looks for any status emoji (✅, ⚠️, ❌, and common siblings) in the source. A library-style script with no user-facing output is a reasonable exception - note it and move on.


## Script template

A new Node.js helper that passes all four checks starts like this:

```javascript
// my-tool.mjs notes
// General notes:
// * Purpose: <one-line description of what this script does>.
// Usage:
//   node scripts/my-tool.mjs [options]
// Output:
// * <what the script prints or writes, and its exit codes>.
// Version history:
// * v1.0 - <YYYY-MM-DD> - Initial release.

function printUsage() {
  console.log('Usage: node my-tool.mjs [options]');
}

// ... parse argv, handle --help by calling printUsage() and exiting ...

console.log('✅ Done.'); // use ✅ / ⚠️ / ❌ for status
```

For zsh, put the same notes block in `#` comments near the top, handle `--help`/`-h` in argument parsing, and prefix status output with the same emojis. See `skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs` for a fully compliant example, and `scripts/generate-yaml.sh` for the version history format (a reverse-chronological `vX.Y - YYYY-MM-DD - summary` list).


## Bundled resources


### scripts/audit-helper-scripts.mjs

Audits helper scripts against the four guidelines and prints a per-script verdict.

Behavior:

* Locates the repo root via `git rev-parse --show-toplevel` (override with `--repo-root <dir>`).
* With no file arguments, discovers tracked scripts via `git ls-files`, keeping files under a `scripts/` path segment with a script extension, and skipping vendored `skills/figma-*/scripts/`.
* With file arguments, audits exactly those paths, skipping anything that is not a recognized script.
* Runs four checks per file (language, `--help`, notes section, status emojis) and rolls them up into one verdict, where `fail` beats `warn` beats `ok`.
* Prints a human-readable report by default, or a JSON array with `--json`.
* Exits `0` when everything passes, `1` when any warning or failure is found, and `2` on a configuration error.

The script only reads files; it never edits them. Fixes are applied by the skill workflow with your judgment.


## Constraints

* Treat warnings as advisory. Do not rewrite a `.sh` or `.js` script to zsh or `.mjs` just to clear a warning unless the user asks.
* Treat failures as guideline violations to fix, but apply the smallest change that satisfies the guideline rather than rewriting a working script.
* Never rewrite a Python script to `.mjs` or zsh without first confirming with the user; preserve behavior and any `pnpm` wiring.
* Do not add `--help`, notes, or emojis to the vendored Figma plugin scripts - they are out of scope.
* Before acting on a flagged finding, read the file - the checks are heuristics and can misfire on unusual wording or structure.
