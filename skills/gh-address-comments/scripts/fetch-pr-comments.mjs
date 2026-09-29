#!/usr/bin/env node

// fetch-pr-comments.mjs notes
//
// General notes:
// * Purpose: dump every comment on the pull request for the current git branch as JSON, so a review pass can see the conversation, the review submissions, and the inline threads together.
// * Uses `gh api graphql`, because the inline threads carry the grouping and the `isResolved` and `isOutdated` state that the REST endpoints do not expose. That resolution state is what separates a comment still worth addressing from one already closed out.
// * Requires the GitHub CLI installed and authenticated, and the current branch to have an associated pull request.
//
// Usage:
//   node skills/gh-address-comments/scripts/fetch-pr-comments.mjs
//   node skills/gh-address-comments/scripts/fetch-pr-comments.mjs > pr-comments.json
//   node skills/gh-address-comments/scripts/fetch-pr-comments.mjs --help
//
// Output:
// * A JSON object on stdout with `pull_request`, `conversation_comments`, `reviews`, and `review_threads` keys, indented two spaces.
// * Progress and warning lines go to stderr, so redirecting stdout yields clean JSON.
// * Exits 0 on success, 1 when the fetch fails (not authenticated, no pull request for the branch, GraphQL error), and 2 on an unknown option.
//
// Version history:
// * v1.0 - 2026-08-28 - Initial release. Ports fetch_comments.py to a Node.js ES module and fixes two defects in the original: the pagination loop re-appended the first page of any connection that had already finished, duplicating those comments, and the repository was resolved from the head repository, which is the fork rather than the pull request's own repository on a cross-repository pull request.

import { execFileSync } from 'node:child_process';

const QUERY = `query(
  $owner: String!,
  $repo: String!,
  $number: Int!,
  $commentsCursor: String,
  $reviewsCursor: String,
  $threadsCursor: String
) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      number
      url
      title
      state

      # Top-level "Conversation" comments (issue comments on the PR)
      comments(first: 100, after: $commentsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          body
          createdAt
          updatedAt
          author { login }
        }
      }

      # Review submissions (Approve / Request changes / Comment), with body if present
      reviews(first: 100, after: $reviewsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          state
          body
          submittedAt
          author { login }
        }
      }

      # Inline review threads (grouped), includes resolved state
      reviewThreads(first: 100, after: $threadsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          diffSide
          startLine
          startDiffSide
          originalLine
          originalStartLine
          resolvedBy { login }
          comments(first: 100) {
            nodes {
              id
              body
              createdAt
              updatedAt
              author { login }
            }
          }
        }
      }
    }
  }
}
`;

const HELP = `Fetch every comment on the pull request for the current git branch.

Usage:
  node skills/gh-address-comments/scripts/fetch-pr-comments.mjs [--help]

Emits a JSON object on stdout with these keys:
  pull_request           Number, url, title, state, owner, and repo.
  conversation_comments  Top-level comments on the pull request.
  reviews                Review submissions, with state and body.
  review_threads         Inline threads, each with isResolved, isOutdated,
                         path, line, resolvedBy, and its comments.

Requires the GitHub CLI, authenticated with 'gh auth login', and a pull request
associated with the current branch.

Exit codes:
  0  The JSON was written.
  1  The fetch failed: not authenticated, no pull request, or a GraphQL error.
  2  An unknown option was given.
`;

function fail(code, message) {
  console.error(`❌ ${message}`);
  process.exit(code);
}

function run(args, input) {
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      input,
      stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`gh ${args.join(' ')}\n${stderr}`);
  }
}

