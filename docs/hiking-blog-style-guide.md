# Hiking blog style guide

This document describes the conventions that apply to the hiking pages under [contents/](../contents/), on top of the general and Markdown style guides.

It covers emoji use and Japanese place names. Add further hiking-page conventions here as they are agreed.


## Table of contents <!-- omit in toc -->

* [Emoji use](#emoji-use)
* [Where emoji belong](#where-emoji-belong)
* [How to write an emoji](#how-to-write-an-emoji)
* [Standard section heading emoji](#standard-section-heading-emoji)
* [Standard inline emoji](#standard-inline-emoji)
  * [Transport](#transport)
  * [Trail data](#trail-data)
  * [Places and nature](#places-and-nature)
  * [Food and drink](#food-and-drink)
  * [Page and source notes](#page-and-source-notes)
* [Headings with emoji change the anchor](#headings-with-emoji-change-the-anchor)
* [Emoji on Japanese pages](#emoji-on-japanese-pages)
* [Japanese place names](#japanese-place-names)
  * [The standard form](#the-standard-form)
  * [Where the Japanese goes](#where-the-japanese-goes)
  * [Where Japanese text belongs](#where-japanese-text-belongs)
  * [What gets a Japanese name](#what-gets-a-japanese-name)
  * [Keep the Japanese exactly as published](#keep-the-japanese-exactly-as-published)
  * [On Japanese pages](#on-japanese-pages)
* [Known inconsistencies](#known-inconsistencies)


## Emoji use

Emoji are part of the voice of this blog: they let a reader skim a route page and find the station, the food, and the waterfall without reading every line. They only work if the same emoji always means the same thing, so treat the tables below as a closed vocabulary.

* Reuse an emoji from the tables below whenever one fits.
* Add a new emoji to a table in this document first, then use it. Do not introduce a one-off emoji straight into a page.
* Never use two different emoji for the same thing across the site. If a page already does, fix the page to match this guide.
* Emoji decorate; they never carry meaning on their own. Every line must still read correctly with the emoji removed, because screen readers announce the emoji name and search results strip it.

[contents/level-1/otama-walking-trail.md](../contents/level-1/otama-walking-trail.md) and [contents/level-1/hatonosu-valley.md](../contents/level-1/hatonosu-valley.md) are the worked examples.


## Where emoji belong

| Place                                         | Rule                                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Frontmatter `title`                           | At most one emoji, at the end. It appears in the sidebar and the browser tab, so keep it to a signature.  |
| Frontmatter `description`                     | None. The description is the rendered opening line and the search metadata, so keep it plain text.        |
| H2 and H3 headings                            | Exactly one emoji, at the end of the heading text.                                                        |
| List items                                    | At most one emoji, at the very end of the item, after the final period.                                   |
| Warnings inside a list                        | Lead with `⚠️`, then the sentence. This is the one case where the emoji comes first.                      |
| Ratings such as hiking poles or trail running | Directly after the label, before the colon, for example `Hiking poles 🔧: 2 / 5`.                         |
| Body paragraphs                               | At most one emoji, at the end of the paragraph, and only when the paragraph is a standalone note.         |
| Tables, link labels, and image alt text       | None. Alt text describes the photo, and an emoji inside a link label leaks into the reference definition. |


## How to write an emoji

* Put a single regular space between the text and the emoji.
* Place the emoji after the sentence punctuation: `... so pack your own. 🍱`
* Use one emoji per line. Pair two only when the line genuinely covers two things, for example `09:12 bus -> 09:30 cable car. 🚌🚠`
* Copy the emoji exactly from the tables below. Several of them need the variation selector `U+FE0F` to render in color rather than as a black glyph, including `⚠️`, `⏱️`, `⛰️`, `⛩️`, `♨️`, `✂️`, `🅿️`, `🗺️`, and `🕊️`.
* Do not use a skin-tone or gender modifier.


## Standard section heading emoji

These are the standard H2 sections of a route page, in the usual order. Use the same emoji every time, and give a section its emoji even when the page has only some of these sections.

| Heading                           | Emoji | Used for                                            |
| --------------------------------- | ----- | --------------------------------------------------- |
| `Getting there`                   | 🚂    | Stations, travel time, and access by car.           |
| `Trail overview`                  | 📋    | Difficulty, toilets, water, season, and warnings.   |
| `Trail route`                     | 🥾    | The ordered list of points and the route metrics.   |
| `Map of the route`                | 🗺️    | Trail maps, map images, and map PDFs.               |
| `Shortcuts`                       | ✂️    | Ways to skip a section of the route.                |
| `Along the trail`                 | 🌲    | The section-by-section walkthrough of the route.    |
| `Timeline`                        | ⏱️    | A recorded hike, point by point, with clock times.  |
| `Food`                            | 🍱    | Restaurants, shops, and what to pack.               |
| `Key photo spots`                 | 📸    | The views worth stopping for.                       |
| `Notes from the original article` | 📝    | Notes carried over from a reproduced source.        |
| `References`                      | 📚    | Sources and other write-ups of the same route.      |
| `Related page`                    | 🔗    | Other pages on this site, including a Japanese one. |

H3 headings inside `Along the trail` are named after the stretch they cover, for example `### Suniwa Bridge to Hatonosu Station 🌉`. Take their emoji from the inline tables below, choosing the highlight of that stretch.


## Standard inline emoji


### Transport

| Emoji | Meaning                              |
| ----- | ------------------------------------ |
| 🚉    | Train station.                       |
| 🚃    | A train ride or a train line.        |
| 🚠    | Cable car or ropeway.                |
| 🚌    | Bus.                                 |
| 🚏    | Bus stop.                            |
| 🚗    | Access by car.                       |
| 🅿️    | Parking lot.                         |
| 🎟️    | Tickets, IC cards, and ticket gates. |


### Trail data

| Emoji | Meaning                                                     |
| ----- | ----------------------------------------------------------- |
| 🟢    | Easy route, level 1.                                        |
| 🟡    | Intermediate route, level 2.                                |
| 🔴    | Challenging route, level 3.                                 |
| 📏    | Distance.                                                   |
| ⏱️    | Duration or travel time.                                    |
| ↗     | Elevation gain.                                             |
| ↘     | Elevation decline.                                          |
| 🍃    | Best season.                                                |
| 🚻    | Toilets.                                                    |
| 🥤    | Water, vending machines, and what to drink.                 |
| 🔧    | Hiking pole rating, written as `Hiking poles 🔧: 2 / 5`.    |
| 👟    | Trail running rating, written as `Trail running 👟: 3 / 5`. |
| 🗻    | A recorded hike on YAMAP.                                   |
| 💪    | Walking or a hard stretch of trail.                         |
| ⚠️    | Warning. Leads the line instead of ending it.               |


### Places and nature

| Emoji | Meaning                                      |
| ----- | -------------------------------------------- |
| ⛩️    | Shrine/ temple.                              |
| ⛰️    | Summit or mountain.                          |
| 🌳    | A notable single tree.                       |
| 🌲    | Forest, cedar, and wooded trail.             |
| 🌿    | Moss and undergrowth.                        |
| 🌉    | Bridge, including a suspension bridge.       |
| 💧    | Waterfall, dam, and lake.                    |
| 🪨    | Rocks and boulders.                          |
| 🌄    | Observation deck or viewpoint.               |
| 📸    | A photo spot or a scene worth photographing. |
| ♨️    | Hot spring.                                  |


### Food and drink

| Emoji | Meaning                              |
| ----- | ------------------------------------ |
| 🍱    | Lunch, restaurants, and packed food. |
| 🍙    | Snacks.                              |
| 🍜    | Noodle shop or diner.                |
| 🍛    | Curry and rice-dish restaurant.      |
| ☕️    | Cafe.                                |
| 🍵    | Teahouse.                            |
| 🍦    | Ice cream.                           |


### Page and source notes

| Emoji | Meaning                                       |
| ----- | --------------------------------------------- |
| 🇯🇵    | Link to the Japanese version of the page.     |
| 🔗    | Link to another page on this site.            |
| 📝    | A write-up, article, or note about the route. |
| 📚    | A list of sources.                            |
| 🗾    | An official map or leaflet.                   |
| 👏    | Credit to whoever published a resource.       |


## Headings with emoji change the anchor

VitePress builds a heading anchor from the heading text, and an emoji at the end leaves a trailing hyphen. `## Food 🍱` becomes `#food-`, not `#food`.

* Keep the trailing hyphen in same-page links, for example `[food-options]: #food-`.
* Check every same-page link after adding, removing, or changing a heading emoji. `pnpm lint` does not catch a broken same-page anchor.


## Emoji on Japanese pages

* Give a Japanese page the same emoji as the matching section on its English counterpart, so the two pages stay recognizable side by side.
* Put a space before the emoji in a Japanese heading, the same as in English, even though Japanese text has no spaces elsewhere.
* On a page that reproduces an outside article word for word, add emoji to the headings only. Leave the reproduced body text exactly as published.


## Japanese place names

Signposts, timetables, and trail markers on the mountain are in Japanese only, and a map application will rarely find a romanized name. Give the reader the Japanese so they can match a sign, read a timetable, or paste the name into a map search.

Write the Japanese as a code span, wrapped in backticks:

* The monospace styling separates the Japanese from the English around it, so the eye reads it as a label rather than as part of the sentence.
* Backticks mark the text as verbatim, which tells the reader this is the exact string to look for on a sign or to type into a search box.
* A code span keeps mixed-script text out of the English prose rules, so the writing style guide applies to the sentence and not to the name inside it.

[contents/level-1/otama-walking-trail.md](../contents/level-1/otama-walking-trail.md) is the worked example.


### The standard form

Put the Japanese inside the link text, after a slash:

```md
[Kori Station / `古里駅`][kori-sta]
```

* Separate the two names with a space, a slash, and a space.
* Give the English name first. These pages are written for a reader who does not read Japanese.
* Keep the pair inside the link text, so both names are clickable and the two cannot be split across a line break.
* The reference label stays kebab-case ASCII, for example `[kori-sta]`. The Japanese never reaches the label, so the MD052 and MD053 checks are unaffected.
* A place with no link takes the same form without the brackets, for example `` Shiromaru Station / `白丸駅` ``.


### Where the Japanese goes

Name a place in Japanese once per page, then use the English name alone for the rest of the page.

* If the place is a point in the `Trail route` list, put the Japanese there. That list is the roster of the route, so it is where a reader looks a name up.
* Otherwise, put the Japanese at the first mention of the place.
* Every later mention drops the Japanese. Repeating it on each mention makes the prose hard to read.

On [contents/level-1/otama-walking-trail.md](../contents/level-1/otama-walking-trail.md), `古里駅` sits with Kori Station in the `Trail route` list, and the `Along the trail` and `Timeline` sections then use "Kori Station" on its own. `白丸湖` and `奥多摩中学校バス停` are not route points, so each carries its Japanese at its own first mention in the `Timeline`.


### Where Japanese text belongs

| Place                                | Rule                                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontmatter `title`                  | Parentheses, no backticks, as in `'... via Mt. Hinode (日の出山) Route'`. A backtick would render literally in the sidebar and the browser tab. |
| Frontmatter `description`            | Parentheses, no backticks. The description is the rendered opening line and the search metadata, so it stays plain text.                        |
| H2 and H3 headings                   | None. Keep the Japanese in the body, where a code span is safe.                                                                                 |
| `Trail route` list, body, and tables | The standard form above.                                                                                                                        |
| Link reference labels                | None. A label is lowercase letters, digits, and hyphens only.                                                                                   |
| Image alt text                       | None. Alt text describes the photo in English.                                                                                                  |

See [frontmatter-style-guide.md](frontmatter-style-guide.md) for the frontmatter rules in full.


### What gets a Japanese name

Give the Japanese for a proper name that the reader has to match against a sign, a timetable, or a map search:

* Stations, bus stops, and cable car stations.
* Mountains, passes, valleys, gorges, and lakes.
* Waterfalls, dams, bridges, and notable trees.
* Shrines, temples, and hot springs.
* Restaurants, diners, teahouses, and shops.
* Named bus routes and train services, for example the `梅７６丙` bus and the `休日快速 おくたま` train.

Do not put a common noun into Japanese. "Bridge", "waterfall", and "summit" stay in English; only the name of the specific place takes a Japanese gloss.


### Keep the Japanese exactly as published

Copy the name from the sign, the timetable, or the operator's own site, and do not normalize it:

* Keep full-width Latin letters and digits, for example `Ｔ桃源台線` and `梅０１`.
* Keep Japanese brackets and punctuation inside a name, for example `御岳駅（バス）` and `和田［相模原市］（バス）`.
* Keep the script the source uses, whether kanji, hiragana, or katakana, for example `もえぎの湯` and `エコっと白丸`.

Add the pair to [glossary.yaml](glossary.yaml) the first time a term appears on a second page, and add the romanized spelling to the `words` list in [.cspell.json](../.cspell.json) so the editor spell checker stops flagging it.


### On Japanese pages

A Japanese page (`*.ja.md`) reverses the pattern:

* Write place names in Japanese as ordinary prose, with no backticks. The whole page is Japanese, so a code span would single out nothing.
* Give an English name plain as well, with no backticks, for example `英語版は [Hatonosu Valley][hatonosu-valley-2] をご覧ください。`
* On a page that reproduces an outside article word for word, leave every name exactly as published.


## Known inconsistencies

Older pages predate this guide. Fix these when you next edit the page:

* `🚂` is used for a train station on [contents/area/okutama-overnight.md](../contents/area/okutama-overnight.md). The standard is `🚉`; `🚂` belongs on the `Getting there` heading only.
* `🚉` is used for Takimoto cable car station in the Mermaid diagram on [contents/snippets/mitakesan-cable-car.md](../contents/snippets/mitakesan-cable-car.md). The standard is `🚠`, which the neighboring node already uses.
* The pages under [contents/level-2/](../contents/level-2/), [contents/level-3/](../contents/level-3/), and [contents/area/](../contents/area/) have no emoji on most headings. Apply the heading table above when you next touch one.
* Most pages predate the Japanese place-name convention and use another form. Convert a page when you next edit it:
  * Japanese after the link instead of inside it, as in `` [Kori Station][kori-sta] / `古里駅` ``, on [contents/level-1/hatonosu-valley.md](../contents/level-1/hatonosu-valley.md) and [contents/level-1/mitake-rock-garden.md](../contents/level-1/mitake-rock-garden.md).
  * Japanese in parentheses instead of after a slash, as in ``[Hinatawada Station (`日向和田駅`)][hinatawada-sta]``, on [contents/level-2/mitake-hinatawada.md](../contents/level-2/mitake-hinatawada.md), [contents/level-2/koburi-agano.md](../contents/level-2/koburi-agano.md), and [contents/area/tokyo-weekend-hiking-options.md](../contents/area/tokyo-weekend-hiking-options.md).
  * Japanese with no backticks, which is still the most common form on the site, as in `[Okutama Station / 奥多摩駅][okutama-sta]`, on [contents/level-2/mitake-okutama.md](../contents/level-2/mitake-okutama.md) and 15 other pages.
  * A dash-separated English name, Japanese name, and map link, as in ``Gundari Shrine - `軍刀利神社` - [Google Maps][map-gundari-shrine]``, on [contents/level-3/hike-008.md](../contents/level-3/hike-008.md).
