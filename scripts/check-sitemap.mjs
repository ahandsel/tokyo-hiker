// check-sitemap.mjs notes
//
// General notes:
// * Purpose: After a VitePress build, assert that sitemap.xml locs use the
//   GitHub Pages project base /tokyo-hiker/ and do not double it.
// * Run this after `pnpm build`. It reads contents/.vitepress/dist/sitemap.xml.
//
// Usage:
//   pnpm check-sitemap
//   node scripts/check-sitemap.mjs
//   node scripts/check-sitemap.mjs --help
//
// Output:
// * Prints ✅ when every <loc> is under https://ahandsel.github.io/tokyo-hiker/
//   and none contain /tokyo-hiker/tokyo-hiker/. Exit 0 when clean, 1 when the
//   file is missing or locs are wrong, 2 on bad arguments.
//
// Version history:
// * v1.1 - 2026-09-30 - Adapt the GitHub Pages base to Tokyo Hiker.
// * v1.0 - 2026-08-22 - Initial release.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const sitemapPath = join(repoRoot, 'contents/.vitepress/dist/sitemap.xml');
const PREFIX = 'https://ahandsel.github.io/tokyo-hiker';

function printUsage() {
  console.log(
    [
      'Usage: node scripts/check-sitemap.mjs [--help]',
      '',
      'Validates contents/.vitepress/dist/sitemap.xml after a VitePress build:',
      'every <loc> must start with https://ahandsel.github.io/tokyo-hiker and',
      'must not contain a doubled /tokyo-hiker/tokyo-hiker/ path.',
      '',
      'Also available as `pnpm check-sitemap`.',
      '',
      'Options:',
      '  -h, --help   Show this message.',
      '',
      'Exit codes: 0 = valid, 1 = missing file or bad locs, 2 = bad arguments.',
    ].join('\n'),
  );
}

const argv = process.argv.slice(2);
if (argv.includes('-h') || argv.includes('--help')) {
  printUsage();
  process.exit(0);
}
if (argv.length > 0) {
  console.error(`❌ Unrecognized argument: ${argv[0]}`);
  printUsage();
  process.exit(2);
}

if (!existsSync(sitemapPath)) {
  console.error(
    '❌ Missing sitemap.xml. Run `pnpm build` before `pnpm check-sitemap`.',
  );
  process.exit(1);
}

const xml = readFileSync(sitemapPath, 'utf8');
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

if (locs.length === 0) {
  console.error('❌ sitemap.xml contains no <loc> entries.');
  process.exit(1);
}

const errors = [];
for (const loc of locs) {
  if (!loc.startsWith(`${PREFIX}/`) && loc !== PREFIX && loc !== `${PREFIX}/`) {
    errors.push(`Missing /tokyo-hiker/ base: ${loc}`);
  }
  if (loc.includes('/tokyo-hiker/tokyo-hiker/')) {
    errors.push(`Doubled base path: ${loc}`);
  }
}

if (errors.length > 0) {
  for (const error of errors.slice(0, 20)) {
    console.error(`❌ ${error}`);
  }
  if (errors.length > 20) {
    console.error(`❌ … and ${errors.length - 20} more.`);
  }
  console.error(`❌ ${errors.length} of ${locs.length} sitemap loc(s) failed.`);
  process.exit(1);
}

console.log(`✅ Sitemap check passed (${locs.length} locs).`);
