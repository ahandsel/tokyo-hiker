#!/usr/bin/env node

// get-pr-comments.mjs notes
// General notes:
// * Purpose: Fetch all comments from a GitHub PR (reviews, inline review comments, and issue comments) and emit a consolidated report.
// * Uses the GitHub CLI (`gh`), which handles authentication. Requires `gh` installed and authenticated, and (when only a PR number is given) the current working directory to be inside a clone of the target repo.
// Usage:
//   node skills/gh-pr-reporter/scripts/get-pr-comments.mjs <pr-ref> [options]
//   <pr-ref>: a PR number (498), URL (https://github.com/owner/repo/pull/498), or owner/repo#number.
// Output:
// * Markdown report on stdout by default; pass `--json` to emit a JSON object with `pr`, `reviews`, `reviewComments`, and `issueComments` fields instead.
// * Exit codes: 0 success, 1 fetch failure (auth, network, PR not found), 2 invalid arguments.
// Version history:
// * v1.0 - 2026-06-04 - Initial release.

import { execFileSync } from 'node:child_process';

function printUsage() {
  console.log(`Usage: node get-pr-comments.mjs <pr-ref> [options]

Fetch all comments from a GitHub PR (reviews, inline review comments, and issue
comments) and emit a consolidated report.

<pr-ref>
  A PR identifier in any of these forms:
    - Number only:        498
    - Owner/repo + #:     owner/example-repo#498
    - GitHub URL:         https://github.com/owner/example-repo/pull/498

  When only a number is given, the script reads the repo from "gh repo view".

Options:
  --repo <owner/repo>  Override the repo (useful when <pr-ref> is a bare number
                       and the current directory is not a clone of the target repo).
  --json               Print raw data as JSON instead of a Markdown report.
  --help, -h           Show this message.

Exit codes:
  0  Success.
  1  Fetch failure (auth, network, PR not found).
  2  Invalid arguments.
`);
}

function fail(code, message) {
  console.error(`❌ ${message}`);
  process.exit(code);
}

function run(cmd, args) {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    const stderr = err.stderr ? String(err.stderr).trim() : err.message;
    throw new Error(`${cmd} ${args.join(' ')}\n${stderr}`);
  }
}

