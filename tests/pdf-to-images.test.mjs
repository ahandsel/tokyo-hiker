// Unit tests for the pure helpers in scripts/pdf-to-images.mjs.
//
// The script guards its CLI behind `import.meta.main`, so importing it here
// exercises the helpers without converting anything. The error paths call
// process.exit, so those are covered by spawning the script instead.

import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  formatBytes,
  outputNameFor,
  parseArgs,
  parsePages,
} from '../scripts/pdf-to-images.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = resolve(repoRoot, 'scripts/pdf-to-images.mjs');

test('outputNameFor keys off the PDF page count, not the requested page count', () => {
  // A one-page PDF drops the suffix, because a -1 on a single page is noise.
  assert.equal(outputNameFor('map', 'webp', 1, 1), 'map.webp');

  // A multi-page PDF always carries the page number, even when only one page
  // was requested. Keying off the request instead would make these two collide,
  // and --force would then overwrite the first page's image silently.
  assert.equal(outputNameFor('map', 'webp', 1, 2), 'map-1.webp');
  assert.equal(outputNameFor('map', 'webp', 2, 2), 'map-2.webp');
  assert.notEqual(
    outputNameFor('map', 'webp', 1, 2),
    outputNameFor('map', 'webp', 2, 2),
  );

  // The page number is the real page, so a mid-document range stays traceable.
  assert.equal(outputNameFor('map', 'jpg', 3, 8), 'map-3.jpg');
});

test('parsePages accepts a single page and an inclusive range', () => {
  assert.deepEqual(parsePages('2'), { first: 2, last: 2 });
  assert.deepEqual(parsePages('1-3'), { first: 1, last: 3 });
  assert.deepEqual(parsePages(' 4 '), { first: 4, last: 4 });
});

test('parseArgs collects PDFs and applies the documented defaults', () => {
  const { pdfs, options } = parseArgs(['a.pdf', 'b.pdf']);
  assert.deepEqual(pdfs, ['a.pdf', 'b.pdf']);
  assert.equal(options.format, 'webp');
  assert.equal(options.dpi, 150);
  assert.equal(options.quality, 85);
  assert.equal(options.width, null);
  assert.equal(options.pages, null);
  assert.equal(options.force, false);
  assert.equal(options.dryRun, false);
});

test('parseArgs reads every documented option', () => {
  const { pdfs, options } = parseArgs([
    'map.pdf',
    '--out',
    'build',
    '--format',
    'PNG',
    '--width',
    '2200',
    '--quality',
    '88',
    '--pages',
    '2-4',
    '--prefix',
    'trail-map',
    '--force',
    '--dry-run',
  ]);
  assert.deepEqual(pdfs, ['map.pdf']);
  assert.equal(options.out, 'build');
  assert.equal(options.format, 'png', 'format is lowercased');
  assert.equal(options.width, 2200);
  assert.equal(options.quality, 88);
  assert.deepEqual(options.pages, { first: 2, last: 4 });
  assert.equal(options.prefix, 'trail-map');
  assert.equal(options.force, true);
  assert.equal(options.dryRun, true);
});

test('formatBytes switches unit at each threshold', () => {
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
});

// Run the CLI and hand back the combined output plus the exit status.
function runScript(args) {
  try {
    const stdout = execFileSync(process.execPath, [script, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, output: stdout };
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

test('a failing external command reports through the error path, not a stack trace', () => {
  // pdfinfo rejects this file, which used to surface as an uncaught Node error.
  const notAPdf = resolve(repoRoot, 'package.json');
  const { status, output } = runScript([notAPdf, '--dry-run']);

  assert.equal(status, 1);
  assert.match(output, /^❌ /m, 'reports with the ❌ status emoji');
  assert.doesNotMatch(output, /^\s+at .+:\d+:\d+\)?$/m, 'no stack frames');
  assert.doesNotMatch(output, /node:internal/, 'no Node internals');
});

test('--help exits cleanly and documents the usage', () => {
  const { status, output } = runScript(['--help']);
  assert.equal(status, 0);
  assert.match(output, /Usage:/);
  assert.match(output, /--pages/);
});

test('an unknown option is a fatal error rather than a silent no-op', () => {
  const { status, output } = runScript(['map.pdf', '--nope']);
  assert.equal(status, 1);
  assert.match(output, /^❌ /m);
  assert.match(output, /Unknown option/);
});
