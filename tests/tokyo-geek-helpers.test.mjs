// Regression checks for the Tokyo Geek imports.
// Run pnpm test. All Git operations use temporary repositories and local remotes.
// Guard branch verification, unpushed-work extraction, allowlist reconciliation, and sitemap base validation.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
function temporary(t) {
  const dir = mkdtempSync(join(tmpdir(), 'tokyo-geek-import-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function run(file, args, cwd) {
  return spawnSync(process.execPath, [resolve(root, file), ...args], {
    cwd,
    encoding: 'utf8',
  });
}
function git(cwd, ...args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: '/dev/null',
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function repository(t) {
  const dir = temporary(t);
  git(dir, 'init', '-b', 'main');
  git(dir, 'config', 'user.name', 'Import Test');
  git(dir, 'config', 'user.email', 'test@example.invalid');
  git(dir, 'config', 'commit.gpgsign', 'false');
  writeFileSync(join(dir, 'base.txt'), 'base\n');
  git(dir, 'add', 'base.txt');
  git(dir, 'commit', '-m', 'Initial fixture');
  return dir;
}

test('branch audit and extraction retain local unpushed work', (t) => {
  const dir = repository(t);
  git(dir, 'checkout', '-b', 'topic');
  git(dir, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  git(dir, 'update-ref', 'refs/remotes/origin/topic', 'HEAD');
  writeFileSync(join(dir, 'unique.txt'), 'Unpushed work\n');
  git(dir, 'add', 'unique.txt');
  git(dir, 'commit', '-m', 'Unpushed fixture');
  const before = git(dir, 'rev-parse', 'HEAD');
  const inventory = run(
    'skills/audit-gh-branches/scripts/collect-branches.mjs',
    ['--no-fetch'],
    dir,
  );
  assert.equal(inventory.status, 0, inventory.stderr);
  const topic = JSON.parse(inventory.stdout).branches.find(
    (branch) => branch.name === 'topic',
  );
  assert.equal(topic.localAheadOfRemote, 1);
  assert.equal(topic.merged, false);
  assert.equal(topic.ref, 'topic');
  assert.notEqual(topic.disposition, 'safe-to-delete');
  const output = join(dir, 'notes');
  const args = ['topic', '--output-dir', output];
  const extraction = run(
    'skills/audit-gh-branches/scripts/extract-branch-notes.mjs',
    args,
    dir,
  );
  assert.equal(extraction.status, 0, extraction.stderr);
  assert.match(
    readFileSync(join(output, 'topic/unique-commits.patch'), 'utf8'),
    /Unpushed work/,
  );
  const summaryPath = join(output, 'topic/summary.md');
  writeFileSync(summaryPath, 'Preserve user notes\n');
  assert.equal(
    run('skills/audit-gh-branches/scripts/extract-branch-notes.mjs', args, dir)
      .status,
    3,
  );
  assert.equal(readFileSync(summaryPath, 'utf8'), 'Preserve user notes\n');
  assert.equal(git(dir, 'rev-parse', 'HEAD'), before);
});

test('sync verification reports divergence without changing a dirty working branch', (t) => {
  const dir = repository(t);
  const remote = temporary(t);
  git(remote, 'init', '--bare');
  git(dir, 'remote', 'add', 'origin', remote);
  git(dir, 'push', 'origin', 'main');
  git(dir, 'checkout', '-b', 'topic');
  writeFileSync(join(dir, 'topic.txt'), 'topic\n');
  git(dir, 'add', 'topic.txt');
  git(dir, 'commit', '-m', 'Topic fixture');
  git(dir, 'checkout', 'main');
  writeFileSync(join(dir, 'main.txt'), 'main\n');
  git(dir, 'add', 'main.txt');
  git(dir, 'commit', '-m', 'Main fixture');
  git(dir, 'push', 'origin', 'main');
  git(dir, 'checkout', 'topic');
  writeFileSync(join(dir, 'topic.txt'), 'Uncommitted work\n');
  const before = git(dir, 'rev-parse', 'HEAD');
  const result = run(
    'skills/gh-sync-with-main/scripts/update-branch-from-main.mjs',
    ['--verify', '--strategy', 'merge'],
    dir,
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Ahead of base: 1 commit/);
  assert.match(result.stdout, /Behind base: 1 commit/);
  assert.match(result.stdout, /sync recommended \(merge\)/);
  assert.equal(git(dir, 'rev-parse', 'HEAD'), before);
  assert.equal(
    readFileSync(join(dir, 'topic.txt'), 'utf8'),
    'Uncommitted work\n',
  );
});

test('allowlist reconciliation finds shell helpers and removes only managed duplicates', (t) => {
  const dir = temporary(t);
  mkdirSync(join(dir, '.claude'));
  mkdirSync(join(dir, 'skills/example/scripts'), { recursive: true });
  writeFileSync(
    join(dir, 'skills/example/SKILL.md'),
    '---\nname: example\ndescription: Fixture skill\n---\n',
  );
  writeFileSync(
    join(dir, 'skills/example/scripts/run.sh'),
    '#!/usr/bin/env zsh\n',
  );
  const settings = join(dir, '.claude/settings.json');
  writeFileSync(
    settings,
    JSON.stringify({
      permissions: {
        allow: ['Read(*)', 'Skill(example)', 'Skill(example)', 'Skill(stale)'],
        deny: ['Bash(git push *)'],
      },
    }),
  );
  const helper =
    'skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs';
  assert.equal(run(helper, ['--repo-root', dir], dir).status, 1);
  assert.equal(run(helper, ['--repo-root', dir, '--write'], dir).status, 0);
  const permissions = JSON.parse(readFileSync(settings, 'utf8')).permissions;
  assert.deepEqual(permissions.allow, [
    'Read(*)',
    'Bash(zsh skills/example/scripts/run.sh:*)',
    'Skill(example)',
  ]);
  assert.deepEqual(permissions.deny, ['Bash(git push *)']);
  assert.equal(run(helper, ['--repo-root', dir], dir).status, 0);
});

test('sitemap checker rejects missing, empty, foreign, and doubled-base URLs', (t) => {
  const dir = temporary(t);
  mkdirSync(join(dir, 'scripts'));
  mkdirSync(join(dir, 'contents/.vitepress/dist'), { recursive: true });
  const script = join(dir, 'scripts/check-sitemap.mjs');
  copyFileSync(resolve(root, 'scripts/check-sitemap.mjs'), script);
  assert.equal(run(script, [], dir).status, 1);
  const sitemap = join(dir, 'contents/.vitepress/dist/sitemap.xml');
  for (const loc of [
    '',
    'https://ahandsel.github.io/tokyo-geek/',
    'https://ahandsel.github.io/tokyo-hiker/tokyo-hiker/route.html',
  ]) {
    writeFileSync(
      sitemap,
      loc ? `<urlset><url><loc>${loc}</loc></url></urlset>` : '<urlset/>',
    );
    assert.equal(run(script, [], dir).status, 1);
  }
  writeFileSync(
    sitemap,
    '<urlset><url><loc>https://ahandsel.github.io/tokyo-hiker/level-1/route.html</loc></url></urlset>',
  );
  assert.equal(run(script, [], dir).status, 0);
});
