#!/usr/bin/env node

// fetch-issue.mjs notes
// General notes:
// * Purpose: Resolve a GitHub issue reference, fetch the issue via `gh`, extract linked spec issues, Figma URLs, and other linked URLs from the body, and emit a structured JSON object that the gh-issue-to-task skill uses to scaffold a tasks/ Markdown file.
// * Uses the GitHub CLI (`gh`), which handles authentication. Requires `gh` installed and authenticated, and (when only an issue number is given) the current working directory to be inside a clone of the target repo.
// * Does NOT write any files. Stdout is JSON; one-line success summary goes to stderr.
// Usage:
//   node skills/gh-issue-to-task/scripts/fetch-issue.mjs <issue-ref> [options]
//   <issue-ref>: an issue number (494), URL (https://github.com/owner/repo/issues/494), or owner/repo#number.
// Options:
//   --repo <owner/repo>   Override the repo when <issue-ref> is a bare number.
//   --enrich              Also fetch the body of every linked GitHub issue (cross-repo OK) so the skill can include a Spec details section. Linked file URLs (`/blob/...`) are listed but not fetched.
//   --help, -h            Show this message.
// Output:
// * JSON object on stdout with shape:
//     {
//       issue:    { owner, repo, number, url, title, body, labels, assignees, state },
//       linkedIssues: [ { ref, owner, repo, number, url, title?, body?, error? } ],
//       linkedFiles:  [ { url, owner, repo, ref, path } ],
//       figmaLinks:   [ { url, fileKey?, nodeId? } ],
//       otherLinks:   [ { url } ]
//     }
// * Exit codes: 0 success, 1 fetch failure (auth, network, issue not found), 2 invalid arguments.
// Version history:
// * v1.0 - 2026-06-08 - Initial release.

import { execFileSync } from 'node:child_process';

function printUsage() {
  console.log(`Usage: node fetch-issue.mjs <issue-ref> [options]

Resolve a GitHub issue reference, fetch the issue via gh, extract linked spec
issues, Figma URLs, and other linked URLs from the body, and emit a structured
JSON object on stdout.

<issue-ref>
  An issue identifier in any of these forms:
    - Number only:      494
    - Owner/repo + #:   owner/example-repo#494
    - GitHub URL:       https://github.com/owner/example-repo/issues/494

  When only a number is given, the script reads the repo from "gh repo view".

Options:
  --repo <owner/repo>  Override the repo (useful when <issue-ref> is a bare
                       number and the current directory is not a clone of the
                       target repo).
  --enrich             Also fetch the body of every linked GitHub issue
                       (cross-repo OK) so the caller can populate a Spec
                       details section. Linked file URLs (/blob/...) are
                       listed but not fetched.
  --help, -h           Show this message.

Exit codes:
  0  Success.
  1  Fetch failure (auth, network, issue not found).
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
    const stderr = err.stderr ? err.stderr.toString() : '';
    throw new Error(
      `Command failed: ${cmd} ${args.join(' ')}\n${stderr}`.trim(),
    );
  }
}

function parseArgs(argv) {
  const args = { ref: null, repo: null, enrich: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      printUsage();
      process.exit(0);
    } else if (a === '--repo') {
      args.repo = argv[++i];
      if (!args.repo)
        fail(
          2,
          '--repo requires a value (e.g. --repo owner/example-repo).',
        );
    } else if (a === '--enrich') {
      args.enrich = true;
    } else if (a.startsWith('-')) {
      fail(2, `Unknown option: ${a}`);
    } else if (!args.ref) {
      args.ref = a;
    } else {
      fail(2, `Unexpected positional argument: ${a}`);
    }
  }
  if (!args.ref) fail(2, 'Missing <issue-ref>. Run with --help for usage.');
  return args;
}

function resolveRef(rawRef, repoOverride) {
  // URL form: https://github.com/<owner>/<repo>/issues/<n>
  const urlMatch = rawRef.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/i,
  );
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
      number: Number(urlMatch[3]),
    };
  }
  // owner/repo#number form
  const refMatch = rawRef.match(/^([^/\s]+)\/([^/#\s]+)#(\d+)$/);
  if (refMatch) {
    return {
      owner: refMatch[1],
      repo: refMatch[2],
      number: Number(refMatch[3]),
    };
  }
  // Bare number form. Need a repo from --repo or `gh repo view`.
  const numMatch = rawRef.match(/^#?(\d+)$/);
  if (numMatch) {
    const number = Number(numMatch[1]);
    if (repoOverride) {
      const [owner, repo] = repoOverride.split('/');
      if (!owner || !repo)
        fail(2, `--repo must be owner/repo, got: ${repoOverride}`);
      return { owner, repo, number };
    }
    let viewJson;
    try {
      viewJson = run('gh', ['repo', 'view', '--json', 'owner,name']);
    } catch (err) {
      fail(
        1,
        `Cannot resolve the repo for bare issue number ${number}.\nRun the script from inside a clone of the target repo, or pass --repo owner/repo.\n${err.message}`,
      );
    }
    const parsed = JSON.parse(viewJson);
    return { owner: parsed.owner.login, repo: parsed.name, number };
  }
  fail(
    2,
    `Could not parse issue ref: "${rawRef}". Expected a number, owner/repo#n, or a github.com URL.`,
  );
}

