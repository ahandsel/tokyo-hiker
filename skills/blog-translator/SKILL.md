---
name: blog-translator
description: Translate a content Markdown page between English and Japanese to keep the two language versions in step. A Japanese page sits beside its English counterpart in the same folder as `<name>.ja.md`, and translations are optional. Detects direction (EN->JA or JA->EN) from the file name, finds or creates the counterpart, translates the prose while preserving frontmatter structure, Markdown, code, links, heading emoji, and VitePress directives, converts the Japanese place-name form, applies the target-language style guides and the EN-JA glossary, and links a new Japanese page from its English counterpart. Use when a user asks to translate, localize, sync, or update the other-language version of a content file.
---

# Localization translator

Translate a content page between English and Japanese so its two language versions stay in step.

This repository has no locale folders and no `localization` frontmatter key. A Japanese page sits beside its English counterpart in the same folder, with a `.ja.md` suffix:

```text
contents/level-1/takao-inariyama.md      (English)
contents/level-1/takao-inariyama.ja.md   (Japanese)
```

Translations are optional, so most English pages have no Japanese counterpart. The "Japanese pages" section of [docs/frontmatter-style-guide.md][frontmatter-style-guide] holds the full convention.

Use this skill when the user asks to translate, localize, sync, or refresh the other-language version of a page.


## Required input

A source content file path under `contents/`. If the invoker did not name a file, default to the file currently open or named in the most recent user turn. Confirm the scope before writing if it is ambiguous.

Determine direction and target path mechanically from the file name:

* Source `<name>.md` -> translate EN to JA, target is `<name>.ja.md` in the same folder.
* Source `<name>.ja.md` -> translate JA to EN, target is `<name>.md` in the same folder.

Never rename or relocate either file.


## Read before translating

Read the relevant references first; do not translate from memory.

* [EN-JA glossary][glossary] - the approved Japanese rendering of repeated terms. Use these translations for every listed term; do not invent alternatives.
* [Words to avoid][words-to-avoid] - terms to flag rather than use.
* Target-language general style guide - [English][general-style-guide-english] when translating to EN, [Japanese][general-style-guide-japanese] when translating to JA. Baseline grammar, capitalization, and punctuation rules.
* Target-language technical style guide - [English][technical-style-guide-english] or [Japanese][technical-style-guide-japanese]. Sentence structure, lists, procedural steps, and alert banners.
* [Markdown style guide][markdown-style-guide] - banner and reference-style link conventions that both languages share.
* [Hiking blog style guide][hiking-blog-style-guide] - the heading emoji, which stay the same in both languages, and the Japanese place-name forms, which differ between them.
* [Frontmatter style guide][frontmatter-style-guide] - the keys a page carries and the rules for a Japanese page.

The output must read as natural, idiomatic prose in the target language that follows these guides - not a literal word-for-word transfer.


## Check the pair before writing

No frontmatter key records whether a pair is in sync, so compare the two files themselves:

* **Stop on a reproduced page.** A page that reproduces an outside article word for word must stay exactly as published. [hatonosu-valley.ja.md][hatonosu-ja] is one: its `転載元` section credits the source, and its English counterpart is an adaptation with its own structure. Never overwrite a reproduced page with a translation. Report it and ask the user what to do.
* **Ask before replacing a different structure.** If the target exists and its sections differ a lot from the source, the two versions may differ on purpose. Show the difference and ask before replacing the target.
* Otherwise, treat an existing target as out of date and bring it in line with the source.


## What to translate, what to preserve

Translate:

* Prose: paragraphs, list items, table cell text, headings, image alt text and captions, and the human-readable label of Markdown links.
* The `title` and `description` frontmatter values (these render on the page). Keep them in straight single quotes.
* The visible label text inside banners (for example, the `Note:` / `Tip:` lead-in and the sentence after it), keeping the banner keyword token unchanged.
* The visible labels in a `mermaid` block. Keep its syntax, node ids, and `style` lines unchanged.

Convert the place-name form, following [hiking-blog-style-guide.md][hiking-blog-style-guide]:

* An English page gives a place its Japanese name once, as a code span inside the link text, for example ``[Kori Station / `古里駅`][kori-sta]``.
* A Japanese page writes the name as ordinary prose with no backticks, for example `[古里駅][kori-sta]`.

Preserve exactly (do not translate or reformat):

