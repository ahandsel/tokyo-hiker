// check-skill-allowlist.mjs notes
// Usage:
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --write
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --repo-root /path/to/repo
//
// Output:
// * Human-readable report listing, for both managed groups (skills and scripts), the entries
//   already in sync, the entries to add, and the stale entries to remove.
// * Final status line: `result:ok`, `result:drift`, or `result:written`.
// * Exit codes: 0 = in sync (or successful write), 1 = drift detected in check mode, 2 = configuration error.
//
// Description:
// * Purpose: Reconcile two managed entry groups in `.claude/settings.json` `permissions.allow`:
//     1. `Skill(<name>)` entries - one per `skills/*/SKILL.md`.
//     2. Script `Bash(<runner> <path>:*)` entries - one per runnable script stored inside a skill folder.
//        Runnable scripts are mapped by extension: `.mjs` -> `node`, `.zsh` -> `zsh`. Plain `.js`
//        files (for example Figma Plugin API snippets) are intentionally ignored: they are not run via Bash.
// * Default mode prints a report and exits 1 when drift is detected so it can be wired into `pnpm test`.
// * With `--write`, edits `.claude/settings.json`: appends missing entries and removes stale ones for both groups.
// * Entries that belong to neither managed group (other `Bash(...)`, `Read(...)`, `WebSearch`, etc.) are
//   never reordered, rewritten, or removed.
// * Skill names come from the `name:` frontmatter field in each `SKILL.md`, falling back to the directory name if missing.
//
// Version history:
// * v2.0 - 2026-06-24 - Also reconcile script `Bash(<runner> <path>:*)` allow entries for runnable scripts
//                       (`.mjs` -> node, `.zsh` -> zsh) stored within skill folders.
// * v1.0 - 2026-06-08 - Reconcile `Skill(<name>)` allow entries against the `skills/` folder.

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const SKILL_ENTRY_RE = /^Skill\(([^)]+)\)$/;
const FRONTMATTER_NAME_RE = /^name:\s*(.+?)\s*$/m;

// Map a runnable script's file extension to the command used to run it from the repo root.
// Plain `.js` is deliberately absent: those files (for example Figma Plugin API snippets) are
// not invoked via Bash, so they must not gain a Bash allow entry.
const SCRIPT_RUNNERS = { '.mjs': 'node', '.zsh': 'zsh' };
const SCRIPT_EXTENSIONS = Object.keys(SCRIPT_RUNNERS);

// Directories never descended into while hunting for scripts inside a skill folder.
const SKIP_DIRS = new Set(['node_modules', '.git']);

// Raised when input is invalid; surfaces as exit code 2.
class ConfigError extends Error {}

const byInsensitive = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

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

// Every immediate `skills/*/` directory that contains a `SKILL.md` is a skill.
function listSkillDirs(skillsDir) {
  const dirs = [];
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(skillsDir, entry.name);
    if (!existsSync(join(dir, 'SKILL.md'))) continue;
    dirs.push({ name: entry.name, dir });
  }
  return dirs;
}

// Desired `Skill(<name>)` allow entries, one per skill folder.
function collectSkillEntries(skillsDir) {
  const entries = new Set();
  for (const { name, dir } of listSkillDirs(skillsDir)) {
    entries.add(`Skill(${readSkillName(join(dir, 'SKILL.md'), name)})`);
  }
  return entries;
}

// Recursively collect runnable script files (by extension) anywhere under `dir`.
function collectScriptFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...collectScriptFiles(full));
    } else if (
      entry.isFile() &&
      SCRIPT_EXTENSIONS.includes(extname(entry.name))
    ) {
      files.push(full);
    }
  }
  return files;
}

// Desired script `Bash(<runner> <relpath>:*)` allow entries, one per runnable
// script stored within any skill folder. Paths are relative to the repo root,
// because that is the directory the agent runs the scripts from.
function collectScriptEntries(skillsDir, repoRoot) {
  const entries = new Set();
  for (const { dir } of listSkillDirs(skillsDir)) {
    for (const file of collectScriptFiles(dir)) {
      const rel = relative(repoRoot, file).split(sep).join('/');
      const runner = SCRIPT_RUNNERS[extname(file)];
      entries.add(`Bash(${runner} ${rel}:*)`);
    }
  }
  return entries;
}

// Regex matching any managed script entry: `Bash(<runner> <skillsRel>/<...>.<ext>:*)`.
// Used to recognise (and so reconcile) entries the syncer owns, including stale ones
// whose script has been deleted.
function buildScriptEntryRe(skillsRel) {
  const runners = Object.values(SCRIPT_RUNNERS).join('|');
  const exts = SCRIPT_EXTENSIONS.map((e) => e.slice(1)).join('|');
  const prefix = skillsRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `^Bash\\((?:${runners}) ${prefix}/.+\\.(?:${exts}):\\*\\)$`,
  );
}

