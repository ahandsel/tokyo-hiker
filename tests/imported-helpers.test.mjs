// Imported helper regression checks.
// Run with pnpm test. Fixtures stay in temporary directories; no GitHub or browser network calls run.
// Covers PNG output pixels, preservation on failure, include formatting, and wrapper argument forwarding.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'tokyo-import-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function run(script, args, options = {}) {
  return spawnSync(process.execPath, [resolve(root, script), ...args], {
    encoding: 'utf8',
    ...options,
  });
}
function chunk(type, data) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(data.length);
  header.write(type, 4);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type), data])));
  return Buffer.concat([header, data, checksum]);
}
function png(background, center) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(3, 0);
  header.writeUInt32BE(3, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < 3; y++) {
    rows.push(0);
    for (let x = 0; x < 3; x++)
      rows.push(...(x === 1 && y === 1 ? center : background));
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.from(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

test('PNG trimming preserves the colored pixel and the explicit input for white and transparent borders', (t) => {
  const dir = fixture(t);
  for (const background of [
    [255, 255, 255, 255],
    [0, 0, 0, 0],
  ]) {
    const input = join(dir, 'input.png');
    const output = join(dir, 'output.png');
    const original = png(background, [20, 80, 140, 255]);
    writeFileSync(input, original);
    const result = run('scripts/trim-png.mjs', [input, output]);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readFileSync(input), original);
    const image = readFileSync(output);
    assert.equal(image.readUInt32BE(16), 1);
    assert.equal(image.readUInt32BE(20), 1);
    const compressed = [];
    for (let pos = 8; pos < image.length;) {
      const length = image.readUInt32BE(pos);
      if (image.toString('ascii', pos + 4, pos + 8) === 'IDAT')
        compressed.push(image.subarray(pos + 8, pos + 8 + length));
      pos += length + 12;
    }
    assert.deepEqual(
      [...inflateSync(Buffer.concat(compressed))],
      [0, 20, 80, 140, 255],
    );
  }
});

test('empty PNG fails without overwriting its input', (t) => {
  const dir = fixture(t);
  const input = join(dir, 'empty.png');
  const original = png([0, 0, 0, 0], [0, 0, 0, 0]);
  writeFileSync(input, original);
  const result = run('scripts/trim-png.mjs', [input]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /entirely empty/);
  assert.deepEqual(readFileSync(input), original);
});

test('include checker accepts repository whitespace and fragments but catches a missing file', (t) => {
  const dir = fixture(t);
  const page = join(dir, 'page.md');
  writeFileSync(join(dir, 'snippet.md'), '# Snippet\n');
  writeFileSync(page, '<!--@include: snippet.md#section -->\n');
  const script =
    'skills/vitepress-include-lint/scripts/check-vitepress-includes.mjs';
  assert.equal(run(script, ['--paths', page]).status, 0);
  writeFileSync(page, '<!--@include: missing.md -->\n');
  const result = run(script, ['--paths', page]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /INCLUDE_PATH_NOT_FOUND/);
});

test('Playwright wrapper forwards session and arguments to pnpm and keeps help offline', (t) => {
  const dir = fixture(t);
  writeFileSync(join(dir, 'pnpm'), '#!/bin/sh\nprintf "%s\\n" "$@"\n', {
    mode: 0o755,
  });
  const wrapper = resolve(root, 'skills/playwright/scripts/playwright-cli.sh');
  const env = {
    ...process.env,
    PATH: `${dir}:${process.env.PATH}`,
    PLAYWRIGHT_CLI_SESSION: 'hike',
  };
  const runWrapper = (args) =>
    spawnSync('zsh', [wrapper, ...args], { env, encoding: 'utf8' });
  const implicit = runWrapper(['open', 'https://example.com/a b']);
  assert.equal(implicit.status, 0, implicit.stderr);
  assert.deepEqual(implicit.stdout.trim().split('\n'), [
    'dlx',
    '@playwright/cli',
    '--session',
    'hike',
    'open',
    'https://example.com/a b',
  ]);
  const explicit = runWrapper(['--session=other', 'snapshot']);
  assert.deepEqual(explicit.stdout.trim().split('\n'), [
    'dlx',
    '@playwright/cli',
    '--session=other',
    'snapshot',
  ]);
  const help = runWrapper(['--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage:/);
  assert.doesNotMatch(help.stdout, /^dlx$/m);
});

test('cleanup preserves nonempty files when deletion is declined', (t) => {
  const dir = fixture(t);
  const empty = join(dir, 'temp-empty');
  const keep = join(dir, 'temp-keep.md');
  writeFileSync(empty, '');
  writeFileSync(keep, 'keep this');
  const result = spawnSync(
    'zsh',
    [resolve(root, 'scripts/cleanup-temp-files.sh')],
    {
      cwd: dir,
      input: 'n\n',
      encoding: 'utf8',
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(keep, 'utf8'), 'keep this');
  assert.throws(() => readFileSync(empty), { code: 'ENOENT' });
});
