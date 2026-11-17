// General notes:
//   Guards the heading ids the site builds. contents/.vitepress/config.mts
//   passes contents/.vitepress/slugify.ts to VitePress as
//   `markdown.anchor.slugify`, and VitePress runs it twice: once on each
//   heading to make its id, and once on the fragment of each link. The rule
//   is a copy of the one markdownlint MD051 uses, so `pnpm lint` checks every
//   same-page link against the ids the site really has. Without it,
//   `## Food 🍱` got the id `food-🍱` while a `#food-` link became `#food`.
//   A failure here means one of three things drifted: the config no longer
//   passes the slugify, VitePress changed how it uses the option, or the
//   rule no longer matches markdownlint. For the last, compare slugify.ts
//   with convertHeadingToHTMLFragment in markdownlint/lib/md051.mjs.

import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress';
import config from '../contents/.vitepress/config.mts';
import { slugify } from '../contents/.vitepress/slugify.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Real headings from the site, with the id GitHub and markdownlint give them.
const headings = [
  ['Food 🍱', 'food-'],
  [
    'Level 1 - Start from Futamatao Station',
    'level-1---start-from-futamatao-station',
  ],
  ['Option 3: Highlight walk; 7.5 km', 'option-3-highlight-walk-75-km'],
  ['Myōō Pass', 'myōō-pass'],
  ['コースデータ 📋', 'コースデータ-'],
  ['古里駅 -- 古里のイヌグス 🌳', '古里駅----古里のイヌグス-'],
  // 🗺️ ends in an invisible variation selector, which counts as a mark and stays.
  ['Map of the route 🗺️', 'map-of-the-route-\u{FE0F}'],
];

test('the site config passes slugify.ts to VitePress', async () => {
  // withPwa() returns a promise of the config.
  const resolved = await config;
  assert.equal(resolved.markdown?.anchor?.slugify, slugify);
});

test('slugify gives each heading its GitHub id', () => {
  for (const [heading, id] of headings) {
    assert.equal(slugify(heading), id, heading);
  }
});

test('slugify leaves an id unchanged, since VitePress reruns it on links', () => {
  for (const [, id] of headings) {
    assert.equal(slugify(id), id, id);
  }
});

test('each #fragment link lands on its heading after rendering', async (t) => {
  t.after(disposeMdItInstance);
  const md = await createMarkdownRenderer(join(repoRoot, 'contents'), {
    anchor: { slugify },
  });
  const source = headings
    .map(([heading, id]) => `## ${heading}\n\n[link](#${id})\n`)
    .join('\n');
  const html = await md.renderAsync(source, {});
  const ids = [...html.matchAll(/<h2 id="([^"]*)"/g)].map((m) => m[1]);
  const hrefs = [...html.matchAll(/<a href="#([^"]*)">link<\/a>/g)].map((m) =>
    decodeURIComponent(m[1]),
  );
  assert.equal(ids.length, headings.length);
  assert.deepEqual(hrefs, ids);
});
