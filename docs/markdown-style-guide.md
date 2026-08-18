# Markdown style guide

This document describes how Markdown documents in this repository should be formatted.


## Table of contents <!-- omit in toc -->

* [Linter rules](#linter-rules)
* [Banners for important notes within docs](#banners-for-important-notes-within-docs)
* [Link style guidelines](#link-style-guidelines)


## Linter rules

These rules are enforced by [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) and configured in [.markdownlint-cli2.jsonc](../.markdownlint-cli2.jsonc). Run `pnpm lint` to format and auto-fix files before every commit.


### Enabled and customized rules

| Rule  | Setting                                         | What it means                                                                               |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| MD004 | `style: asterisk`                               | Use `*` for unordered list items, never `-` or `+`.                                         |
| MD007 | `indent: 2`                                     | Indent nested unordered lists by 2 spaces.                                                  |
| MD009 | `br_spaces: 2`                                  | Trailing whitespace is not allowed, except exactly 2 trailing spaces to force a line break. |
| MD012 | `maximum: 2`                                    | Allow at most 2 consecutive blank lines.                                                    |
| MD022 | `lines_above: 2, lines_below: 1`                | Leave 2 blank lines above every heading and 1 blank line below.                             |
| MD025 | `front_matter_title`                            | Only one top-level (H1) heading per document; a front matter `title` counts as the H1.      |
| MD029 | `style: ordered`                                | Number ordered list items sequentially (1, 2, 3, ...).                                      |
| MD031 | `blanks-around-fences: true`                    | Surround fenced code blocks with blank lines.                                               |
| MD033 | `allowed_elements: br, pre, script, ul, li, ol` | Inline HTML is restricted to `<br>`, `<pre>`, `<script>`, `<ul>`, `<li>`, and `<ol>`.       |


### Disabled rules

These default rules are turned off, so they are not enforced:

| Rule  | What it would check                                                                              |
| ----- | ------------------------------------------------------------------------------------------------ |
| MD013 | Line length limit. Long lines are allowed; do not split a single sentence across multiple lines. |
| MD014 | Dollar signs before shell commands without showing output.                                       |
| MD024 | Duplicate heading text. Repeated headings are allowed.                                           |
| MD026 | Trailing punctuation in headings.                                                                |
| MD032 | Blank lines around lists.                                                                        |
| MD036 | Emphasis used in place of a heading.                                                             |


### Search and replace rules

The custom `search-replace` rule auto-corrects these characters on lint. Characters are listed by Unicode code point because the literal characters are auto-replaced in this document too.

| Character                    | Code point         | Replaced with               | Reason                           |
| ---------------------------- | ------------------ | --------------------------- | -------------------------------- |
| Curly double quotes          | `U+201C`, `U+201D` | Straight double quote (`"`) | Use straight quotes only.        |
| Curly single quotes          | `U+2018`, `U+2019` | Straight single quote (`'`) | Use straight quotes only.        |
| Em dash                      | `U+2014`           | Hyphen (`-`)                | Never use em dashes.             |
| En dash                      | `U+2013`           | Hyphen (`-`)                | Never use en dashes.             |
| Non-breaking space           | `U+00A0`           | Regular space               | Use regular spaces only.         |
| Object replacement character | `U+FFFC`           | Regular space               | Stray character from copy-paste. |


### Custom rules

* `markdownlint-rule-search-replace` powers the search and replace corrections above.
* `markdownlint-rule-relative-links` verifies that relative links point to files that exist.


## Banners for important notes within docs

```md
> [!NOTE] Note: Highlights useful info for readers skimming the document.
> Additional details and linked text can go here.
```

```md
> [!TIP] Tip: Optional info such as best practices or recommendations.
> Additional details and linked text can go here.
```

```md
> [!IMPORTANT] Important: Critical information necessary for users to succeed.
> Additional details and linked text can go here.
```

```md
> [!CAUTION] Caution: Warn users about potential negative consequences like data loss.
> Additional details and linked text can go here.
```

Rules on banner usage:

* Use banners sparingly to avoid overwhelming readers.
* If no linked text is needed, use a one-line format without extra details.
* If linked text is needed, put linked text on the second line or later (due to VitePress rendering limitations).


## Link style guidelines

> [!TIP]
> Use your editor or agent workflow to enforce these link style guidelines consistently.

Use reference-style links to keep docs readable and translation-friendly:

* Define all links at the end of the document.
* Group link definitions with comment blocks and include only the sections you need:
  * `<!-- Links -->` for external and relative doc links.
  * `<!-- Internal links -->` for same-page anchors.
  * `<!-- Image links -->` for images in `public/`.
* Use kebab-case IDs; prefix image IDs with `img-`.
* Keep link definitions sorted alphabetically within each block.

Example:

```md
For more, see [Markdown extension examples][md-ex] and the [full list of extensions][vitepress-md].

See also the [More](#more) section below.

![Step 1][img-step1]

<!-- Links -->

[api-ex]: ./api-examples.md
[md-ex]: ./markdown-examples.md
[vitepress-md]: https://vitepress.dev/guide/markdown

<!-- Internal links -->

[more]: #more

<!-- Image links -->

[img-step1]: /markdown-examples/step1.png
```

For more details, add a project-specific prompt or checklist for reference-style links if you use them in your workflow.