// Bucket the allow entries that match `matchRe` against the `desired` entry set.
function bucketEntries(allowlist, desired, matchRe) {
  const inSync = [];
  const toRemove = [];
  const present = new Set();
  for (const entry of allowlist) {
    if (typeof entry !== 'string' || !matchRe.test(entry)) continue;
    present.add(entry);
    if (desired.has(entry)) inSync.push(entry);
    else toRemove.push(entry);
  }
  const toAdd = [];
  for (const want of desired) {
    if (!present.has(want)) toAdd.push(want);
  }
  return { inSync, toAdd, toRemove };
}

// Rebuild the allowlist: keep every unmanaged entry in its original position, then
// append the desired script entries and the desired Skill entries, each sorted
// case-insensitively. Both managed groups are dropped from their old positions first
// so stale entries disappear and surviving entries cluster predictably.
function reconcileAllowlist(
  allowlist,
  desiredScripts,
  desiredSkills,
  scriptRe,
) {
  const other = [];
  for (const entry of allowlist) {
    if (typeof entry !== 'string') {
      other.push(entry);
      continue;
    }
    if (SKILL_ENTRY_RE.test(entry) || scriptRe.test(entry)) continue;
    other.push(entry);
  }
  const scriptEntries = Array.from(desiredScripts).sort(byInsensitive);
  const skillEntries = Array.from(desiredSkills).sort(byInsensitive);
  return [...other, ...scriptEntries, ...skillEntries];
}

function printEntries(label, entries, emoji) {
  if (entries.length === 0) return;
  console.log(`${emoji} ${label} (${entries.length}):`);
  for (const entry of entries.slice().sort(byInsensitive)) {
    console.log(`  - ${entry}`);
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

  const skillsRel = relative(repoRoot, skillsDir).split(sep).join('/') || '.';
  const scriptRe = buildScriptEntryRe(skillsRel);

  const desiredSkills = collectSkillEntries(skillsDir);
  const desiredScripts = collectScriptEntries(skillsDir, repoRoot);

  const allowlist = Array.isArray(settings?.permissions?.allow)
    ? settings.permissions.allow
    : [];
  const otherCount = allowlist.filter(
    (entry) =>
      typeof entry === 'string' &&
      !SKILL_ENTRY_RE.test(entry) &&
      !scriptRe.test(entry),
  ).length;

  const skills = bucketEntries(allowlist, desiredSkills, SKILL_ENTRY_RE);
  const scripts = bucketEntries(allowlist, desiredScripts, scriptRe);

  console.log(`🔍 settings:           ${settingsPath}`);
  console.log(`🔍 skills_dir:         ${skillsDir}`);
  console.log(`🔍 skills_found:       ${desiredSkills.size}`);
  console.log(`🔍 scripts_found:      ${desiredScripts.size}`);
  console.log(`🔍 other_entries:      ${otherCount}`);
  console.log('');

  console.log('== Skills ==');
  printEntries('Already in sync', skills.inSync, '✅');
  printEntries('To add', skills.toAdd, '➕');
  printEntries(
    'To remove (skill folder no longer exists)',
    skills.toRemove,
    '➖',
  );

  console.log('== Scripts ==');
  printEntries('Already in sync', scripts.inSync, '✅');
  printEntries('To add', scripts.toAdd, '➕');
  printEntries('To remove (script no longer exists)', scripts.toRemove, '➖');

  const toAdd = skills.toAdd.length + scripts.toAdd.length;
  const toRemove = skills.toRemove.length + scripts.toRemove.length;

  if (toAdd + toRemove === 0) {
    console.log(
      `✅ Allowlist already in sync. ${desiredSkills.size} skill(s), ${desiredScripts.size} script(s) checked.`,
    );
    console.log('result:ok');
    process.exit(0);
  }

  if (!args.write) {
    console.log(`⚠️  Drift detected: ${toAdd} to add, ${toRemove} to remove.`);
    console.log('Re-run with --write to apply the changes.');
    console.log('result:drift');
    process.exit(1);
  }

  if (!settings.permissions || typeof settings.permissions !== 'object') {
    settings.permissions = {};
  }
  settings.permissions.allow = reconcileAllowlist(
    allowlist,
    desiredScripts,
    desiredSkills,
    scriptRe,
  );
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log(`✅ Written: added ${toAdd}, removed ${toRemove}.`);
  console.log(`result:written`);
  process.exit(0);
}

main();