function fetchIssue({ owner, repo, number }) {
  let raw;
  try {
    raw = run('gh', [
      'issue',
      'view',
      String(number),
      '--repo',
      `${owner}/${repo}`,
      '--json',
      'title,body,url,number,labels,assignees,state',
    ]);
  } catch (err) {
    fail(1, `Failed to fetch ${owner}/${repo}#${number}.\n${err.message}`);
  }
  const data = JSON.parse(raw);
  return {
    owner,
    repo,
    number: data.number,
    url: data.url,
    title: data.title,
    body: data.body || '',
    state: data.state,
    labels: (data.labels || []).map((l) => l.name),
    assignees: (data.assignees || []).map((a) => a.login),
  };
}

function extractLinks(body) {
  // URL pattern: capture URLs that are bare or inside Markdown link parentheses.
  // We use a permissive scanner and then categorize.
  const urlRegex = /https?:\/\/[^\s)<>\]]+/g;
  const seen = new Set();
  const urls = [];
  let match;
  while ((match = urlRegex.exec(body)) !== null) {
    // Strip trailing punctuation that is unlikely to be part of the URL.
    let url = match[0].replace(/[),.;:!?]+$/, '');
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  const linkedIssues = [];
  const linkedFiles = [];
  const figmaLinks = [];
  const otherLinks = [];

  for (const url of urls) {
    const issueMatch = url.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/i,
    );
    if (issueMatch) {
      linkedIssues.push({
        ref: `${issueMatch[1]}/${issueMatch[2]}#${issueMatch[3]}`,
        owner: issueMatch[1],
        repo: issueMatch[2],
        number: Number(issueMatch[3]),
        url,
      });
      continue;
    }
    const blobMatch = url.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i,
    );
    if (blobMatch) {
      linkedFiles.push({
        url,
        owner: blobMatch[1],
        repo: blobMatch[2],
        ref: blobMatch[3],
        path: blobMatch[4],
      });
      continue;
    }
    const figmaMatch = url.match(
      /^https?:\/\/(?:www\.)?figma\.com\/(?:design|file|board|deck|proto)\/([^/?]+)(?:\/[^?]*)?(?:\?.*)?$/i,
    );
    if (figmaMatch) {
      const entry = { url, fileKey: figmaMatch[1] };
      const nodeMatch = url.match(/[?&]node-id=([^&]+)/i);
      if (nodeMatch)
        entry.nodeId = decodeURIComponent(nodeMatch[1]).replace(/-/g, ':');
      figmaLinks.push(entry);
      continue;
    }
    otherLinks.push({ url });
  }

  // De-duplicate linked issues by full ref (an issue may appear multiple times in the body).
  const dedupeIssues = [];
  const issueSeen = new Set();
  for (const i of linkedIssues) {
    if (issueSeen.has(i.ref)) continue;
    issueSeen.add(i.ref);
    dedupeIssues.push(i);
  }

  return { linkedIssues: dedupeIssues, linkedFiles, figmaLinks, otherLinks };
}

function enrichLinkedIssues(linkedIssues, primary) {
  const enriched = [];
  for (const item of linkedIssues) {
    if (
      item.owner === primary.owner &&
      item.repo === primary.repo &&
      item.number === primary.number
    ) {
      // Skip self-references.
      continue;
    }
    try {
      const raw = run('gh', [
        'issue',
        'view',
        String(item.number),
        '--repo',
        `${item.owner}/${item.repo}`,
        '--json',
        'title,body,url,number,state',
      ]);
      const data = JSON.parse(raw);
      enriched.push({
        ...item,
        title: data.title,
        body: data.body || '',
        state: data.state,
      });
    } catch (err) {
      const message = err.message || String(err);
      enriched.push({ ...item, error: message.split('\n')[0] });
    }
  }
  return enriched;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const resolved = resolveRef(args.ref, args.repo);
  const issue = fetchIssue(resolved);
  const links = extractLinks(issue.body);
  const linkedIssues = args.enrich
    ? enrichLinkedIssues(links.linkedIssues, resolved)
    : links.linkedIssues;
  const out = {
    issue,
    linkedIssues,
    linkedFiles: links.linkedFiles,
    figmaLinks: links.figmaLinks,
    otherLinks: links.otherLinks,
  };
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  const enrichedNote = args.enrich
    ? `, enriched ${linkedIssues.filter((i) => i.title).length} linked issue(s)`
    : '';
  console.error(
    `✅ Fetched ${resolved.owner}/${resolved.repo}#${resolved.number} (${links.linkedIssues.length} linked issue(s), ${links.figmaLinks.length} Figma link(s)${enrichedNote}).`,
  );
}

main();
