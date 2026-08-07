// General notes:
//   Guards the vendored plugin stylesheet in
//   contents/.vitepress/theme/vitepress-mermaid-renderer.css against drift
//   from the installed vitepress-mermaid-renderer package. The block above
//   the "Local auto-fit and height-ceiling overrides" banner must stay a
//   verbatim copy of the CSS the plugin ships: the stylesheet it injects at
//   runtime (the textContent string in dist/vitepress-mermaid-renderer.js)
//   followed by the scoped error-component styles (dist/index.css).
//   The comparison is formatting-insensitive (comments, insignificant
//   whitespace, quote style, leading zeros, and trailing semicolons are
//   normalized away), so prettier reformatting of the vendored copy does
//   not matter. Whitespace that CSS treats as a separator (for example the
//   spaces in "color-mix(in srgb, var(--vp-c-bg) 40%, transparent)") is
//   preserved, so a corrupted vendored copy cannot slip past the guard.
//   The test fails after a plugin upgrade until the vendored block is
//   re-copied per the banner comment.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDORED_PATH =
  'contents/.vitepress/theme/vitepress-mermaid-renderer.css';
const PLUGIN_DIST = 'node_modules/vitepress-mermaid-renderer/dist';
const BANNER_TEXT = 'Local auto-fit and height-ceiling overrides';

// Reduce CSS to its bare rules so formatting differences (prettier versus
// the plugin's minifier) do not produce false mismatches: strip comments,
// collapse whitespace runs to one space, unify quotes, add leading zeros
// to bare decimals, and drop semicolons before a closing brace.
// Whitespace is removed only where CSS never treats it as a separator:
// around braces, semicolons, commas, and child combinators, after an
// opening parenthesis or a colon, before a closing parenthesis, before the
// "!" of "!important", and between a closing parenthesis and a following
// identifier (a ")" token is self-delimiting, so "blur(4px)saturate(1)"
// parses the same as "blur(4px) saturate(1)"). Required separators such as
// the spaces in "color-mix(in srgb, var(--vp-c-bg) 40%, transparent)"
// survive, so a copy that lost one still fails the comparison.
const normalize = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/ ?([{};,>]) ?/g, '$1')
    .replace(/([(:]) /g, '$1')
    .replace(/ \)/g, ')')
    .replace(/ !/g, '!')
    .replace(/\) (?=[a-z])/gi, ')')
    .replace(/'/g, '"')
    .replace(/([^0-9])\.(\d)/g, '$10.$2')
    .replace(/;\}/g, '}')
    .trim();

// The plugin assigns its runtime stylesheet as a plain string literal to
// style.textContent right after creating the element with the known id.
function extractInjectedCss(pluginJs) {
  const idIndex = pluginJs.indexOf('vitepress-mermaid-renderer-styles');
  assert.notEqual(idIndex, -1, 'style element id not found in plugin bundle');
  const marker = 'textContent=';
  const markerIndex = pluginJs.indexOf(marker, idIndex);
  assert.notEqual(
    markerIndex,
    -1,
    'textContent assignment not found in plugin bundle',
  );
  const start = markerIndex + marker.length;
  const quote = pluginJs[start];
  // A template literal could carry interpolation, which this extractor (and
  // the safety of evaluating the literal) does not support.
  assert.match(
    quote,
    /["']/,
    'plugin stylesheet is no longer a plain string literal',
  );
  let end = start + 1;
  while (end < pluginJs.length) {
    if (pluginJs[end] === '\\') {
      end += 2;
      continue;
    }
    if (pluginJs[end] === quote) break;
    end += 1;
  }
  assert.notEqual(end, pluginJs.length, 'unterminated stylesheet literal');
  // Evaluate the literal so every escape sequence resolves exactly as it
  // does in the browser.
  return new Function(`return ${pluginJs.slice(start, end + 1)}`)();
}

test('normalize erases formatting differences but keeps required separators', () => {
  // Pretty-printed and minified forms of the same rules normalize equal.
  assert.equal(
    normalize(
      '.a > .b {\n  margin: 0.5rem;\n  font-family:\n    "Courier New",\n    monospace;\n}\n',
    ),
    normalize(".a>.b{margin:.5rem;font-family:'Courier New',monospace}"),
  );
  // A missing required space is real drift, not formatting, so it must
  // still fail the comparison.
  assert.notEqual(
    normalize('a{background:color-mix(in srgb, var(--vp-c-bg) 40%, red)}'),
    normalize('a{background:color-mix(in srgb,var(--vp-c-bg)40%,red)}'),
  );
  assert.notEqual(normalize('a{margin:0 auto}'), normalize('a{margin:0auto}'));
});

test('vendored Mermaid stylesheet matches the installed plugin', () => {
  const vendoredFile = readFileSync(join(repoRoot, VENDORED_PATH), 'utf8');
  const bannerIndex = vendoredFile.indexOf(BANNER_TEXT);
  assert.notEqual(bannerIndex, -1, 'local-overrides banner not found');
  const vendored = vendoredFile.slice(
    0,
    vendoredFile.lastIndexOf('/*', bannerIndex),
  );
  const pluginJs = readFileSync(
    join(repoRoot, PLUGIN_DIST, 'vitepress-mermaid-renderer.js'),
    'utf8',
  );
  const injected = extractInjectedCss(pluginJs);
  const scoped = readFileSync(join(repoRoot, PLUGIN_DIST, 'index.css'), 'utf8');
  assert.equal(
    normalize(vendored),
    normalize(injected + scoped),
    'vendored block drifted from the installed plugin stylesheet; re-copy it per the banner comment in the CSS file',
  );
});
