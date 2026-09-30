// check-skill-allowlist.mjs notes
//
// General notes:
// * Purpose: Reconcile two managed groups of `permissions.allow` entries in `.claude/settings.json`
//   against the repo's `skills/` folder:
//     1. Skills  - one `Skill(<name>)` entry per `skills/*/SKILL.md`.
//     2. Scripts - one `Bash(<runner> <path>:*)` entry per runnable script inside a skill folder.
// * Runner map: `.mjs` -> `node`, `.sh` and `.zsh` -> `zsh`. Shell scripts run under `zsh` because
//   the skill shell helpers use zsh. Plain .js files are ignored because they
//   are not declared standalone helpers by this runner map.
// * Entries in neither managed group (other `Bash(...)`, `Read(...)`, `WebFetch(...)`, etc.) are never
//   reordered, rewritten, or removed.
// * Skill names come from the `name:` frontmatter field in each `SKILL.md`, falling back to the
//   directory name when that field is missing or empty.
//
// Usage:
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --write
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --repo-root /path/to/repo
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --repo-root=/path/to/repo
//   node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs --help
//
// Output:
// * A header, then a `== Skills ==` section and a `== Scripts ==` section. Each section lists the
//   entries already in sync, the entries to add, the stale entries to remove, and any duplicate
//   entries to collapse.
// * Final status line: `result:ok`, `result:drift`, or `result:written`.
// * Exit codes: 0 = in sync (or successful write), 1 = drift detected in check mode,
//   2 = configuration error.
//
// Version history:
// * v2.2 - 2026-09-30 - Import shell discovery and duplicate handling into Tokyo Hiker; document the local runner scope.
// * v2.1 - 2026-08-18 - Map `.sh` to `zsh` so shell scripts named the way this repo names them are
//                       covered, derive the managed-entry pattern from the runner map instead of
//                       hardcoding it, report duplicate managed entries as drift, and document the
//                       `--repo-root=<dir>` form.
// * v2.0 - 2026-08-18 - Also reconcile script `Bash(<runner> <path>:*)` entries for the runnable
//                       scripts (`.mjs` -> node, `.zsh` -> zsh) stored inside skill folders, split
//                       the report into `== Skills ==` and `== Scripts ==` sections, and expand
//                       `--help` into a full options list.
// * v1.0 - 2026-06-08 - Initial release: reconcile `Skill(<name>)` entries against the `skills/` folder.

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

// File extensions that count as runnable scripts, mapped to their Bash runner.
// `.js` is deliberately absent - see the notes block above.
const RUNNER_BY_EXT = { '.mjs': 'node', '.sh': 'zsh', '.zsh': 'zsh' };

// Built from the runner map so a new runner cannot fall out of the managed group: an entry the
// script generates but does not recognize would be re-appended on every write.
const RUNNERS = [...new Set(Object.values(RUNNER_BY_EXT))].join('|');
const SCRIPT_ENTRY_RE = new RegExp(`^Bash\\((${RUNNERS}) (\\S.*):\\*\\)$`);

// Directories never scanned for scripts.
const SKIP_DIRS = new Set(['node_modules', '.git']);

// Raised when input is invalid; surfaces as exit code 2.
class ConfigError extends Error {}