function runJson(args, input) {
  const out = run(args, input);
  try {
    return JSON.parse(out);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from 'gh ${args.join(' ')}': ${error.message}\nRaw:\n${out}`,
    );
  }
}

function ensureGhAuthenticated() {
  try {
    run(['auth', 'status']);
  } catch {
    fail(
      1,
      "Not authenticated. Run 'gh auth login' to authenticate the GitHub CLI.",
    );
  }
}

// Resolves the pull request's own repository, which is the base repository.
// The pull request number belongs to the base repository, not to the head
// repository, so a fork's owner and name would look up the wrong repository (or
// none at all) on a cross-repository pull request. The url always names the base.
function resolveCurrentPrRef() {
  let pr;
  try {
    pr = runJson(['pr', 'view', '--json', 'number,url']);
  } catch (error) {
    fail(1, `No pull request found for the current branch.\n${error.message}`);
  }

  const match = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(pr.url ?? '');
  if (!match) {
    fail(
      1,
      `Could not read the owner and repository from the pull request url: ${pr.url}`,
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    number: Number(pr.number ?? match[3]),
  };
}

function graphql({
  owner,
  repo,
  number,
  commentsCursor,
  reviewsCursor,
  threadsCursor,
}) {
  const args = [
    'api',
    'graphql',
    '-F',
    'query=@-',
    '-F',
    `owner=${owner}`,
    '-F',
    `repo=${repo}`,
    '-F',
    `number=${number}`,
  ];

  // Only send a cursor that has a value, so the variable stays null rather than an empty string.
  if (commentsCursor) args.push('-F', `commentsCursor=${commentsCursor}`);
  if (reviewsCursor) args.push('-F', `reviewsCursor=${reviewsCursor}`);
  if (threadsCursor) args.push('-F', `threadsCursor=${threadsCursor}`);

  return runJson(args, QUERY);
}

function fetchAll(ref) {
  const conversationComments = [];
  const reviews = [];
  const reviewThreads = [];

  let commentsCursor = null;
  let reviewsCursor = null;
  let threadsCursor = null;

  // A connection that has run out of pages is marked done. The query always
  // returns its first page when its cursor is null, so without these flags the
  // finished connections would be appended again on every later round.
  let commentsDone = false;
  let reviewsDone = false;
  let threadsDone = false;

  let prMeta = null;

  for (;;) {
    let payload;
    try {
      payload = graphql({
        ...ref,
        commentsCursor,
        reviewsCursor,
        threadsCursor,
      });
    } catch (error) {
      fail(1, error.message);
    }

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      fail(
        1,
        `GitHub GraphQL errors:\n${JSON.stringify(payload.errors, null, 2)}`,
      );
    }

    const pr = payload?.data?.repository?.pullRequest;
    if (!pr) {
      fail(
        1,
        `Pull request ${ref.owner}/${ref.repo}#${ref.number} was not found.`,
      );
    }

    if (prMeta === null) {
      prMeta = {
        number: pr.number,
        url: pr.url,
        title: pr.title,
        state: pr.state,
        owner: ref.owner,
        repo: ref.repo,
      };
    }

    if (!commentsDone) {
      conversationComments.push(...(pr.comments?.nodes ?? []));
      const info = pr.comments?.pageInfo;
      commentsCursor = info?.hasNextPage ? info.endCursor : null;
      commentsDone = !commentsCursor;
    }

    if (!reviewsDone) {
      reviews.push(...(pr.reviews?.nodes ?? []));
      const info = pr.reviews?.pageInfo;
      reviewsCursor = info?.hasNextPage ? info.endCursor : null;
      reviewsDone = !reviewsCursor;
    }

    if (!threadsDone) {
      reviewThreads.push(...(pr.reviewThreads?.nodes ?? []));
      const info = pr.reviewThreads?.pageInfo;
      threadsCursor = info?.hasNextPage ? info.endCursor : null;
      threadsDone = !threadsCursor;
    }

    if (commentsDone && reviewsDone && threadsDone) {
      break;
    }
  }

  return {
    pull_request: prMeta,
    conversation_comments: conversationComments,
    reviews,
    review_threads: reviewThreads,
  };
}

function main() {
  for (const arg of process.argv.slice(2)) {
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(HELP);
      process.exit(0);
    }
    fail(2, `Unknown option: ${arg}. Run with --help for usage.`);
  }

  ensureGhAuthenticated();
  const ref = resolveCurrentPrRef();
  const result = fetchAll(ref);

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  const unresolved = result.review_threads.filter(
    (thread) => !thread.isResolved,
  ).length;
  console.error(
    `✅ ${ref.owner}/${ref.repo}#${ref.number}: ${result.conversation_comments.length} conversation comment(s), ${result.reviews.length} review(s), ${result.review_threads.length} inline thread(s) (${unresolved} unresolved).`,
  );
}

main();