function parsePrRef(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // URL form: https://github.com/owner/repo/pull/123 (also accept /issues/123)
  const urlMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:pull|issues)\/(\d+)/,
  );
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
      number: Number(urlMatch[3]),
    };
  }

  // Owner/repo#number form
  const refMatch = trimmed.match(/^([^/\s]+)\/([^/#\s]+)#(\d+)$/);
  if (refMatch) {
    return {
      owner: refMatch[1],
      repo: refMatch[2],
      number: Number(refMatch[3]),
    };
  }

  // Number-only form (or "#123")
  const numMatch = trimmed.match(/^#?(\d+)$/);
  if (numMatch) {
    return { owner: null, repo: null, number: Number(numMatch[1]) };
  }

  return null;
}

function resolveRepo(prRef, repoOverride) {
  if (repoOverride) {
    const parts = repoOverride.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      fail(
        2,
        `Invalid --repo value: "${repoOverride}". Expected "owner/repo".`,
      );
    }
    return { owner: parts[0], repo: parts[1], number: prRef.number };
  }

  if (prRef.owner && prRef.repo) return prRef;

  // Resolve from current working directory.
  let nameWithOwner;
  try {
    nameWithOwner = run('gh', [
      'repo',
      'view',
      '--json',
      'nameWithOwner',
      '-q',
      '.nameWithOwner',
    ]).trim();
  } catch (err) {
    fail(
      1,
      `Could not determine the repo for PR #${prRef.number}. Pass --repo <owner/repo> or run inside the target repo.\n${err.message}`,
    );
  }
  const [owner, repo] = nameWithOwner.split('/');
  return { owner, repo, number: prRef.number };
}

function ghApiPaginatedArray(path) {
  // `gh api --paginate` concatenates JSON arrays per page. Try to parse as a single JSON value
  // first; if multiple pages were concatenated, splice "][" boundaries with commas.
  const url = path.includes('?')
    ? `${path}&per_page=100`
    : `${path}?per_page=100`;
  const out = run('gh', ['api', '--paginate', url]);
  const text = out.trim();
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    const fixed = text.replace(/\]\s*\[/g, ',');
    return JSON.parse(fixed);
  }
}

function ghApiObject(path) {
  return JSON.parse(run('gh', ['api', path]));
}

function fetchAll(ref) {
  const base = `repos/${ref.owner}/${ref.repo}`;
  const pr = ghApiObject(`${base}/pulls/${ref.number}`);
  const reviews = ghApiPaginatedArray(`${base}/pulls/${ref.number}/reviews`);
  const reviewComments = ghApiPaginatedArray(
    `${base}/pulls/${ref.number}/comments`,
  );
  const issueComments = ghApiPaginatedArray(
    `${base}/issues/${ref.number}/comments`,
  );
  return { pr, reviews, reviewComments, issueComments };
}

function formatTimestamp(iso) {
  if (!iso) return '';
  return iso.replace(/\.\d+Z$/, 'Z');
}

function quoteBody(body) {
  if (!body) return '> _(no body)_';
  const lines = String(body).trim().split(/\r?\n/);
  return lines.map((line) => (line ? `> ${line}` : '>')).join('\n');
}

function authorOf(entry) {
  if (entry && entry.user && entry.user.login) return `@${entry.user.login}`;
  return '@ghost';
}

function buildMarkdown(data) {
  const { pr, reviews, reviewComments, issueComments } = data;
  const lines = [];

  lines.push(`# PR comment report`);
  lines.push('');
  lines.push(`**PR:** [#${pr.number} ${pr.title}](${pr.html_url})`);
  lines.push(
    `**Author:** @${pr.user && pr.user.login ? pr.user.login : 'ghost'}`,
  );
  const stateLabel = pr.merged ? 'merged' : pr.draft ? 'draft' : pr.state;
  lines.push(`**State:** ${stateLabel}`);
  lines.push(
    `**Branch:** \`${pr.head && pr.head.ref}\` → \`${pr.base && pr.base.ref}\``,
  );
  lines.push(`**Updated:** ${formatTimestamp(pr.updated_at)}`);
  lines.push(
    `**Counts:** ${reviews.length} review${reviews.length === 1 ? '' : 's'}, ${reviewComments.length} inline comment${reviewComments.length === 1 ? '' : 's'}, ${issueComments.length} issue comment${issueComments.length === 1 ? '' : 's'}`,
  );
  lines.push('');

  // Reviews (with non-empty bodies or non-trivial state).
  const reviewsSorted = [...reviews].sort((a, b) =>
    String(a.submitted_at).localeCompare(String(b.submitted_at)),
  );
  lines.push(`## Reviews`);
  lines.push('');
  if (reviewsSorted.length === 0) {
    lines.push(`_No reviews yet._`);
    lines.push('');
  } else {
    for (const r of reviewsSorted) {
      const state = r.state || 'COMMENTED';
      lines.push(
        `### ${authorOf(r)} - ${state} - ${formatTimestamp(r.submitted_at)}`,
      );
      lines.push('');
      lines.push(`Link: ${r.html_url}`);
      lines.push('');
      lines.push(quoteBody(r.body));
      lines.push('');
    }
  }

  // Inline review comments grouped by file, threaded by in_reply_to_id.
  lines.push(`## Inline review comments`);
  lines.push('');
  if (reviewComments.length === 0) {
    lines.push(`_No inline comments._`);
    lines.push('');
  } else {
    const byFile = new Map();
    for (const c of reviewComments) {
      const path = c.path || '(unknown file)';
      if (!byFile.has(path)) byFile.set(path, []);
      byFile.get(path).push(c);
    }

    const sortedPaths = [...byFile.keys()].sort();
    for (const path of sortedPaths) {
      const comments = byFile.get(path);
      const byId = new Map(comments.map((c) => [c.id, c]));
      const replies = new Map();
      const roots = [];
      for (const c of comments) {
        if (c.in_reply_to_id && byId.has(c.in_reply_to_id)) {
          if (!replies.has(c.in_reply_to_id)) replies.set(c.in_reply_to_id, []);
          replies.get(c.in_reply_to_id).push(c);
        } else {
          roots.push(c);
        }
      }
      roots.sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at)),
      );

      lines.push(
        `### \`${path}\` (${comments.length} comment${comments.length === 1 ? '' : 's'})`,
      );
      lines.push('');

      for (const root of roots) {
        const line = root.line != null ? root.line : root.original_line;
        const startLine =
          root.start_line != null ? root.start_line : root.original_start_line;
        const lineLabel =
          startLine != null && startLine !== line
            ? `Lines ${startLine}-${line}`
            : `Line ${line}`;
        lines.push(`#### ${lineLabel}`);
        lines.push('');
        lines.push(
          `${authorOf(root)} at ${formatTimestamp(root.created_at)} ([link](${root.html_url}))`,
        );
        lines.push('');
        lines.push(quoteBody(root.body));
        lines.push('');

        const thread = (replies.get(root.id) || []).sort((a, b) =>
          String(a.created_at).localeCompare(String(b.created_at)),
        );
        for (const reply of thread) {
          lines.push(
            `${authorOf(reply)} at ${formatTimestamp(reply.created_at)} - reply ([link](${reply.html_url}))`,
          );
          lines.push('');
          lines.push(quoteBody(reply.body));
          lines.push('');
        }
      }
    }
  }

  // Issue comments (general PR discussion).
  lines.push(`## General comments`);
  lines.push('');
  if (issueComments.length === 0) {
    lines.push(`_No general comments._`);
    lines.push('');
  } else {
    const issueSorted = [...issueComments].sort((a, b) =>
      String(a.created_at).localeCompare(String(b.created_at)),
    );
    for (const c of issueSorted) {
      lines.push(`### ${authorOf(c)} at ${formatTimestamp(c.created_at)}`);
      lines.push('');
      lines.push(`Link: ${c.html_url}`);
      lines.push('');
      lines.push(quoteBody(c.body));
      lines.push('');
    }
  }

  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { prRef: null, repo: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      printUsage();
      process.exit(0);
    } else if (a === '--json') {
      args.json = true;
    } else if (a === '--repo') {
      args.repo = argv[++i];
      if (!args.repo) fail(2, '--repo requires a value.');
    } else if (a.startsWith('--repo=')) {
      args.repo = a.slice('--repo='.length);
    } else if (a.startsWith('-')) {
      fail(2, `Unknown option: ${a}`);
    } else if (args.prRef == null) {
      args.prRef = a;
    } else {
      fail(2, `Unexpected positional argument: ${a}`);
    }
  }
  return args;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    printUsage();
    process.exit(2);
  }

  const args = parseArgs(argv);
  if (!args.prRef) fail(2, 'Missing required <pr-ref> argument.');

  const parsed = parsePrRef(args.prRef);
  if (!parsed)
    fail(
      2,
      `Could not parse PR reference: "${args.prRef}". Expected a number, "owner/repo#n", or a github.com URL.`,
    );

  const ref = resolveRepo(parsed, args.repo);

  let data;
  try {
    data = fetchAll(ref);
  } catch (err) {
    fail(1, `Failed to fetch PR data from GitHub.\n${err.message}`);
  }

  if (args.json) {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${buildMarkdown(data)}\n`);
  const total =
    data.reviews.length +
    data.reviewComments.length +
    data.issueComments.length;
  console.error(
    `✅ Fetched ${data.reviews.length} review(s), ${data.reviewComments.length} inline comment(s), ${data.issueComments.length} issue comment(s) for ${ref.owner}/${ref.repo}#${ref.number} (${total} total).`,
  );
}

main();