* Frontmatter keys and structural values, such as `excludeFromSidebar` and `mermaidHeight`, with one exception: a Japanese page always sets `excludeFromSidebar: true`.
* Fenced code blocks other than `mermaid`, `<pre>`/`<code>` content, and inline code spans other than the Japanese place names above.
* Link targets, URLs, file paths, image `src` paths, and reference-style link definitions (`[id]: url`). A same-page anchor is the one exception: it follows the translated heading, so rebuild each `<!-- Internal links -->` definition from the new heading, keeping the trailing hyphen that a heading emoji leaves.
* VitePress directives and tokens: `{{$frontmatter.title}}`, `{{$frontmatter.description}}`, `<!--@include: ...-->`, and similar.
* Banner keyword tokens: keep `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!CAUTION]` literally; translate only the surrounding label and sentence.
* Heading emoji: give each section the same emoji in both languages, with a space before it.
* Overall document structure: heading order and depth, list nesting, table shape, and the number and order of sections must match the source, so the two pages stay recognizable side by side.


## Link the pair

The sidebar and the folder landing lists are English, and a Japanese page sets `excludeFromSidebar: true`, so a reader reaches a Japanese page only through a link on its English counterpart.

* The English page links to the Japanese page from its `Related page 🔗` section, with `🇯🇵` at the end of the item. [hatonosu-valley.md][hatonosu-en] is the worked example.
* The Japanese page links back to the English page, for example `英語版は [Hatonosu Valley][hatonosu-valley-2] をご覧ください。`

Add whichever link is missing whenever you create or update a pair.


## Workflow

1. **Resolve scope and direction.** From the file name, determine the EN->JA or JA->EN direction and the counterpart path in the same folder. Confirm if ambiguous.
2. **Check the pair.** Read the source and, if it exists, the target. Stop on a reproduced page, and ask before replacing a target whose structure differs a lot (see "Check the pair before writing").
3. **Read the references.** Load the glossary, words-to-avoid list, the target-language style guides (general, technical, and Markdown), and the hiking blog and frontmatter style guides.
4. **Read the source file fully.** Identify prose regions to translate and the regions to preserve verbatim (code, links, directives, frontmatter structure).
5. **Translate into the target language.** Produce natural, guide-compliant prose. Apply every glossary term and convert the place-name form. Keep the document structure identical to the source.
6. **Write the target file.** Use `Write` to create or replace the counterpart in the same folder. Preserve the frontmatter shape, translate only `title` and `description`, and set `excludeFromSidebar: true` on a Japanese page.
7. **Link the pair.** Add any missing link between the two pages (see "Link the pair").
8. **Check the repository.** After creating a new file, run `pnpm tree` to regenerate `docs/site-structure.md`. Then run `pnpm lint` so Prettier and markdownlint normalize the output, and `pnpm test`.
9. **Report.** Summarize the direction, the source and target paths, whether the target was new or replaced, the links added, any glossary terms applied, and anything you preserved verbatim or flagged for human review.


## Edge cases

* **Missing counterpart.** If the target file does not exist yet, create it in the same folder with translated content, then link the pair. Note the new file in the report.
* **Glossary gap.** If a key term is not in the glossary, choose the clearest target-language rendering, keep it consistent throughout the file, and flag it in the report. The glossary takes a term the first time it appears on a second page, and a page and its counterpart count as two pages.
* **Structural drift in the source.** If the source has more or fewer sections than the existing target, match the source - it is the translation origin for this run. Do not merge or drop sections silently; note any large structural change, and ask first when the difference looks intentional.
* **Mixed-language source.** If the source already contains target-language text (for example, an English page quoting Japanese), keep intentional quotations intact and translate only the surrounding prose.
* **Untranslatable proper nouns.** Place names, product names, and people's names follow the glossary if listed; otherwise keep the established romaji or native form and stay consistent. Keep a Japanese name exactly as published, including full-width characters and Japanese brackets.


## What success looks like

* The target file is a faithful, natural-reading translation that follows the target-language style guides and the glossary.
* Document structure, code, links, image paths, directives, heading emoji, and frontmatter shape match the source; only the place-name form and same-page anchors differ.
* The Japanese page sets `excludeFromSidebar: true`, and the two pages link to each other.
* No reproduced page was overwritten.
* `pnpm lint` passes on the result.
* The report states the direction, paths, links added, and any flags for human review.

<!-- Links -->

[frontmatter-style-guide]: ../../docs/frontmatter-style-guide.md
[general-style-guide-english]: ../../docs/general-style-guide-english.md
[general-style-guide-japanese]: ../../docs/general-style-guide-japanese.md
[glossary]: ../../docs/glossary.yaml
[hatonosu-en]: ../../contents/level-1/hatonosu-valley.md
[hatonosu-ja]: ../../contents/level-1/hatonosu-valley.ja.md
[hiking-blog-style-guide]: ../../docs/hiking-blog-style-guide.md
[markdown-style-guide]: ../../docs/markdown-style-guide.md
[technical-style-guide-english]: ../../docs/technical-style-guide-english.md
[technical-style-guide-japanese]: ../../docs/technical-style-guide-japanese.md
[words-to-avoid]: ../../docs/words-to-avoid.txt
