// check-skill-allowlist.mjs notes
// Usage:
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --write
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --repo-root /path/to/repo
//
// Output:
// * Human-readable report listing skills already in sync, skills to add, and stale Skill() entries to remove.
// * Final status line: `result:ok`, `result:drift`, or `result:written`.
// * Exit codes: 0 = in sync (or successful write), 1 = drift detected in check mode, 2 = configuration error.
//
// Description:
// * Purpose: Reconcile `Skill(<name>)` entries in `.claude/settings.json` `permissions.allow` against the repo's `skills/` folder.
// * Default mode prints a report and exits 1 when drift is detected so it can be wired into `pnpm test`.
// * With `--write`, edits `.claude/settings.json`: appends missing `Skill(<name>)` entries and removes stale ones.
// * Non-Skill permission entries (`Bash(...)`, `Read(...)`, etc.) are never reordered, rewritten, or removed.
// * Skill names come from the `name:` frontmatter field in each `SKILL.md`, falling back to the directory name if missing.

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

const SKILL_ENTRY_RE = /^Skill\(([^)]+)\)$/;
const FRONTMATTER_NAME_RE = /^name:\s*(.+?)\s*$/m;

// Raised when input is invalid; surfaces as exit code 2.
class ConfigError extends Error {}

function printUsage() {
  console.log(
    'Usage: node check-skill-allowlist.mjs [--write] [--repo-root <dir>]',
  );
}

function usageError(message) {
  console.error(`❌ ${message}`);
  process.exit(2);
}

// Parse argv:
//   --write           write reconciled allowlist back to settings.json
//   --repo-root <dir> override repo root detection (default: `git rev-parse --show-toplevel`)
function parseArgs(argv) {
  const args = { write: false, repoRoot: null };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--write') {
      args.write = true;
      i += 1;
    } else if (arg === '--repo-root') {
      i += 1;
      if (i >= argv.length)
        usageError('argument --repo-root: expected one argument');
      args.repoRoot = argv[i];
      i += 1;
    } else if (arg.startsWith('--repo-root=')) {
      args.repoRoot = arg.slice('--repo-root='.length);
      i += 1;
    } else if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else {
      usageError(`unrecognized argument: ${arg}`);
    }
  }
  return args;
}

function findRepoRoot(explicit) {
  if (explicit) {
    const abs = isAbsolute(explicit) ? explicit : resolve(explicit);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) {
      throw new ConfigError(`--repo-root is not a directory: ${abs}`);
    }
    return abs;
  }
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new ConfigError(
      'could not determine repo root (not a git checkout); pass --repo-root',
    );
  }
  return result.stdout.trim();
}

function readSettings(repoRoot) {
  const path = join(repoRoot, '.claude', 'settings.json');
  if (!existsSync(path)) {
    throw new ConfigError(`settings file not found: ${path}`);
  }
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new ConfigError(`could not read ${path}: ${err.message}`);
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new ConfigError(`invalid JSON in ${path}: ${err.message}`);
  }
  return { path, json };
}

function resolveSkillsDir(repoRoot, settings) {
  const configured = settings?.skills?.directory;
  const rel =
    typeof configured === 'string' && configured.length > 0
      ? configured
      : 'skills';
  const abs = isAbsolute(rel) ? rel : resolve(repoRoot, rel);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) {
    throw new ConfigError(`skills directory not found: ${abs}`);
  }
  return abs;
}

// Read the `name:` value from the first YAML frontmatter block of a SKILL.md.
// Falls back to the directory name when the file or field is missing.
function readSkillName(skillMdPath, fallbackDirName) {
  let raw;
  try {
    raw = readFileSync(skillMdPath, 'utf8');
  } catch {
    return fallbackDirName;
  }
  if (!raw.startsWith('---')) return fallbackDirName;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return fallbackDirName;
  const block = raw.slice(3, end);
  const match = block.match(FRONTMATTER_NAME_RE);
  if (!match) return fallbackDirName;
  let name = match[1].trim();
  if (
    (name.startsWith('"') && name.endsWith('"')) ||
    (name.startsWith("'") && name.endsWith("'"))
  ) {
    name = name.slice(1, -1).trim();
  }
  return name.length > 0 ? name : fallbackDirName;
}

