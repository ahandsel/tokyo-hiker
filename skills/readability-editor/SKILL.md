---
name: readability-editor
description: Improve readability and scannability of Markdown documentation using plain language and clear structure while preserving technical accuracy. Use when the user asks to simplify wording, improve flow, reduce jargon, or rewrite docs/articles for faster comprehension.
---

# Readability editor

Edit the target document for readability first, then for polish.
Preserve meaning, technical detail, and product terminology.


## Inputs

1. Accept one or more Markdown file paths, pasted Markdown content, or both.
2. Restrict edits to files explicitly requested by the user.


## Workflow

1. Read the full document before editing.
2. Identify barriers in this order:
   * Scannability barriers (dense blocks, weak headings, poor list structure).
   * Readability barriers (jargon, long clauses, ambiguous wording).
   * Plain-language gaps (unnecessary complexity, redundancy).
3. Edit only where the change is meaningful. Do not rewrite for cosmetic preference alone.
4. Keep critical technical details, including defaults, feature scope, warnings, and admin options.
5. Keep button labels, menu names, and UI strings exactly as written in source docs.
6. Keep factual intent of each action verb (for example, do not replace a specific action with a different one).
7. If author judgment is required, insert `<!-- TODO(readability-editor): ... -->` at the relevant location.
8. Return the revised Markdown and a concise change summary.


## Editing rules

1. Use concise, everyday language. Remove or explain jargon that does not improve understanding.
2. Prefer shorter phrasing when clarity is equal.
3. Use active voice, present tense, and direct second-person language (`you`, `your`) when appropriate.
4. Replace `you can` with a direct verb when it introduces an instruction rather than permission.
5. Keep `you can`, `optionally`, or `if you want` only when true choice or permission must be explicit.
6. Use sentence case for headings and list items.
7. Start at least half of procedural steps with a direct verb unless a different structure is clearer.
8. Keep paragraphs focused on one topic and under 150 words.
9. Split sentences with multiple major clauses into shorter sentences.
10. Keep no more than 25% of sentences above 20 words.
11. Avoid consecutive sentences with the same opening pattern.
12. End list items with periods only when they are full sentences; omit periods for fragments.
13. Do not add new product facts or explanatory scope that was not in the source.


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
