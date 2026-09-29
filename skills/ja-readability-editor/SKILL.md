---
name: ja-readability-editor
description: Improve readability and scannability of Japanese Markdown documentation using plain Japanese and clear structure while preserving technical accuracy and repository terminology. Use when the user asks to simplify Japanese wording, improve flow, reduce jargon, or rewrite Japanese docs/articles for faster comprehension.
---

# Japanese readability editor

日本語の Markdown ドキュメントを、意味と技術的正確性を保ったまま読みやすく編集する。
まず可読性を上げ、次に表現を整える。


## Inputs

1. Accept one or more Japanese Markdown file paths, pasted Markdown content, or both.
2. Restrict edits to files explicitly requested by the user.
3. If terminology questions appear, cross-check `docs/glossary.yaml`, `docs/general-style-guide-japanese.md`, `docs/hiking-blog-style-guide.md`, and the English counterpart page only as needed.


## Workflow

1. Read the full target document before editing.
2. Identify barriers in this order:
   * Scannability barriers (dense blocks, weak headings, poor list structure).
   * Readability barriers (overly long sentences, heavy nominalization, ambiguous wording).
   * Plain-language gaps (unnecessary complexity, redundant phrasing).
3. Edit only where the change is meaningful. Do not rewrite for cosmetic preference alone.
4. Keep critical technical details, including defaults, feature scope, warnings, and admin options.
5. Keep proper nouns and established hiking terms exactly as written in source docs.
6. Keep factual intent of each action verb (for example, do not replace a specific action with a different one).
7. If author judgment is required, insert `<!-- TODO(ja-readability-editor): ... -->` at the relevant location.
8. Return the revised Markdown and a concise change summary.


## Editing rules

1. Use concise, everyday Japanese. Remove or explain jargon that does not improve understanding.
2. Prefer shorter phrasing when clarity is equal.
3. Use active voice and direct second-person language when appropriate.
4. Prefer direct instruction over soft filler phrases when the sentence is procedural.
5. Keep optionality markers only when true choice or permission must be explicit.
6. Keep tone and politeness consistent in each section (`です・ます` or plain style); do not mix styles without reason.
7. Keep paragraphs focused on one topic and under 150 words.
8. Split sentences with multiple major clauses into shorter sentences.
9. Avoid repetitive sentence openings and repetitive connective phrases.
10. End list items with `。` only when they are full sentences; omit punctuation for fragments.
11. Follow the target page conventions and `AGENTS.md` for punctuation and spacing:
    * Use `、` and `。` for Japanese sentences.
    * Do not insert extra spaces between Japanese and alphanumeric text.
12. Do not add new facts or explanatory scope that was not in the source.


## Structure rules

1. Use clear headings, short sections, and lists where they improve scan speed.
2. Reorganize sections only when it improves findability without changing meaning.
3. Do not create a new heading for a single sentence of content.
4. Split paragraphs or list items that combine multiple topics or steps.


## Output format

Return results in this order:

1. Revised Markdown.
2. Change summary (major readability/scannability improvements).
3. Open questions/TODOs (if any were inserted).