function collectSkills(skillsDir) {
  const skills = new Set();
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(skillsDir, entry.name, 'SKILL.md');
    if (!existsSync(skillMd)) continue;
    skills.add(readSkillName(skillMd, entry.name));
  }
  return skills;
}

function bucketAllowlist(allowlist, desired) {
  const inSync = [];
  const toRemove = [];
  const seen = new Set();
  for (const entry of allowlist) {
    if (typeof entry !== 'string') continue;
    const match = entry.match(SKILL_ENTRY_RE);
    if (!match) continue;
    const name = match[1];
    seen.add(name);
    if (desired.has(name)) inSync.push(name);
    else toRemove.push(name);
  }
  const toAdd = [];
  for (const name of desired) {
    if (!seen.has(name)) toAdd.push(name);
  }
  return { inSync, toAdd, toRemove };
}

// Rebuild the allowlist: keep every non-Skill entry in its original position,
// then append the desired Skill() entries sorted case-insensitively.
function reconcileAllowlist(allowlist, desired) {
  const nonSkill = [];
  for (const entry of allowlist) {
    if (typeof entry !== 'string' || !SKILL_ENTRY_RE.test(entry)) {
      nonSkill.push(entry);
    }
  }
  const skillEntries = Array.from(desired)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((name) => `Skill(${name})`);
  return [...nonSkill, ...skillEntries];
}

const byNameInsensitive = (a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase());

function printList(label, names, emoji) {
  if (names.length === 0) return;
  console.log(`${emoji} ${label} (${names.length}):`);
  for (const name of names.slice().sort(byNameInsensitive)) {
    console.log(`  - Skill(${name})`);
  }
  console.log('');
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let repoRoot;
  let settingsPath;
  let settings;
  let skillsDir;
  try {
    repoRoot = findRepoRoot(args.repoRoot);
    ({ path: settingsPath, json: settings } = readSettings(repoRoot));
    skillsDir = resolveSkillsDir(repoRoot, settings);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`❌ ${err.message}`);
      process.exit(2);
    }
    throw err;
  }

  const desired = collectSkills(skillsDir);
  const allowlist = Array.isArray(settings?.permissions?.allow)
    ? settings.permissions.allow
    : [];
  const nonSkillCount = allowlist.filter(
    (entry) => typeof entry === 'string' && !SKILL_ENTRY_RE.test(entry),
  ).length;

  const { inSync, toAdd, toRemove } = bucketAllowlist(allowlist, desired);

  console.log(`🔍 settings:           ${settingsPath}`);
  console.log(`🔍 skills_dir:         ${skillsDir}`);
  console.log(`🔍 skills_found:       ${desired.size}`);
  console.log(`🔍 non_skill_entries:  ${nonSkillCount}`);
  console.log('');

  printList('Already in sync', inSync, '✅');
  printList('To add', toAdd, '➕');
  printList('To remove (skill folder no longer exists)', toRemove, '➖');

  const drift = toAdd.length + toRemove.length;

  if (drift === 0) {
    console.log(
      `✅ Allowlist already in sync. ${desired.size} skill(s) checked.`,
    );
    console.log('result:ok');
    process.exit(0);
  }

  if (!args.write) {
    console.log(
      `⚠️  Drift detected: ${toAdd.length} to add, ${toRemove.length} to remove.`,
    );
    console.log('Re-run with --write to apply the changes.');
    console.log('result:drift');
    process.exit(1);
  }

  if (!settings.permissions || typeof settings.permissions !== 'object') {
    settings.permissions = {};
  }
  settings.permissions.allow = reconcileAllowlist(allowlist, desired);
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log(`✅ Written: added ${toAdd.length}, removed ${toRemove.length}.`);
  console.log(`result:written`);
  process.exit(0);
}

main();
