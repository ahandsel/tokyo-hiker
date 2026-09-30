---
name: vitepress-include-lint
description: 'Verify VitePress markdown include directives (`@include:`) for strict comment formatting and valid target file paths. Use when users ask to check, lint, or validate `<!--@include: ...-->` usage across docs.'
---

# VitePress include lint

Verify that every VitePress include directive is formatted and resolved correctly.


## Quick start

Run the bundled checker from the repository root:

```bash
node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents
```


## What to validate

For each include directive line:

1. Enforce no space between `<!--` and `@include:`.
2. Allow whitespace before `-->`, matching the examples in `AGENTS.md`.
3. Resolve the referenced path from the source markdown file directory and verify the target file exists.
4. Ignore fragment suffixes (for example `#english`) when checking file existence.


## Workflow

1. Run the checker on requested files or directories.
2. Review findings as `file:line:column` entries.
3. If requested, fix only the reported directives and rerun until clean.


## Bundled resources


### scripts/check-vitepress-includes.mjs

Checks markdown files for include formatting and path validity.

Examples:

* `node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents`
* `node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents/level-1 contents/area`
* `node skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs --paths contents --repo-root .`
