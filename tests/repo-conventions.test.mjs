// Repository convention guards.
//
// Each test here encodes a rule that AGENTS.md states in prose but that no tool
// enforced, so a regression could land unnoticed.

import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

function read(file) {
  return readFileSync(resolve(repoRoot, file), 'utf8');
}

test('no Markdown file contains a shfmt-mangled shell placeholder', () => {
  // prettier-plugin-sh parses <pdf> in a ```shell block as a redirection and
  // rewrites it to `< pdf >`, which turns a documented command into one that
  // reads from a file named pdf. `embeddedLanguageFormatting: 'off'` for
  // Markdown in .prettierrc.json5 is what prevents this; the test guards the
  // setting by guarding its effect.
  const offenders = [];
  for (const file of trackedFiles()) {
    if (!file.endsWith('.md')) continue;
    const lines = read(file).split('\n');
    lines.forEach((line, index) => {
      if (/< [a-zA-Z_][a-zA-Z0-9_-]* >/.test(line)) {
        offenders.push(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(
    offenders,
    [],
    `Mangled shell placeholders found. Check that .prettierrc.json5 still sets
embeddedLanguageFormatting: 'off' for **/*.md, then repair these lines:\n${offenders.join('\n')}`,
  );
});

test('every pnpm script referenced in the docs actually exists', () => {
  // A skill or a README that calls a script which is not in package.json fails
  // the moment someone follows it, and nothing else catches that.
  //
  // Only code contexts count: a fenced block, or an inline code span. Prose such
  // as "pnpm only" or "the pnpm version" is not an invocation.
  const { scripts } = JSON.parse(read('package.json'));
  const known = new Set(Object.keys(scripts));
  // pnpm's own subcommands are not package scripts.
  const builtins = new Set([
    'add',
    'audit',
    'bin',
    'config',
    'create',
    'dedupe',
    'deploy',
    'dlx',
    'env',
    'exec',
    'fetch',
    'import',
    'init',
    'install',
    'licenses',
    'link',
    'list',
    'outdated',
    'pack',
    'patch',
    'prune',
    'publish',
    'rebuild',
    'remove',
    'root',
    'run',
    'setup',
    'store',
    'unlink',
    'up',
    'update',
    'why',
  ]);
  const offenders = [];

  for (const file of trackedFiles()) {
    if (!file.endsWith('.md')) continue;
    // Historical notes record commands as they were at the time, so skip them.
    if (file.startsWith('notes/')) continue;

    let inFence = false;
    read(file)
      .split('\n')
      .forEach((line, index) => {
        if (/^\s*(```|~~~)/.test(line)) {
          inFence = !inFence;
          return;
        }
        // In a fence the whole line is a command; outside it, only code spans are.
        // A trailing `#` comment inside a fence is prose, so drop it.
        const candidates = inFence
          ? [line.replace(/(^|\s)#.*$/, '')]
          : [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

        for (const candidate of candidates) {
          for (const match of candidate.matchAll(
            /\bpnpm (?:run )?([a-z][a-z0-9:-]*)/g,
          )) {
            const name = match[1];
            // `pnpm run setup-*` is a glob standing for a family of scripts.
            if (name.endsWith('-') || name.endsWith(':')) continue;
            if (builtins.has(name) || known.has(name)) continue;
            offenders.push(`${file}:${index + 1}: pnpm ${name}`);
          }
        }
      });
  }

  assert.deepEqual(
    offenders,
    [],
    `These docs call a pnpm script that does not exist:\n${offenders.join('\n')}`,
  );
});

test('no two skills share a description, and each name matches its directory', () => {
  // Identical descriptions leave an agent no basis to choose between two skills.
  const seen = new Map();
  const offenders = [];

  for (const file of trackedFiles()) {
    if (!/^skills\/[^/]+\/SKILL\.md$/.test(file)) continue;
    const directory = file.split('/')[1];
    const front = read(file).split('---')[1] ?? '';
    const name = front.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = front
      .match(/^description:\s*([\s\S]+?)(?=\n\w+:|\n*$)/m)?.[1]
      ?.trim();

    if (name !== directory) {
      offenders.push(
        `${file}: name "${name}" does not match directory "${directory}"`,
      );
    }
    if (description) {
      if (seen.has(description)) {
        offenders.push(
          `${file}: description is identical to ${seen.get(description)}`,
        );
      } else {
        seen.set(description, file);
      }
    }
  }

  assert.deepEqual(offenders, [], offenders.join('\n'));
});

test('helper scripts satisfy the AGENTS.md script rules', () => {
  // script-auditor exits 1 on a ❌ failure and 0 on advisory ⚠️ warnings.
  const audit = resolve(
    repoRoot,
    'skills/script-auditor/scripts/audit-helper-scripts.mjs',
  );
  let status = 0;
  let output = '';
  try {
    output = execFileSync(process.execPath, [audit], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    status = error.status;
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  assert.equal(status, 0, `script-auditor reported failures:\n${output}`);
});

test('the skill allowlist matches the skills on disk', () => {
  const checker = resolve(
    repoRoot,
    'skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs',
  );
  let status = 0;
  let output = '';
  try {
    output = execFileSync(process.execPath, [checker], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    status = error.status;
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  assert.equal(
    status,
    0,
    `.claude/settings.json is out of sync with skills/. Run the syncer with --write:\n${output}`,
  );
});

test('every asset a content page references exists in contents/public', () => {
  // The asset folders are named after the page that uses them, so a rename has
  // to update the site-root paths in the page as well.
  const offenders = [];
  for (const file of trackedFiles()) {
    if (!file.startsWith('contents/') || !file.endsWith('.md')) continue;
    for (const match of read(file).matchAll(/^\[img-[^\]]+\]:\s*(\/\S+)$/gm)) {
      const target = resolve(repoRoot, 'contents/public', `.${match[1]}`);
      try {
        readFileSync(target);
      } catch {
        offenders.push(`${file}: ${match[1]}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `These image definitions point at a missing asset:\n${offenders.join('\n')}`,
  );
});
