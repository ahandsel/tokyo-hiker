# Task file template

This file shows the canonical shape of a `tasks/<issue-number>-<slug>.md` file produced by [SKILL.md][].
Use it as the structural reference; the [gh-issue-to-task][SKILL.md] skill follows the same layout when it writes a new scaffold.

This template documents two scaffold shapes:

* **Minimal scaffold** - what the skill writes by default.
* **Enriched scaffold** - what the skill writes when `--enrich` is passed, adding a `## Spec details` section populated with verbatim excerpts of every linked spec.

Wherever you see `<placeholder>`, substitute the actual value from the issue.
Keep the section order, headings, and `<!-- omit in toc -->` markers exactly as shown so downstream skills and the Phrase push can find the metadata they expect.

[SKILL.md]: SKILL.md


## Minimal scaffold

```markdown
# <issue-number>-<slug>

<One-line description derived from the issue title.>

- GitHub: [<issue title>](<issue url>)
- Figma: [<file name>](<figma url>)

Specs:

- [<linked issue title> - Issue #<n> - <owner>/<repo>](<linked issue url>)
- [<linked file path> - <owner>/<repo>](<linked file url>)

Phrase Strings:

- Tag: `<tag>` (proposed, confirm before push)
- Project: <Project name> (`<project-id>`) (proposed, confirm before push)
- Branch: `<branch>` (proposed, confirm before push)

## Table of contents <!-- omit in toc -->

- [UX copy](#ux-copy)
- [Background](#background)
- [Changelog](#changelog)

## UX copy

<Short placeholder paragraph naming the surface, modal, or page the copy lives on.>

| English | Key | Description | Notes |
| ------- | --- | ----------- | ----- |
|         |     |             |       |

## Background

<Verbatim excerpt from the issue body's Background section, or a single sentence stating the feature scope derived from the issue title and labels.>

## Changelog

- YYYY-MM-DD: Created task scaffold from <owner>/<repo>#<n>.
```


## Enriched scaffold (`--enrich`)

Identical to the minimal scaffold, with one extra section after `## Background` and one extra entry in the table of contents:

```markdown
## Table of contents <!-- omit in toc -->

- [UX copy](#ux-copy)
- [Background](#background)
- [Spec details](#spec-details)
- [Changelog](#changelog)

## Spec details

### A. <Linked issue title> ([<owner>/<repo> #<n>][a])

[a]: <linked issue url>

<Verbatim excerpt of the linked issue body.>

### B. <Linked file path> ([<owner>/<repo>][b])

[b]: <linked file url>

<Verbatim excerpt of the linked file.>
```

Add one `### A.`, `### B.`, ... subsection per `linkedIssues` and `linkedFiles` entry, in the order they appear in the helper output.
Skip entries whose `error` field is set and report each skipped link to the user.


## Field notes

* **Title.** Always `# <issue-number>-<slug>`.
  * The slug becomes the branch name, so it should read cleanly.
* **One-line description.** A noun phrase, not "UX writing for ...".
  * If the issue title is too thin to derive one, fall back to `UX writing for the <feature> feature.` and flag it in the report so the writer can rewrite it.
* **Links block.** `Figma:` falls back to `Figma: TBD (no design file linked on the issue yet)` when the issue has no Figma URL.
* **Phrase Strings.** Each value carries a `(proposed, confirm before push)` note until the writer confirms.
  * The writer confirms or fixes the values before pushing them to Phrase.
* **UX copy table.** Always written empty.
  * Copy belongs to follow-up review and localization skills.
* **Changelog.** One bullet for the scaffold creation, dated today.
