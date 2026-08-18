---
name: blog-translator
description: Translate a paired content Markdown file between English and Japanese to keep the two language versions in sync. Detects direction (EN->JA or JA->EN) from the source path, finds the 1-to-1 counterpart under the other language folder, translates the prose while preserving frontmatter structure, Markdown, code, links, and VitePress directives, applies the target-language style guides and the EN-JA glossary, and reconciles the `localization` frontmatter state. Use when a user asks to translate, localize, sync, or update the other-language version of a content file, or after editing a `sync` file whose counterpart is now `TODO: drifted`.
---

# Localization translator

Translate a content file between English and Japanese so the paired versions under `contents/en/` and `contents/ja/` stay in 1-to-1 parity. Every file under `contents/en/<path>` has a counterpart at `contents/ja/<path>` (same path below the language folder) holding the other language version of the same page.

Use this skill when the user asks to translate, localize, sync, or refresh the other-language version of a page, or when a `sync` file was edited and its counterpart needs to catch up.


## Required input

A source file path under `contents/en/` or `contents/ja/`. If the invoker did not name a file, default to the file currently open or named in the most recent user turn. Confirm the scope before writing if it is ambiguous.

Determine direction and target path mechanically from the source path:

* Source under `contents/en/<path>` -> translate EN to JA, target is `contents/ja/<path>`.
* Source under `contents/ja/<path>` -> translate JA to EN, target is `contents/en/<path>`.

The target path mirrors the source path exactly below the language folder. Never rename or relocate the file.


## Read before translating

Read the relevant references first; do not translate from memory.

* [EN-JA glossary](../../docs/glossary.yaml) - the approved Japanese rendering of repeated terms. Use these translations for every listed term; do not invent alternatives.
* [Words to avoid](../../docs/words-to-avoid.txt) - terms to flag rather than use.
* Target-language general style guide - [English](../../docs/general-style-guide-english.md) when translating to EN, [Japanese](../../docs/general-style-guide-japanese.md) when translating to JA. Baseline grammar, capitalization, and punctuation rules.
* Target-language technical style guide - [English](../../docs/technical-style-guide-english.md) or [Japanese](../../docs/technical-style-guide-japanese.md). Sentence structure, lists, procedural steps, and alert banners.
* [Markdown style guide](../../docs/markdown-style-guide.md) - banner and reference-style link conventions that both languages share.

The output must read as natural, idiomatic prose in the target language that follows these guides - not a literal word-for-word transfer.


## Localization frontmatter

Each paired file declares a `localization` frontmatter key:

| Value           | Meaning                                                                |
| --------------- | --------------------------------------------------------------------- |
| `sync`          | Default. The two versions are kept in parity and should match.        |
| `TODO: drifted` | The two versions have diverged and need updating.                     |
| `independent`   | The two versions are intentionally different; do not sync them.       |

Rules this skill follows:

* **Stop on `independent`.** If either the source or the target carries `localization: independent`, do not translate. Report that the pair is intentionally independent and ask the user to confirm before overriding.
* **After a successful translation, set both files to `sync`.** The source and the freshly written target should both end with `localization: sync`, since they are now in parity.
* Treat translating a `TODO: drifted` target as reconciling drift: bring it in line with its counterpart, then set both to `sync`.


## What to translate, what to preserve

Translate:

* Prose: paragraphs, list items, table cell text, headings, image alt text and captions, and the human-readable label of Markdown links.
* The `title` and `description` frontmatter values (these render on the page).
* The visible label text inside banners (for example, the `Note:` / `Tip:` lead-in and the sentence after it), keeping the banner keyword token unchanged.

Preserve exactly (do not translate or reformat):

* Frontmatter keys and structural values: `head`, `meta`, `keywords` content, and any non-prose keys. Keep `keywords` as-is unless the user asks otherwise.
* Fenced code blocks, inline code spans, and `<pre>`/`<code>` content.
* Link targets, URLs, file paths, anchors, image `src` paths, and reference-style link definitions (`[id]: url`).
* VitePress directives and tokens: `[[toc]]`, `{{$frontmatter.title}}`, `{{$frontmatter.description}}`, and similar.
* Banner keyword tokens: keep `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!CAUTION]` literally; translate only the surrounding label and sentence.
* Overall document structure: heading order and depth, list nesting, table shape, and the number and order of sections must match the source so the pair stays 1-to-1.


## Workflow

1. **Resolve scope and direction.** From the source path, determine the EN->JA or JA->EN direction and the exact counterpart target path. Confirm if ambiguous.
2. **Check `localization` state.** Read the source and, if it exists, the target frontmatter. If either is `independent`, stop and ask before proceeding.
3. **Read the references.** Load the glossary, words-to-avoid list, and the target-language style guides (general, technical, and Markdown).
4. **Read the source file fully.** Identify prose regions to translate and the regions to preserve verbatim (code, links, directives, frontmatter structure).
5. **Translate into the target language.** Produce natural, guide-compliant prose. Apply every glossary term. Keep the document structure identical to the source.
6. **Write the target file.** Use `Write` to create or replace the counterpart at the mirrored path. Preserve the frontmatter shape and translate only `title` and `description`.
7. **Reconcile `localization`.** Set the target to `localization: sync`. If the source was `TODO: drifted`, set it back to `sync` as well so both files agree.
8. **Lint.** Run `pnpm lint` (or note it should be run) so Prettier and markdownlint normalize the output.
9. **Report.** Summarize the direction, the source and target paths, the `localization` states before and after, any glossary terms applied, and anything you preserved verbatim or flagged for human review.


## Edge cases

* **Missing counterpart.** If the target file does not exist yet, create it at the mirrored path with translated content and `localization: sync`. Note the new file in the report.
* **Glossary gap.** If a key term is not in the glossary, choose the clearest target-language rendering, keep it consistent throughout the file, and flag it in the report so it can be added to the glossary.
* **Structural drift in the source.** If the source has more or fewer sections than the existing target, match the source - it is the translation origin for this run. Do not merge or drop sections silently; note any large structural change.
* **Mixed-language source.** If the source already contains target-language text (for example, an English page quoting Japanese), keep intentional quotations intact and translate only the surrounding prose.
* **Untranslatable proper nouns.** Place names, product names, and people's names follow the glossary if listed; otherwise keep the established romaji or native form and stay consistent.


## What success looks like

* The target file is a faithful, natural-reading translation that follows the target-language style guides and the glossary.
* Document structure, code, links, image paths, directives, and frontmatter shape match the source 1-to-1.
* Both files carry `localization: sync` (unless the pair is `independent`, in which case nothing was changed).
* `pnpm lint` passes on the result.
* The report states the direction, paths, `localization` transitions, and any flags for human review.
