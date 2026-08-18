# Docs

Repository documentation for `tokyo-hiker`.
Most of this folder is the writing style guides that govern the site's content, including general writing rules, documentation-specific rules, and repository-specific conventions for formatting and style within documents.
Published site content lives in `contents/`, not here.


## Change log <!-- omit in toc -->

* 2026-08-18 - Added the writing style guides, document templates, glossary, and frontmatter guide to this repository, alongside the generated site structure snapshot.
* 2026-05-20 - Sanitized for public portfolio use; removed product-specific branding and internal references.


## Table of contents <!-- omit in toc -->

* [Overview](#overview)
* [File structure](#file-structure)
* [General style guides](#general-style-guides)
* [Technical style guides](#technical-style-guides)
* [Markdown style guide](#markdown-style-guide)
* [Frontmatter style guide](#frontmatter-style-guide)
* [Commit style guide](#commit-style-guide)
* [Terminology and glossary](#terminology-and-glossary)
* [Document templates](#document-templates)
* [Site structure snapshot](#site-structure-snapshot)
* [Related folders](#related-folders)


## Overview

These style guides standardize voice, tone, wording, formatting, and translation conventions for this repository's content.

This folder includes the following style guides:

* The general style guides define baseline writing rules such as language, grammar, capitalization, and punctuation.
* The technical style guides define documentation-specific writing rules such as sentence structure, lists, procedural steps, and alert banners.
* The Markdown style guide defines how Markdown documents in this repository should be formatted, such as note banners and reference-style links.
* The frontmatter and commit style guides define the repository-specific conventions for content frontmatter and Git commit messages.

The repository rules that sit above all of these live in [AGENTS.md][repo-agents].


## File structure

```text
docs/
├── README.md ........................... This file
├── general-style-guide-english.md ...... Baseline writing rules (English)
├── general-style-guide-japanese.md ..... Baseline writing rules (Japanese)
├── technical-style-guide-english.md .... Documentation-specific rules (English)
├── technical-style-guide-japanese.md ... Documentation-specific rules (Japanese)
├── markdown-style-guide.md ............. Markdown formatting conventions (banners and links)
├── frontmatter-style-guide.md .......... YAML frontmatter keys for content files
├── repo-commit-style-guide.md .......... Git commit title and body conventions
├── technical-doc-overview.md ........... Overview of help document types
├── glossary.yaml ....................... EN-JA translation glossary
├── words-to-avoid.txt .................. cspell trigger list for terms to flag
├── site-structure.md ................... Auto-generated tree snapshot of contents/
└── templates/ .......................... Document structure templates
    ├── README.md
    ├── how-to-guides-template-structure.md
    ├── how-to-guides-example.md
    └── reference-document-template-structure.md
```


## General style guides

The general style guides define baseline writing rules that apply across all documentation content. They cover language, grammar, capitalization, punctuation, inclusive language, internationalization, formatting, and word usage.

* [General style guide - English][general-style-guide-english] - Rules for English writing, including active voice, contractions, abbreviations, capitalization, punctuation, date and time formats, and a word list.
* [General style guide - Japanese][general-style-guide-japanese] - Rules for Japanese writing, including honorifics, character usage (kanji, hiragana, katakana), punctuation, and formatting.


## Technical style guides

Help documentation writing falls under the technical style guides. These contain documentation-specific writing rules that supplement the general style guides and apply to help documentation authored in Markdown and rendered with VitePress.

* [Technical style guide - English][technical-style-guide-english] - Rules for English documentation, including sentence structure, lists, preparations sections, procedural steps, inline formatting, and alert banners.
* [Technical style guide - Japanese][technical-style-guide-japanese] - Rules for Japanese documentation, including tone, expressions, procedural steps, sentence structure, inline formatting, punctuation, and alert banners.
* [Help documentation overview][technical-doc-overview] - Explains the four types of help documents (tutorials, how-to guides, reference documents, and explanations) and when to use each type. Based on the [Diataxis][diataxis] framework.


## Markdown style guide

* [Markdown style guide][markdown-style-guide] - How Markdown documents in this repository should be formatted, including the markdownlint rules that `pnpm lint` enforces, banners that highlight important notes, and link styling within documents.


## Frontmatter style guide

* [Frontmatter style guide][frontmatter-style-guide] - The YAML frontmatter keys used in content files under `contents/`, covering the page title, the rendered opening line, search metadata, sidebar behavior, and the per-page Mermaid diagram height.


## Commit style guide

* [Git commit style guide][repo-commit-style-guide] - Title format, body format, and emoji conventions for commits in this repository.


## Terminology and glossary

* [EN-JA translation glossary][glossary] - English-to-Japanese term translations organized by topic. Each entry includes the English term, Japanese translation, and usage context.
* [Words to avoid][words-to-avoid] - cspell trigger list of words that should be flagged for review during spell checks.


## Document templates

The [templates/][templates-folder] folder contains structure definitions and examples for supported help document types. See [templates/README.md][templates-readme] for the folder index.

* [How-to guides - template structure][templates-how-to-structure] - Required section order and formatting rules for how-to guide documents.
* [How-to guides - example][templates-how-to-example] - A sample how-to guide that demonstrates the template in practice.
* [Reference document - template structure][templates-reference-structure] - Required section order and formatting rules for reference documents.


## Site structure snapshot

* [Site structure][site-structure] - Auto-generated tree view of the [`contents/`][contents-folder] folder. Generated output, so do not edit it by hand.

Regenerate it with `pnpm tree`, which calls [generate-site-structure.mjs][generate-site-structure].
File enumeration uses `git ls-files`, so gitignored files never appear.
Run it after adding, moving, or renaming content, then run `pnpm lint` before finishing.


## Related folders

* Notes, audits, and reports go in `notes/` instead of here. See [notes/README.md][notes-readme].
* Reusable prompt files go in `prompts/`. See [prompts/README.md][prompts-readme].
* Repository rules live in [AGENTS.md][repo-agents] at the repository root.

<!-- Links -->

[contents-folder]: ../contents/
[diataxis]: https://diataxis.fr/
[frontmatter-style-guide]: frontmatter-style-guide.md
[general-style-guide-english]: general-style-guide-english.md
[general-style-guide-japanese]: general-style-guide-japanese.md
[generate-site-structure]: ../scripts/generate-site-structure.mjs
[glossary]: glossary.yaml
[markdown-style-guide]: markdown-style-guide.md
[notes-readme]: ../notes/README.md
[prompts-readme]: ../prompts/README.md
[repo-agents]: ../AGENTS.md
[repo-commit-style-guide]: repo-commit-style-guide.md
[site-structure]: site-structure.md
[technical-doc-overview]: technical-doc-overview.md
[technical-style-guide-english]: technical-style-guide-english.md
[technical-style-guide-japanese]: technical-style-guide-japanese.md
[templates-folder]: templates/
[templates-how-to-example]: templates/how-to-guides-example.md
[templates-how-to-structure]: templates/how-to-guides-template-structure.md
[templates-readme]: templates/README.md
[templates-reference-structure]: templates/reference-document-template-structure.md
[words-to-avoid]: words-to-avoid.txt
