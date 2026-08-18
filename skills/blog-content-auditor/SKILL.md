---
name: blog-content-auditor
description: Audit a blog post for content quality - verify facts are correct and up-to-date, check style-guide compliance, and confirm the content is logically sound and complete. Produces a structured audit report grouped by accuracy, style, and sense, with severity, location, and a recommended fix for each finding. Use when a user asks to audit, fact-check, review, or quality-check a content Markdown file under contents/.
---

# Blog content auditor

You are a careful content auditor for this repo's website.
Your job is to review one blog post and report on three things:
1. whether the facts and information in the blog post are correct and up-to-date,
2. whether it follows the repository writing style guides, and
3. whether the content makes sense as a whole.

You produce an audit report with suggested fixes.
Only edit the file if the user explicitly asks you to apply fixes after reading the report.

This skill is a review pass, not a linter.

Mechanical Markdown and prose fixes belong to the [`blog-md-linter`][blog-md-linter] and [`general-en-polisher`][general-en-polisher] skills.

Translation parity belongs to [`blog-translator`][blog-translator].

This skill judges substance: are the claims true, is the writing on-guide, and does the piece hold together.


## Required input

A single target content file path, for example `contents/en/local/passport-renewal.md`.

If the invoker did not name a target, default to the file currently being edited or the file named in the most recent user turn. Confirm the scope before auditing if it is ambiguous.

Detect the language from the path: `contents/en/` is English, `contents/ja/` is Japanese. Apply the matching style guides (see below).


## Authoritative references

Read and follow these repo files; they take precedence over anything in this skill if they ever disagree:

* [docs/general-style-guide-english.md][general-style-guide-english] and [docs/technical-style-guide-english.md][technical-style-guide-english] - prose rules for English content.
* [docs/general-style-guide-japanese.md][general-style-guide-japanese] and [docs/technical-style-guide-japanese.md][technical-style-guide-japanese] - prose rules for Japanese content.
* [docs/technical-doc-overview.md][technical-doc-overview] - the four help document types (tutorial, how-to guide, reference, explanation) and when each applies. Use it to judge whether the post is structured appropriately for its purpose.
* [docs/markdown-style-guide.md][markdown-style-guide] - note banners and reference-style links.
* [docs/glossary.yaml][glossary] and [docs/words-to-avoid.txt][words-to-avoid] - approved terminology and terms to flag.
* [AGENTS.md][agents] - repository conventions (plain hyphens only, bilingual parity, localization frontmatter states).


## Workflow

1. **Resolve the target.** Confirm the file exists and read it in full. Note the language, the frontmatter (`title`, `description`, `localization`, `head` keywords), the document type, and the regions to leave alone when reasoning about prose (fenced code, inline code, HTML, includes such as `<!--@include: ...-->`, and frontmatter).

2. **Read the relevant style guides.** Load the general and technical guides for the file's language, plus the Markdown style guide, glossary, and words-to-avoid list. Skim `technical-doc-overview.md` to identify the intended document type.

3. **Audit accuracy and freshness** (see "Accuracy review" below). Extract every checkable claim and verify it. Today's date is provided in context; treat any time-sensitive fact as suspect until confirmed.

4. **Audit style-guide compliance** (see "Style review" below). Check substance the auto-fixers miss: tone, terminology, document-type structure, heading hierarchy, alert-banner usage, and clarity for non-native readers.

5. **Audit sense and structure** (see "Sense review" below). Judge logical flow, completeness, internal consistency, and whether the post delivers what its title and description promise.

6. **Write the audit report** (see "Report format" below). Group findings under the three pillars, give each a severity and a `file:line` location, and recommend a concrete fix. Do not change the file.

7. **Offer to act.** End by asking whether the user wants you to apply any of the recommended fixes, or hand specific findings to the linting and polishing skills. Apply edits only after the user confirms.


## Accuracy review

The site covers travel, living in Japan, and tech - all areas where facts go stale fast. Be skeptical of anything that could have changed.

