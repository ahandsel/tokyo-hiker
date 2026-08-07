// General notes:
//   Generates a tree view of the contents/ folder and saves it as a fenced
//   Markdown code block. File enumeration uses `git ls-files --cached --others
//   --exclude-standard`, which honors the repo .gitignore, the global excludes
//   file (core.excludesFile), and .git/info/exclude, so gitignored files are
//   never listed. The top-level .vitepress folder is dropped, because it holds
//   the site configuration rather than published content; entries whose
//   basename is in filesToIgnore are dropped, and symlinks are skipped so a
//   linked directory does not duplicate its target.
//
// Usage:
//   node scripts/generate-site-structure.mjs   Regenerate docs/site-structure.md.
//   node scripts/generate-site-structure.mjs --help   Show this help.
//
// Output:
//   docs/site-structure.md
//
// Version history:
//   * v2.3 - 2026-08-08 - Write to docs/site-structure.md instead of notes/,
//     now that the contents/ rename frees docs/ for repository documentation.
//   * v2.2 - 2026-08-08 - Follow the docs/ to contents/ folder rename.
//   * v2.1 - 2026-08-08 - Adapt for tokyo-hiker: scan docs/ instead of
//     contents/, write to notes/site-structure.md, and replace the top-level
//     allowlist with a .vitepress denylist so new content folders and the
//     top-level pages (about.md, index.md, maps.md) are picked up without
//     editing the script.
//   * v2.0 - 2026-07-30 - Replace tree-extended with a git-driven tree builder
//     (drops the tree-extended dependency, respects global gitignore, and fixes
//     substring-based ignore matching); output is byte-identical to v1.
//   * v1.0 - Generate the tree with the tree-extended package.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, lstatSync } from 'node:fs';
import { resolve, dirname, posix as pathPosix } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `Generate a tree view of the contents/ folder as a fenced Markdown code block.

Usage:
  node scripts/generate-site-structure.mjs          Regenerate docs/site-structure.md.
  node scripts/generate-site-structure.mjs --help   Show this help.

Output:
  docs/site-structure.md`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(HELP);
  process.exit(0);
}

// Resolve repository root from this script location.
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

// Write a generated tree snapshot into the docs/ folder, which holds repository
// documentation and sits outside the published site under contents/.
const outputPath = resolve(repoRoot, 'docs', 'site-structure.md');

// Folder scanned for the tree, and the top-level entries dropped from it.
const scanFolder = 'contents';
const topLevelIgnore = new Set(['.vitepress']);

// Entries to ignore in the generated tree (matched against the basename).
const filesToIgnore = new Set(['temp.md', '.DS_Store']);

// List files git considers tracked or untracked-but-not-ignored under a folder.
// Symlinks are skipped so that linked directories do not duplicate their target.
function listGitFiles(folderPath) {
  const out = execFileSync(
    'git',
    [
      '-C',
      repoRoot,
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      folderPath,
    ],
    { encoding: 'utf8' },
  );
  return out.split('\n').filter((path) => {
    if (!path) return false;
    try {
      return !lstatSync(resolve(repoRoot, path)).isSymbolicLink();
    } catch {
      return false;
    }
  });
}

// Build a nested tree of folders and files from a list of folder-relative paths.
function buildTree(paths) {
  const root = { dirs: new Map(), files: [] };
  for (const path of paths) {
    const parts = path.split('/');
    const fileName = parts.pop();
    if (filesToIgnore.has(fileName)) continue;
    let node = root;
    for (const part of parts) {
      if (filesToIgnore.has(part)) {
        node = null;
        break;
      }
      if (!node.dirs.has(part)) {
        node.dirs.set(part, { name: part, dirs: new Map(), files: [] });
      }
      node = node.dirs.get(part);
    }
    if (node) node.files.push(fileName);
  }
  return root;
}

// Render the tree with the same glyphs the previous tree-extended output used.
function renderTree(node, prefix = '') {
  const lines = [];
  // Sort by code unit (ASCII) so uppercase names sort before lowercase, matching
  // the previous tool's output.
  const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const dirEntries = [...node.dirs.values()].sort((a, b) =>
    byCodeUnit(a.name, b.name),
  );
  const fileEntries = [...node.files].sort(byCodeUnit);
  const total = dirEntries.length + fileEntries.length;
  let i = 0;
  for (const child of dirEntries) {
    const isLast = i === total - 1;
    const connector = isLast ? '└───' : '├───';
    lines.push(`${prefix}${connector}📁 ${child.name}/`);
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');
    lines.push(...renderTree(child, nextPrefix));
    i += 1;
  }
  for (const name of fileEntries) {
    const isLast = i === total - 1;
    const connector = isLast ? '└───' : '├───';
    lines.push(`${prefix}${connector}📄 ${name}`);
    i += 1;
  }
  return lines;
}

let files;
try {
  files = listGitFiles(scanFolder);
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    console.error(
      '❌ git not found in PATH. Install git and rerun "pnpm tree".',
    );
    process.exit(1);
  }
  console.error('❌ Failed to run "git ls-files" for %s.', scanFolder);
  if (error instanceof Error) console.error(error.message);
  process.exit(1);
}

// Re-root paths relative to the scanned folder, then drop the top-level entries
// we do not publish. path.posix keeps '/' separators consistent on Windows.
const reRooted = files
  .map((path) => pathPosix.relative(scanFolder, path))
  .filter((path) => path && !topLevelIgnore.has(path.split('/')[0]));

const body = renderTree(buildTree(reRooted)).join('\n');

if (!body) {
  console.error(
    '❌ No entries found under %s. Skipping file write.',
    scanFolder,
  );
  process.exit(1);
}

// Wrap the tree in a fenced code block so Markdown renders it verbatim.
const codeBlock = `\`\`\`txt\n${body}\n\`\`\``;

// Save the tree output as a Markdown file, creating the docs/ folder if needed.
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `# Site structure\n\n${codeBlock}\n`, 'utf8');
console.log('✅ Wrote %s', outputPath);
