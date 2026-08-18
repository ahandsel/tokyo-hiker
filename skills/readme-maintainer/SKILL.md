---
name: readme-maintainer
description: Audit the repository for missing or outdated folder `README.md` files. Use after adding new folders, moving files between folders, renaming files, or whenever folder contents change in a way that may make existing READMEs inaccurate.
---

# README maintainer

Ensure every non-empty, git-tracked folder in this repository has a `README.md` that accurately describes its contents and purpose.

This skill enforces the project rule that each folder should contain a `README.md` describing its contents and purpose, and that READMEs are kept up to date with any changes to the folder's contents or purpose.


## Scope

In scope:

* All folders that contain at least one file tracked by git.
* Both top-level folders (for example `scripts/`, `agents/`, `prompts/`) and nested folders (for example `skills/<skill-name>/scripts/`).

Out of scope (skip these, do not create a README):

* The repository root (`README.md` already exists and is hand-curated).
* Dot folders that hold tool configuration only: `.claude/`, `.github/`, `.vscode/`, `.aliases/`, and any nested folders inside them.
* Folders that are empty or only contain other empty folders (no tracked files anywhere beneath).
* Folders that exist only because of build or cache artifacts (for example `__pycache__/`, `node_modules/`).
* Folders that contain only a single `README.md` and no other tracked content (the README would only describe itself).


## Workflow

1. **Discovery**
   * Run `git ls-files` to list all tracked files.
   * Derive the set of folders that contain at least one tracked file (directly or in a subfolder).
   * Filter out the folders listed in "Out of scope" above.

2. **Coverage check**
   * For each in-scope folder, check whether `<folder>/README.md` exists and is tracked by git.
   * Build a list of folders that are missing a README.

3. **Freshness check**
   * For each in-scope folder that already has a README, compare the README against the folder's current contents:
     * List the tracked files and immediate subfolders.
     * Read the README and extract the items it references (filenames, subfolder names, table rows, reference-style links).
     * Flag a README as stale when:
       * The README references files or subfolders that no longer exist.
       * Files or subfolders exist that are not mentioned in the README (when the README is structured as an index of contents).
       * The README's stated purpose contradicts what is actually in the folder.
   * Use `git log -1 --format=%cs -- <folder>/README.md` and `git log -1 --format=%cs -- <folder>` to see whether the folder changed more recently than its README; treat that as a signal to re-read, not as proof of staleness on its own.

4. **Report**

   Before making changes, present a short plan to the user:
   * Missing READMEs - list the folders.
   * Stale READMEs - list the folders and what looks out of date.
   * Folders that are up to date - one-line summary count.

   Ask the user to confirm before writing or editing files when more than a few changes are needed. For a single missing README in a folder the user just touched, proceed directly.

5. **Create or update**
   * For missing READMEs, create a new `README.md` that follows the style described below.
   * For stale READMEs, edit only the parts that are out of date. Do not rewrite the whole file when a targeted edit is enough.
   * Update any index files that link to the affected folder, for example [skills/README.md][] when adding a skill, `scripts/README.md` when adding a script.

6. **Verify**
   * Re-read every README that was created or edited.
   * Confirm that every file and subfolder reference resolves to a real path.
   * Run `pnpm lint` to catch markdown and formatting issues.


## README style

Follow the project's writing and markdown rules from `AGENTS.md`. In particular:

* Use straight quotes, not curly quotes.
* Do not use contractions.
* Use the Oxford comma.
* Use sentence case for headings.
* Use a plain hyphen, never en-dash or em-dash.
* Do not split a sentence across a line break - break only at sentence boundaries so each line contains whole sentences.
* Use `*` for unordered list items, with 2-space indentation for nested lists.
* Leave 2 blank lines above headings and 1 blank line below.
* Prefer reference-style links collected at the bottom of the file.


### Suggested structure

```markdown
# <Folder name in sentence case>

<One or two sentence description of what this folder contains and its purpose.>

## Contents

- [item-1](item-1) - <one-line description>
- [item-2](item-2) - <one-line description>
```

For folders that act as an index of many siblings (for example `skills/` or `scripts/`), use a markdown table with `Name` and `Description` columns, matching the existing convention in [skills/README.md][] and `scripts/README.md`.

For folders whose contents are tightly themed (for example a single skill's `scripts/` folder), a short prose paragraph plus a bullet list is enough.


## Edge cases

* **Renamed file or folder** - update both the folder's own README and any other READMEs or docs that link to the old path. The rule under "File and folder naming" in `AGENTS.md` requires updating every reference.
* **Folder added but not yet populated** - if the folder is tracked because of a `.gitkeep` only, skip it.
* **Folder with sensitive or generated content** - describe the purpose without listing individual files when listing them would be noisy or could leak data.
* **Conflicting prior README** - if a README looks intentionally minimal (for example a top-level folder that defers to a child index), preserve that style; do not expand it without reason.
* **Index folder with many entries** - keep entries sorted alphabetically unless the existing file uses a deliberate grouping (for example `skills/README.md` groups by category); preserve the existing grouping.


## Constraints

* Do not create READMEs for folders listed in "Out of scope".
* Do not rewrite a README that is already accurate just to change its style.
* Do not invent descriptions for files that have not been read; open the file first.
* Do not add a table of contents to a README that is short enough to scan at a glance.

[skills/README.md]: ../README.md
