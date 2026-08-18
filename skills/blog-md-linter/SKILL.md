---
name: blog-md-linter
description: Lint and polish Markdown files in this repo - run the repo auto-fixers, refresh any table of contents, convert inline and autolink links to reference-style links per the repo Markdown style guide, and check style-guide compliance. Use when a user asks to lint, clean up, or style-check a specific Markdown file, or all the Markdown files under contents/.
---

# Markdown linter and style polisher

You are a precise Markdown linter and editor. Your job is to bring one Markdown file, or every Markdown file under a folder, into compliance with this repository's lint configuration and style guides. You fix formatting, refresh the table of contents, and convert links to reference-style links. You never change the meaning of the content.


## Required input

One of:

* A single target file path (for example, `contents/en/tech/coding-fonts.md`).
* A folder to process recursively (for example, `contents/` for every Markdown file on the site).

If the invoker did not specify a target, default to the file currently being edited or the file named in the most recent user turn. Confirm the scope before editing if it is ambiguous.


## Authoritative references

Read and follow these repo files; they take precedence over anything in this skill if they ever disagree:

* [.markdownlint-cli2.jsonc][markdownlint-config] - the enforced linter rules.
* [docs/markdown-style-guide.md][markdown-style-guide] - linter rules, note banners, and the reference-style link convention.
* [docs/general-style-guide-english.md][general-style-guide-english] and [docs/technical-style-guide-english.md][technical-style-guide-english] - prose rules for English content.
* The Japanese counterparts (`*-japanese.md`) when the target lives under `contents/ja/`.


## Workflow

1. **Identify scope.** Resolve the target to a concrete file or list of files. For a folder, process every `.md` and `.markdown` file beneath it.

2. **Run the repo auto-fixers first.** Let the tooling handle the mechanical fixes (Prettier formatting plus the markdownlint `search-replace` corrections: curly quotes, em dashes, en dashes, fullwidth tilde, non-breaking spaces, list-marker style, blank lines, and so on). From the repo root:
   * Single file or folder: `pnpm lint-target <path>` (runs Prettier and markdownlint-cli2 `--fix` scoped to that path).
   * To preview without writing: `pnpm lint-target --check <path>`.
   This is the fastest, most reliable way to satisfy [.markdownlint-cli2.jsonc][markdownlint-config], so do not hand-fix anything the linter already corrects.

3. **Read each file once.** Note the prose regions and the regions to leave alone (fenced code blocks, indented code blocks, inline code spans, HTML blocks, HTML comments, and YAML front matter).

4. **Refresh the table of contents.** Only update a TOC that already exists (a list under a `## Table of contents <!-- omit in toc -->` heading, or a Markdown All in One `<!-- TOC -->` / `<!-- /TOC -->` block). Rebuild the entries from the current headings, in document order, using GitHub-style anchor slugs (lowercase, spaces to dashes, punctuation removed). Do not add a TOC to a file that does not already have one.

5. **Convert links to reference-style links** following the repo convention in [docs/markdown-style-guide.md][markdown-style-guide]. See the section below.

6. **Check style-guide compliance** for anything the linter cannot auto-fix (see "Prose review" below). Use the `Edit` tool for targeted fixes.

7. **Verify.** Re-run `pnpm lint-target --check <path>` and confirm it reports no problems. Re-read the changed ranges to confirm no code block, link target, or front matter value was disturbed and no sentence meaning changed.

8. **Report.** Output a short summary: which files you touched, what changed (links converted, TOC refreshed, style fixes), and anything you deliberately left alone and why.


## Reference-style links (repo convention)

Convert every inline link `[text](url "title")` and every autolink `<url>` to a reference-style link, following [docs/markdown-style-guide.md][markdown-style-guide]:

* **Definitions go at the end of the document**, not at the end of each section.
* Group the definitions with comment headers, including only the blocks you need:
  * `<!-- Links -->` for external and relative document links.
  * `<!-- Internal links -->` for same-page anchors (for example, `#more`).
  * `<!-- Image links -->` for images.
* Use **kebab-case IDs**. Prefix image IDs with `img-`.
* Keep definitions **sorted alphabetically within each block**.
* Reuse one definition for repeated URLs; never create duplicate definitions for the same URL.
* Preserve a link title if present: `[id]: url "title"`. Do not invent titles.
* Do not change the visible link text or the alt text of images. Only change the link format and add the definitions.

Example shape:

```md
For more, see [Markdown extension examples][md-ex] and the [full list of extensions][vitepress-md].

See also the [More](#more) section below.

![Step 1][img-step1]

<!-- Links -->

[md-ex]: ./markdown-examples.md
[vitepress-md]: https://vitepress.dev/guide/markdown

<!-- Internal links -->

[more]: #more

<!-- Image links -->

[img-step1]: /markdown-examples/step1.png
```

After conversion: no inline links or autolinks remain outside code or HTML, every `[text][id]` has exactly one matching definition, and there are no orphaned or duplicate definitions.


## Prose review

The auto-fixers do not catch wording. Check the prose against the style guides and fix what they require:

* Do not use contractions (`do not`, not `don't`). Leave possessive `'s` alone.
* Use the Oxford comma in lists of three or more items.
* Apply sentence case to headings and subheadings (capitalize only the first word and proper nouns).
* Keep capitalization and end punctuation consistent within lists and parallel structures.
* Prefer simple, clear, non-idiomatic wording for non-native readers, without changing required technical terms.
* Provide descriptive alt text for images and a language hint on fenced code blocks where one is missing.

If a prose-polishing pass is the main goal, the `general-en-polisher` skill covers these writing rules in depth; this skill focuses on linting, the table of contents, and reference-style links.


## What NOT to change

* Content inside fenced code blocks, indented code blocks, inline code spans, HTML blocks, and HTML comments.
* URLs, link targets, file paths, anchor slugs, and identifiers.
* Front matter keys and structural values.
* The meaning of any sentence. These are mechanical and stylistic fixes, not a rewrite.
* Quoted text that must stay verbatim (for example, an exact error message). If a rule would change its meaning, leave it and flag it in the summary.


## Localization note

These are formatting-only changes that preserve content parity, so do **not** flip a file's `localization` frontmatter to `TODO: drifted` for lint fixes alone. When you lint a file under `contents/en/` or `contents/ja/`, prefer to lint its 1-to-1 counterpart in the other language in the same pass so both versions stay consistently formatted.


## What success looks like

* `pnpm lint-target --check <path>` reports no problems for every processed file.
* Any existing table of contents matches the current headings.
* Every link is reference-style, defined at the end of the document under the correct comment block, kebab-case, and sorted; no inline links or autolinks remain outside code or HTML.
* No code, link target, front matter value, or sentence meaning changed.
* The summary lists exactly what changed and what (if anything) was skipped and why.


<!-- Links -->

[general-style-guide-english]: ../../docs/general-style-guide-english.md
[markdown-style-guide]: ../../docs/markdown-style-guide.md
[markdownlint-config]: ../../.markdownlint-cli2.jsonc
[technical-style-guide-english]: ../../docs/technical-style-guide-english.md
