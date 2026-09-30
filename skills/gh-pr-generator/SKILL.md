---
name: gh-pr-generator
description: Draft a structured pull request body from the branch diff and open the pull request with the gh CLI. Use when a user asks to open, create, raise, or draft a pull request, or to refresh the body of the pull request that is already open for the current branch. Derives published site URLs for changed pages, groups pending tasks, and folds background detail into a collapsed section.
---

# GitHub PR generator skill

Draft a pull request body from the branch diff, then open the pull request with the `gh` CLI.

This skill writes the pull request.
Use [`gh-cli`][gh-cli] for general `gh` command reference, [`gh-address-comments`][gh-address-comments] to work through review feedback, [`gh-fix-ci`][gh-fix-ci] for failing checks, and [`ai-commit`][ai-commit] to write the commits first.


## Prerequisites

* `gh` is installed and authenticated. Verify with `gh auth status`, and ask the user to run `gh auth login` if it fails.
* The current branch is not the default branch. If it is, stop and ask the user to create a feature branch first.
* Every change the pull request should contain is committed. Uncommitted work is invisible to the diff, so offer `ai-commit` if the tree is dirty.


## Workflow flags


### Default workflow (no flags)

1. **Verify the environment.** Run `gh auth status`, `git branch --show-current`, and `git status --porcelain`. Stop on a failed check rather than guessing.
2. **Push the branch if needed.** Compare the branch with its upstream using `git rev-list --left-right --count @{u}...HEAD`. If the branch has no upstream or is ahead, tell the user what will be pushed and ask before running `git push`.
3. **Gather branch context.** Determine the merge base with `git merge-base main HEAD`, then collect the commit list with `git log --oneline <base>..HEAD` and the changed files with `git diff --name-status <base>..HEAD`.
4. **Classify the pull request.** Decide whether it is a content change under `contents/`, a tooling or script change, a configuration change, or a mix. The classification selects which conditional sections apply.
5. **Run the pre-flight checks.** See the "Pre-flight checks" section. Report failures to the user and fix them before drafting.
6. **Confirm scope and collect notes.** Show the commits, the changed files, and the derived page URLs. In the same prompt, ask for the pull request title, any open questions, and anything the diff cannot reveal, such as the reason a section is out of scope. Wait for the response.
7. **Draft the body.** Follow the "Pull request body structure" section. Include a conditional section only when the branch supplies evidence for it.
8. **Confirm the draft.** Show the full title and body. Revise on request, and confirm again before opening.
9. **Open the pull request.** Write the body to a temporary file and run `gh pr create --title "<title>" --body-file <file> --base main`. Never pass a long body through `--body` on the command line.
10. **Report the result.** Give the user the pull request URL, and note that `.github/workflows/pr-linter.yaml` runs on non-draft pull requests.


### `--auto` workflow flag

1. **No intermediate questions.** Do not ask about scope, notes, or ambiguity before drafting.
2. **Infer the title.** Use the branch's single commit title when there is exactly one commit, otherwise summarize the commits in the repository commit style, including the leading emoji.
3. **Push without asking** when the branch is ahead of or missing its upstream.
4. **Still run the pre-flight checks.** Stop and report if any check fails; do not open a pull request on a red branch.
5. **Skip the draft confirmation** and open the pull request directly.
6. **Leave a placeholder** in the form `<!-- TODO: confirm -->` wherever a required section needs a human answer that the diff cannot supply, and list every placeholder in the final report.


### `--update` workflow flag

Refresh the body of the pull request that is already open for the current branch instead of opening a new one.
Use this after pushing commits that make the existing body stale.

1. **Find the pull request** with `gh pr view --json number,title,body,url`. Stop if the branch has no open pull request.
2. **Read the existing body** and preserve every human edit, including checkbox states, reviewer notes, and added sections. This is an edit, not a regeneration.
3. **Recompute the changed files, the page URLs, and the checks** from the current branch state.
4. **Show a before-and-after diff of the body** and confirm before writing, unless `--auto` is also present.
5. **Write the update** with `gh pr edit <number> --body-file <file>`.

Do not tick a checkbox on the user's behalf.
Task state belongs to the reviewers.


### `--draft` workflow flag

Add `--draft` to `gh pr create` so the pull request opens as a draft.


## Pull request body structure

Two sections are always present.
Every other section appears only when the branch supplies evidence for it.
An empty ceremonial section is worse than an absent one.


### Required sections

**Opening summary.**
One or two lines naming what the pull request contains and what is being asked of the reader.
Lead with a `> [!IMPORTANT]` callout above the summary when something must happen before merge.

**Pending tasks.**
Checkboxes for the work that remains.
Group them under audience headings only when more than one kind of reader has tasks; otherwise keep a single flat list.


