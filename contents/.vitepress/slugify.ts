// Heading ids for the site, built the same way GitHub builds them.
//
// VitePress runs this one function on every heading to make its id, and again on
// the fragment of every link, see `markdown.anchor.slugify` in config.mts. Its own
// default kept a heading emoji in the id and trimmed the trailing hyphen from a
// link, so `## Food 🍱` got the id `food-🍱` while `[food][food-options]` with
// `[food-options]: #food-` pointed at `#food`, and the two never met.
//
// The rule below is a copy of the one markdownlint MD051 uses to check link
// fragments, so `pnpm lint` checks every same-page link against the ids the site
// actually builds: `## Food 🍱` is `#food-`. Keep the two in step on a markdownlint
// upgrade. tests/heading-anchors.test.mjs pins the expected ids.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /[^\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}\- ]/gu,
      '',
    )
    .replace(/ /gu, '-')
    .toWellFormed();
}
