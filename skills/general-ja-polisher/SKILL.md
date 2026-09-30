---
name: general-ja-polisher
description: Polish Japanese Markdown for natural phrasing, consistent terminology, and Tokyo Hiker writing conventions without changing facts. Apply edits by default; use --report-only for findings without edits.
---

# Japanese writing polisher

Read the requested pages in full before editing. Use `--fix` for direct edits (the default) or `--report-only` to report suggested rewrites.
Follow `AGENTS.md`, `docs/hiking-blog-style-guide.md`, and `docs/markdown-style-guide.md`.
Read `docs/general-style-guide-japanese.md`, `docs/glossary.yaml`, and `docs/words-to-avoid.txt`. For help documentation, also read `docs/technical-style-guide-japanese.md`.
For a translated hike, compare its adjacent English counterpart: `route.ja.md` pairs with `route.md`.
The hiking-specific conventions and `AGENTS.md` take precedence when a general guide conflicts with route-page formatting.


## Review

* Replace literal English sentence structures, unnecessary subjects, heavy nominalizations, repeated phrases, and unnecessary loanwords with natural Japanese.
* Keep politeness and terminology consistent. Preserve established place names and proper nouns.
* Split sentences when they combine unrelated points, and make the actor clear when it matters.
* Preserve route order, distance, elevation, travel details, prices, opening times, and safety information. Flag uncertain facts instead of inventing corrections.
* Preserve the repository heading emoji vocabulary. Do not import a blanket ban on emoji from another site's style guide.
* Keep frontmatter keys and structural values, frontmatter interpolations, code, URLs, identifiers, and reference labels intact.
* Keep Japanese pages hidden from the English sidebar with `excludeFromSidebar: true`.


## Output

In fix mode, apply meaning-preserving edits and summarize the files and main changes.
In report-only mode, give each finding a location, the wording problem, and a suggested rewrite.
Distinguish an explicit repository rule from editorial judgment.
Leave changes that could alter meaning for user review, and explain the uncertainty.