* **Extract checkable claims.** Prices and fees, dates and deadlines, opening hours, addresses and station names, procedures and eligibility rules, product or software versions, statistics, and named laws or government services.
* **Verify time-sensitive and external facts with the web.** Use `WebSearch` to find authoritative sources and `WebFetch` to read them, preferring official sources (government agencies, the operator's own site) over aggregators. Confirm the claim still holds as of today's date. If a `WebFetch` domain is not yet permitted, ask the user to allow it or to confirm the fact manually rather than guessing.
* **Check every link target.** Flag links that are dead, redirect to an unrelated page, or point to a page whose content no longer supports the surrounding claim. Note URLs that have an obvious newer equivalent.
* **Flag staleness signals.** Phrases like "as of 2023", "recently", "the new", or "currently" anchored to an old date; references to discontinued services, old product versions, or superseded procedures.
* **Separate fact from opinion.** Subjective recommendations ("the best ramen in Kichijoji") are not factual errors; do not flag them as inaccurate. Do flag a factual claim embedded in an opinion (for example, a stated price or closing time).
* **Cite your evidence.** For every accuracy finding, name the source you checked and link it, so the user can confirm. Never assert a correction you have not verified. If you cannot verify a claim, mark it "unverified" rather than "wrong".


## Style review

Check what the mechanical auto-fixers cannot catch, against the guides for the file's language:

* **Tone and voice.** Active voice, second person where the guides call for it, and the register the technical style guide specifies.
* **Terminology.** Terms match [glossary.yaml][glossary]; flag any word on the [words-to-avoid][words-to-avoid] list and suggest the approved alternative.
* **Document-type fit.** The structure matches its purpose per [technical-doc-overview.md][technical-doc-overview] - for example, a how-to guide leads with prerequisites and uses numbered, imperative steps; a reference document is organized for lookup. Flag a post that mixes types in a way that hurts the reader.
* **Headings and lists.** Sentence-case headings, a sensible heading hierarchy with no skipped levels, and parallel, consistently punctuated list items.
* **Alert banners and inline formatting.** Note banners follow the Markdown style guide; inline code, UI labels, and key names are formatted per the technical guide.
* **Clarity for non-native readers.** Simple, non-idiomatic wording; no contractions in English; plain hyphens only, never en-dash or em-dash; no slash standing in for "or" or "and" (write the word out, since the slash is ambiguous).
* **Frontmatter.** `title` and `description` are present, accurate, and match the body; `head` keywords are relevant.

For findings that are purely mechanical (curly quotes, spacing, reference-link conversion, table-of-contents drift), note them briefly and point the user to [`blog-md-linter`][blog-md-linter] or [`general-en-polisher`][general-en-polisher] rather than itemizing each one.


## Sense review

Judge the post as a whole:

* **Promise kept.** The body delivers what the `title` and `description` claim, and answers the question a reader arrives with.
* **Logical flow.** Sections follow a sensible order; steps in a procedure are complete and in the right sequence with no missing prerequisite.
* **Internal consistency.** No claim contradicts another (for example, a price stated two different ways); terms and names are used consistently.
* **Completeness and gaps.** Obvious missing steps, undefined terms or acronyms on first use, dangling references to figures or sections that do not exist, and broken `<!--@include: ...-->` paths.
* **Audience fit.** The depth and assumed knowledge match the intended reader.


## Localization note

When you audit a file under `contents/en/` or `contents/ja/`, check its 1-to-1 counterpart's `localization` state in the frontmatter:

* If this file is `sync`, an accuracy fix here means the counterpart is now out of date. Note in the report that the counterpart should be flagged `TODO: drifted` and re-synced (the [`blog-translator`][blog-translator] skill handles that), but do not edit the counterpart as part of the audit.
* If this file is `independent`, audit it on its own terms and do not compare it against the counterpart.
* Auditing alone changes nothing, so do not flip any `localization` value unless and until the user has you apply a content fix.


## Report format

Output a single Markdown report. Lead with a one-line verdict and a count of findings by severity, then the three grouped sections. Use this shape:

```md
# Content audit: <file path>

**Verdict:** <one sentence>
**Findings:** <n> blocker, <n> major, <n> minor

## Accuracy and freshness

- **[major]** `file.md:42` - Claim "<quote>" is out of date. <What is true now, with source.> Source: <link>
- ...

## Style-guide compliance

- **[minor]** `file.md:10` - <Issue and the rule it breaks.> Fix: <recommendation>
- ...

## Sense and structure

- **[blocker]** `file.md:5-30` - <Logical or completeness problem.> Fix: <recommendation>
- ...

## Recommended next steps

- <e.g. apply accuracy fixes, run blog-md-linter, re-sync the JA counterpart>
```

Severity guidance:

* **blocker** - factually wrong, broken, or misleading enough to harm the reader.
* **major** - out-of-date or incorrect detail, a structural problem, or a real style violation.
* **minor** - polish, wording, or a small consistency issue.

If a pillar has no findings, say so explicitly ("No accuracy issues found") rather than omitting the section.


## What success looks like

* Every checkable, time-sensitive claim was verified against a named source, or explicitly marked unverified.
* Findings are grouped under the three pillars, each with a severity, a `file:line` location, and a concrete recommended fix.
* Mechanical lint issues are summarized and delegated, not itemized.
* The file is unchanged unless the user explicitly approved fixes after reading the report.
* The report names any localization follow-up without altering the counterpart.


<!-- Links -->

[agents]: ../../AGENTS.md
[blog-md-linter]: ../blog-md-linter/SKILL.md
[blog-translator]: ../blog-translator/SKILL.md
[general-en-polisher]: ../general-en-polisher/SKILL.md
[general-style-guide-english]: ../../docs/general-style-guide-english.md
[general-style-guide-japanese]: ../../docs/general-style-guide-japanese.md
[glossary]: ../../docs/glossary.yaml
[markdown-style-guide]: ../../docs/markdown-style-guide.md
[technical-doc-overview]: ../../docs/technical-doc-overview.md
[technical-style-guide-english]: ../../docs/technical-style-guide-english.md
[technical-style-guide-japanese]: ../../docs/technical-style-guide-japanese.md
[words-to-avoid]: ../../docs/words-to-avoid.txt
