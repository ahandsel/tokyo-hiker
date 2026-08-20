# Frontmatter style guide

This document describes the YAML frontmatter used in the Markdown content files under [`contents/`][contents-folder]. Frontmatter is the block delimited by `---` at the very top of a file. It supplies the page title, the rendered opening line, the search metadata, the sidebar behavior, and the per-page Mermaid diagram height.

Four things read these keys:

* [VitePress][vitepress] builds the page and renders the `{{$frontmatter.*}}` interpolations in the body.
* The [`vitepress-sidebar`][vitepress-sidebar-options] plugin reads `title`, `order`, and `excludeFromSidebar` when it generates the navigation.
* The local search `_render` hook in [`contents/.vitepress/config.mts`][config] reads `title` and `search` when it builds the search index.
* The custom theme in [`contents/.vitepress/theme/index.ts`][theme] reads `mermaidHeight`.

Every option named below is configured in [`contents/.vitepress/config.mts`][config], which is the source of truth for site behavior.


## Table of contents <!-- omit in toc -->

* [Required frontmatter](#required-frontmatter)
* [Key reference](#key-reference)
* [Content keys](#content-keys)
  * [title](#title)
  * [description](#description)
  * [excludeFromSidebar](#excludefromsidebar)
* [Sidebar keys](#sidebar-keys)
  * [order](#order)
  * [Pages the sidebar excludes without frontmatter](#pages-the-sidebar-excludes-without-frontmatter)
* [Page behavior keys](#page-behavior-keys)
  * [search](#search)
  * [mermaidHeight](#mermaidheight)
* [Home page keys](#home-page-keys)
* [Japanese pages](#japanese-pages)
* [Snippet frontmatter](#snippet-frontmatter)
* [Files without frontmatter](#files-without-frontmatter)
* [VitePress keys not used here](#vitepress-keys-not-used-here)


## Required frontmatter

Every content page declares three keys, then opens the body with the two interpolations:

```md
---
title: 'Mt. Mitake + Rock Garden'
description: 'Hiking route on Mitakesan (御岳山) with a Mononoke Hime vibe that is perfect for beginners.'
excludeFromSidebar: false
---

# {{$frontmatter.title}}

{{$frontmatter.description}}
```

Do not hardcode the H1 or the opening line. The interpolations keep the rendered page, the browser tab, the sidebar label, and the search index in sync with the frontmatter.


## Key reference

| Key                  | Required | Type    | Purpose                                                                        |
| -------------------- | -------- | ------- | ------------------------------------------------------------------------------ |
| `title`              | Yes      | string  | Page title, browser tab title, sidebar label, and the rendered H1.             |
| `description`        | Yes      | string  | Meta description for search engines, and the rendered opening line.            |
| `excludeFromSidebar` | Yes      | boolean | When `true`, hides the page from the sidebar and from the folder landing list. |
| `order`              | No       | number  | Sidebar sort position within its group. Defaults to `10`.                      |
| `search`             | No       | boolean | When `false`, keeps the page out of the local search index.                    |
| `mermaidHeight`      | No       | string  | Per-page height ceiling for Mermaid diagram containers. Defaults to `70vh`.    |
| `layout`             | No       | enum    | Page layout. Set to `home` on [`contents/index.md`][home-page] only.           |
| `hero`, `features`   | No       | object  | Home page hero and feature-card content. Used only with `layout: home`.        |

There is no `localization`, `head`, `tags`, or `externalPostUrl` key in this repository. Site-wide `head` tags live in [`contents/.vitepress/config.mts`][config] instead of on individual pages.


## Content keys

These keys describe the page itself and feed the rendered HTML, the sidebar, and the search index.


### title

Required on every content page. The `title`:

* Sets the browser tab title. The config sets no `titleTemplate`, so VitePress applies its default template and renders `:title | Tokyo Hiker 🥾`.
* Is the sidebar label, because the sidebar is configured with `useTitleFromFrontmatter: true` and `frontmatterTitleFieldName: 'title'`.
* Is rendered as the page H1 through `# {{$frontmatter.title}}`. The markdownlint `MD025` rule is configured with `front_matter_title: "{{$frontmatter.title}}"`, so that interpolated heading counts as the single H1.

Conventions for the value:

* Wrap it in straight single quotes. Quoting is required when the value contains a colon followed by a space, or starts with a character that YAML reads specially, and most pages quote every title for consistency.
* Use sentence case, and follow the [general style guide - English][general-style-guide-english].
* Emoji are allowed and common, for example `'Easy hikes 👟'` and `'Hatonosu Valley 🕊️'`.
* Naming a station, mountain, or pass in Japanese inside parentheses is the established pattern, for example `'Hinatawada Station to Mitakesan Cable Car via Mt. Hinode (日の出山)'`.
* Add unfamiliar place names and romanizations to the `words` list in [`.cspell.json`][cspell] rather than leaving them flagged.


### description

Required on every content page. The `description` is a single sentence that renders in two places: the page meta description that search engines read, and the opening line of the body through `{{$frontmatter.description}}`.

* Because it renders as body text, write it as a complete sentence.
* Be specific about the route: the start and end points, the area, and what makes the hike worth doing.
* The key is `description`, singular. A misspelled key such as `descriptions` is not an error that the build reports; the page simply renders an empty opening line and ships without a meta description.


### excludeFromSidebar

Required on every content page. This boolean is wired up through `excludeFilesByFrontmatterFieldName: 'excludeFromSidebar'`.

* `false` lists the page in the sidebar. Every visible page states this explicitly to document intent, rather than omitting the key.
* `true` removes the page from the generated sidebar. The [`md-index-list`][md-index-list] snippet applies the same filter, so `true` also removes the page from its folder landing list. Keep the snippet's filter in sync when the config changes.

Use `true` for pages that must exist and stay reachable by link, but should not appear in the navigation, such as the reusable snippets.


## Sidebar keys

These keys control how the `vitepress-sidebar` plugin places a page in the navigation.


### order

Optional number. The `order` key sets the sort position of a page or folder within its sidebar group. Lower numbers sort first.

* Sorting by this key is enabled with `sortMenusByFrontmatterOrder: true`.
* Pages without `order` default to `10`, set by `frontmatterOrderDefaultValue: 10`.
* Folders always sort above files, because `sortFolderTo: 'top'`.
* A folder's position comes from the `order` in its `index.md`, since `useFolderTitleFromIndexFile` and `useFolderLinkFromIndexFile` are both `true`.

No content page sets `order` today, so every page ties at `10` and the plugin falls back to the order the file system returns. Add `order` when a page must hold a fixed position, and set it on the whole group at once so the intended sequence is readable.


### Pages the sidebar excludes without frontmatter

Some exclusions come from the config rather than from a key on the page, so do not add `excludeFromSidebar` for these cases:

* `excludeByGlobPattern: ['README.md', 'temp.md', 'temp-.*']` drops those file names. The entries are globs, not regexes, so `temp-.*` matches `temp-.` plus any suffix, not every `temp-` file.
* `includeRootIndexFile: false` keeps [`contents/index.md`][home-page] out of the sidebar.
* `includeFolderIndexFile: false` keeps each folder's `index.md` from appearing as a child item. The folder group takes its label and link from that file instead.


## Page behavior keys

These optional keys change how a single page behaves. Neither is set on any page today, so both are documented here as the supported way to opt in.


### search

Optional boolean. Set `search: false` to keep a page out of the local search index. The custom `_render` hook in [`contents/.vitepress/config.mts`][config] checks the key and returns an empty string for that page.

The same hook rewrites the body before indexing: it replaces a heading that is exactly `# {{$frontmatter.title}}` with the concrete title, then strips every remaining `$frontmatter` interpolation. Keep the H1 in the documented form so search results show the real page title instead of a blank entry.


### mermaidHeight

Optional string. Mermaid diagrams sit in a pan-and-zoom container with a height ceiling of `70vh`. Override it per page:

```yaml
mermaidHeight: 40rem
```

* The value feeds the `--mermaid-max-height` CSS variable, read by the vendored renderer stylesheet.
* Any value that is valid for the CSS `max-height` property works, such as `40rem`, `560px`, or `60vh`. A bare number is treated as pixels.
* It is a ceiling, not a fixed height. A short diagram keeps its natural height and never stretches to fill the space.
* An invalid value logs a console warning and falls back to `70vh` instead of breaking the page.


## Home page keys

The site landing page, [`contents/index.md`][home-page], uses the VitePress home layout instead of a normal document. It sets:

* `layout: home` to switch to the home-page layout.
* `hero` for the name, text, tagline, and image.
* `features` for the cards that link into the difficulty levels and the maps page. Each card takes a `title`, `details`, `link`, and `icon`. The `icon` accepts either an emoji or an object with separate `light` and `dark` SVG paths.

It sets no `title`, `description`, or `excludeFromSidebar`. The home layout supplies its own headings, and `includeRootIndexFile: false` already keeps the page out of the sidebar.

These keys follow the [VitePress home page reference][vitepress-home]. Do not add them to ordinary content pages.


## Japanese pages

This repository has no locale folders and no `localization` key. A Japanese version of a page sits beside its English counterpart in the same folder, with a `.ja.md` suffix:

```text
contents/level-1/takao-inariyama.md      -> /level-1/takao-inariyama
contents/level-1/takao-inariyama.ja.md   -> /level-1/takao-inariyama.ja
```

* A Japanese page carries the same keys as its English counterpart, with `title` and `description` written in Japanese and wrapped in straight single quotes.
* Keep the body opening interpolations unchanged; only the frontmatter values are translated.
* Write the prose to the [general style guide - Japanese][general-style-guide-japanese] and the [technical style guide - Japanese][technical-style-guide-japanese].
* Whether a Japanese page appears in the sidebar is decided per page with `excludeFromSidebar`. [`takao-inariyama.ja.md`][takao-ja] sets `false` and lists next to the English page, while [`hatonosu-valley.ja.md`][hatonosu-ja] sets `true` and stays hidden. There is no repository-wide rule yet, so choose deliberately and match the neighboring pair.


## Snippet frontmatter

Files under [`contents/snippets/`][snippets-folder] are reusable fragments included into pages with a directive such as `<!--@include: ../snippets/mitakesan-cable-car.md-->`. The config sets no `srcExclude`, so each snippet also builds as its own route. Every snippet therefore carries a short frontmatter block:

```yaml
---
title: 'Mitakesan cable car snippet'
description: 'Information about the Mitakesan Cable Car, including stations, routes, phone numbers, costs, and timetables.'
excludeFromSidebar: true
---
```

* Name the `title` after the fragment and end it with the word `snippet`, so the standalone route is identifiable.
* `description` is optional on a snippet, and short fragments omit it.
* Always set `excludeFromSidebar: true` so the fragment stays out of the navigation and out of the folder landing lists.
* Do not use the `{{$frontmatter.*}}` body opening in a snippet. The frontmatter values belong to the snippet route, not to the page that includes it.


## Files without frontmatter

Not every Markdown file in the repository is a page, and these need none of the keys above:

* `README.md` files are contributor documentation. They are excluded from the sidebar by `excludeByGlobPattern`.
* Markdown under `docs/`, `notes/`, and `prompts/` sits outside `contents/`, so it is never part of the site build.
* Files under `skills/` carry their own `name` and `description` frontmatter. That is the skill file format and it is unrelated to this guide.


## VitePress keys not used here

VitePress supports more frontmatter than this repository uses, including `head`, `titleTemplate`, `aside`, `outline`, `prev`, `next`, `editLink`, `lastUpdated`, and `pageClass`. The site sets the equivalent behavior globally in [`contents/.vitepress/config.mts`][config] instead, so pages stay consistent.

Add one of these keys only for a specific reason, and note that reason in the pull request. See the [VitePress frontmatter reference][vitepress-frontmatter] for the full list.

<!-- Links -->

[config]: ../contents/.vitepress/config.mts
[contents-folder]: ../contents/
[cspell]: ../.cspell.json
[general-style-guide-english]: general-style-guide-english.md
[general-style-guide-japanese]: general-style-guide-japanese.md
[hatonosu-ja]: ../contents/level-1/hatonosu-valley.ja.md
[home-page]: ../contents/index.md
[md-index-list]: ../contents/snippets/md-index-list.md
[snippets-folder]: ../contents/snippets/
[takao-ja]: ../contents/level-1/takao-inariyama.ja.md
[technical-style-guide-japanese]: technical-style-guide-japanese.md
[theme]: ../contents/.vitepress/theme/index.ts
[vitepress]: https://vitepress.dev/
[vitepress-frontmatter]: https://vitepress.dev/reference/frontmatter-config
[vitepress-home]: https://vitepress.dev/reference/default-theme-home-page
[vitepress-sidebar-options]: https://vitepress-sidebar.cdget.com/guide/options