### Conditional sections

| Section                    | Include it when                                                                                                      | Purpose                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Published URL table        | The pull request adds or changes any page under `contents/`                                                          | Gives reviewers the page's published address. Useful for reviewing published content.   |
| "Read the rendered page"   | The changed pages use alerts, frontmatter interpolation, or Vue components                                           | Names the reason the diff misrepresents the page; point the reviewer at `pnpm preview`. |
| Files changed              | The pull request touches more than about three files, or a file's role is not obvious from its path                  | Explains what each file is for, not that it changed.                                    |
| Why the diff looks unusual | The diff misrepresents the work, for example a rewrite that reads as a large addition because a stub already existed | Prevents a reviewer from misreading the change size.                                    |
| What to look at            | The pull request wants review of specific decisions rather than a general pass                                       | Directs attention to the parts where the author is unsure.                              |
| Out of scope               | Related work was deliberately deferred, or a sibling pull request covers part of it                                  | Stops reviewers from filing what the author already knows.                              |
| Checks                     | Any validation ran                                                                                                   | Records what passed. Name the commands and their results.                               |

Put "Files changed" and everything after it inside a collapsed block so the top of the body stays short:

```markdown
<details>
<summary>Additional information</summary>

### Files changed

...

</details>
```


### Body skeleton

Adapt this to the pull request.
Drop any section the table above does not justify.

```markdown
> [!IMPORTANT]
> <blocker that must be resolved before merge>

<one or two lines: what this contains and what is being asked for>

| Page     | Published URL (after merge) |
| -------- | --------------------------- |
| English  | <published URL>             |
| Japanese | <published URL>             |

## Pending tasks

- [ ] <task that remains, and where it is tracked>

<details>
<summary>Additional information</summary>

### Files changed

| File     | Change                                  |
| -------- | --------------------------------------- |
| `<path>` | <role of the file in this pull request> |

### What to look at

- <decision the author wants checked>

### Out of scope

- <deferred work, and the pull request or issue that covers it>

### Checks

<commands run and their results>

</details>
```


## Published URLs

There is no pull request preview deployment.
`.github/workflows/deploy.yaml` publishes the site from `main`, so a changed page goes live at its published URL only after merge; say so in the table header.
For a local preview, the reviewer can run `pnpm preview`.

Derive published URLs from changed Markdown pages under `contents/`, using `https://ahandsel.github.io/tokyo-hiker/` as the base and checking `contents/.vitepress/config.mts` for routing changes:

* `contents/level-1/otama-walking-trail.md` maps to `https://ahandsel.github.io/tokyo-hiker/level-1/otama-walking-trail.html`.
* An `index.md` maps to its folder root.
* Japanese pages retain their `.ja` suffix before `.html`.
* Snippets, assets, and VitePress configuration files are not standalone pages.


## Pre-flight checks

Run these before drafting, and report the results in the "Checks" section of the body:

* Run `pnpm lint`, `pnpm test`, and `pnpm lint-naming`. Run `pnpm build` for site changes and `pnpm lint-includes` for include changes.
* `pnpm tree` when the pull request adds, removes, renames, or moves pages. Commit the regenerated `docs/site-structure.md`.
* `node skills/skill-allowlist-syncer/scripts/check-skill-allowlist.mjs` when the pull request adds, renames, or removes a skill.

Report a failure to the user with the command output.
Do not open a pull request that fails its own checks, and do not describe a check as passing unless it ran.


## Output format

Wrap the drafted pull request in a single fenced code block with the `markdown` language tag so the user can copy it.

```markdown
Title: <emoji> <pull request title>

Body:

<the drafted body>
```


## Constraints

* Never add a "Generated with Claude Code" trailer, an AI attribution line, or any similar footer to the pull request body.
* Base the body only on the diff, the commit messages, the check output, and notes the user supplies. Do not invent intent, testing, risk, or review findings.
* Do not claim a check passed unless it ran in this session.
* Do not tick a checkbox for a reviewer, and do not remove a reviewer's edits when running `--update`.
* Follow the repository writing rules in `AGENTS.md`: a plain hyphen rather than an en dash or em dash, one sentence per source line, and sentence case headings.
* Use the repository commit style guide at `skills/ai-commit/default-commit-style-guide.md` for the pull request title, including the leading emoji.
* Do not paste large chunks of the diff into the body. Describe the change instead.
* Keep the collapsed section collapsed. The top of the body is for the summary, the published URLs, and the tasks.

<!-- Internal links -->

[ai-commit]: ../ai-commit/SKILL.md
[gh-address-comments]: ../gh-address-comments/SKILL.md
[gh-cli]: ../gh-cli/SKILL.md
[gh-fix-ci]: ../gh-fix-ci/SKILL.md