function printUsage() {
  console.log(
    [
      'Usage: node check-skill-allowlist.mjs [--write] [--repo-root <dir>]',
      '',
      'Reconciles the managed `Skill(<name>)` and `Bash(<runner> <path>:*)` entries in',
      '.claude/settings.json against the repo skills/ folder.',
      '',
      'Options:',
      '  --write             Apply the reconciled allowlist to .claude/settings.json.',
      '  --repo-root <dir>   Override repo root detection (default: git rev-parse --show-toplevel).',
      '                      The --repo-root=<dir> form is also accepted.',
      '  -h, --help          Show this message.',
      '',
      'Exit codes: 0 = in sync or written, 1 = drift detected, 2 = configuration error.',
    ].join('\n'),
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

// Repo-root-relative path with forward slashes, used to build script entries.
function toRelPosix(repoRoot, abs) {
  return relative(repoRoot, abs).split(sep).join('/');
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

// Every immediate `skills/*/SKILL.md` yields one desired `Skill(<name>)` entry.
// Subdirectories without a SKILL.md are skipped.
function collectSkillEntries(skillsDir) {
  const entries = new Set();
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(skillsDir, entry.name, 'SKILL.md');
    if (!existsSync(skillMd)) continue;
    entries.add(`Skill(${readSkillName(skillMd, entry.name)})`);
  }
  return entries;
}

// Recursively collect runnable scripts under `dir`, adding one
// `Bash(<runner> <path>:*)` entry per match.
function walkScripts(dir, repoRoot, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkScripts(abs, repoRoot, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const runner = RUNNER_BY_EXT[extname(entry.name)];
    if (!runner) continue;
    out.add(`Bash(${runner} ${toRelPosix(repoRoot, abs)}:*)`);
  }
}

// Desired script entries, gathered from every skill folder that has a SKILL.md.
function collectScriptEntries(skillsDir, repoRoot) {
  const entries = new Set();
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(skillsDir, entry.name);
    if (!existsSync(join(skillDir, 'SKILL.md'))) continue;
    walkScripts(skillDir, repoRoot, entries);
  }
  return entries;
}

const isSkillEntry = (entry) =>
  typeof entry === 'string' && SKILL_ENTRY_RE.test(entry);

// A managed script entry is a `Bash(<runner> <path>:*)` entry whose path sits under the
// skills directory and whose extension matches the declared runner. Anything else - including
// `Bash(node scripts/other.mjs:*)` outside the skills folder - stays unmanaged.
function makeScriptEntryMatcher(skillsRelDir) {
  const prefix = `${skillsRelDir}/`;
  return (entry) => {
    if (typeof entry !== 'string') return false;
    const match = entry.match(SCRIPT_ENTRY_RE);
    if (!match) return false;
    const [, runner, path] = match;
    if (!path.startsWith(prefix)) return false;
    return RUNNER_BY_EXT[extname(path)] === runner;
  };
}

// Split the allowlist for one managed group into entries already in sync, entries to add, stale
// entries to remove, and duplicate entries to collapse. Duplicates are counted as drift because
// the writer rebuilds the group from a Set and would silently drop the extra copies otherwise.
function bucketGroup(allowlist, desired, isManaged) {
  const inSync = [];
  const toRemove = [];
  const duplicates = [];
  const seen = new Set();
  for (const entry of allowlist) {
    if (!isManaged(entry)) continue;
    if (seen.has(entry)) {
      duplicates.push(entry);
      continue;
    }
    seen.add(entry);
    if (desired.has(entry)) inSync.push(entry);
    else toRemove.push(entry);
  }
  const toAdd = [];
  for (const entry of desired) {
    if (!seen.has(entry)) toAdd.push(entry);
  }
  return { inSync, toAdd, toRemove, duplicates };
}

// Rebuild the allowlist: keep every unmanaged entry in its original position, then append
// the desired script entries and the desired Skill() entries, each sorted case-insensitively.
function reconcileAllowlist(
  allowlist,
  desiredSkills,
  desiredScripts,
  isManagedScript,
) {
  const unmanaged = allowlist.filter(
    (entry) => !isSkillEntry(entry) && !isManagedScript(entry),
  );
  return [
    ...unmanaged,
    ...sortInsensitive(desiredScripts),
    ...sortInsensitive(desiredSkills),
  ];
}

const byNameInsensitive = (a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase());

const sortInsensitive = (entries) =>
  Array.from(entries).sort(byNameInsensitive);

function printList(label, entries, emoji) {
  if (entries.length === 0) return;
  console.log(`${emoji} ${label} (${entries.length}):`);
  for (const entry of sortInsensitive(entries)) {
    console.log(`  - ${entry}`);
  }
  console.log('');
}

function printGroup(title, buckets, staleLabel) {
  console.log(`== ${title} ==`);
  printList('Already in sync', buckets.inSync, '✅');
  printList('To add', buckets.toAdd, '➕');
  printList(staleLabel, buckets.toRemove, '➖');
  printList('To remove (duplicate entry)', buckets.duplicates, '➖');
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

  const skillsRelDir = toRelPosix(repoRoot, skillsDir);
  const isManagedScript = makeScriptEntryMatcher(skillsRelDir);

  const desiredSkills = collectSkillEntries(skillsDir);
  const desiredScripts = collectScriptEntries(skillsDir, repoRoot);

  const allowlist = Array.isArray(settings?.permissions?.allow)
    ? settings.permissions.allow
    : [];
  const otherCount = allowlist.filter(
    (entry) =>
      typeof entry === 'string' &&
      !isSkillEntry(entry) &&
      !isManagedScript(entry),
  ).length;

  const skills = bucketGroup(allowlist, desiredSkills, isSkillEntry);
  const scripts = bucketGroup(allowlist, desiredScripts, isManagedScript);

  console.log(`🔍 settings:           ${settingsPath}`);
  console.log(`🔍 skills_dir:         ${skillsDir}`);
  console.log(`🔍 skills_found:       ${desiredSkills.size}`);
  console.log(`🔍 scripts_found:      ${desiredScripts.size}`);
  console.log(`🔍 other_entries:      ${otherCount}`);
  console.log('');

  printGroup('Skills', skills, 'To remove (skill folder no longer exists)');
  printGroup('Scripts', scripts, 'To remove (script no longer exists)');

  const toAddCount = skills.toAdd.length + scripts.toAdd.length;
  const toRemoveCount =
    skills.toRemove.length +
    skills.duplicates.length +
    scripts.toRemove.length +
    scripts.duplicates.length;

  if (toAddCount + toRemoveCount === 0) {
    console.log(
      `✅ Allowlist already in sync. ${desiredSkills.size} skill(s) and ${desiredScripts.size} script(s) checked.`,
    );
    console.log('result:ok');
    process.exit(0);
  }

  if (!args.write) {
    console.log(
      `⚠️  Drift detected: ${toAddCount} to add, ${toRemoveCount} to remove.`,
    );
    console.log('Re-run with --write to apply the changes.');
    console.log('result:drift');
    process.exit(1);
  }

  if (!settings.permissions || typeof settings.permissions !== 'object') {
    settings.permissions = {};
  }
  settings.permissions.allow = reconcileAllowlist(
    allowlist,
    desiredSkills,
    desiredScripts,
    isManagedScript,
  );
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log(`✅ Written: added ${toAddCount}, removed ${toRemoveCount}.`);
  console.log(`   ${settingsPath}`);
  console.log(`result:written`);
  process.exit(0);
}

main();
