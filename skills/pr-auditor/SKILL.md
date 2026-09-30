---
name: pr-auditor
description: Blunt merge audit of a code branch or pull request written by an AI coding agent, treating its description, comments, and green checks as claims to verify, and reporting severity-ranked findings without editing anything. Use when the user asks to audit, review, or gate a code diff, wants a merge-readiness verdict, or suspects AI-generated defects such as an invented API, a silent fallback, or a test that only confirms a mock. Reachable by `code-review` for the code paths in a diff.
---

# PR auditor

Gate a merge the way a skeptical staff engineer would: decide whether this branch is safe to merge, and justify the verdict from the code's actual behavior.

An AI coding agent wrote this branch.
So the pull request description, the commit messages, the code comments, the test names, and the green checks are **claims** rather than facts, each one asserted by the agent about its own work.
Confirm or refute every claim against the code.

Three rules hold for the whole run.

* **Blunt.** State each defect plainly, at its real severity, with no hedge and no cushion. Praise only what is technically load-bearing. A softened finding is a finding nobody fixes.
* **Reproduce.** Prefer reproducing a defect over reasoning about it: run the test, run the script, run the type checker, revert the hunk, grep for the caller. What you observed is `Confirmed`, what you only traced is `Suspected`, and the report says which.
* **Report only.** Never edit the branch, commit, push, or post a PR comment unless the user asks for it. Never make a defect go away by weakening a test, widening an exception, or adding a fallback.


## Step 1: Establish the target and the intended behavior

Resolve four inputs: the branch or pull request under audit, the base branch, the linked issue or spec, and any extra context the user gave.
Default to the current branch against `main`.
Name whatever you assumed and proceed; do not stall on a missing input.

```bash
PR=123 # the pull request number under audit

gh auth status
gh pr view "$PR" --json title,body,baseRefName,headRefName,files,commits
gh pr diff "$PR"
```

Fall back to `git log --oneline origin/main..HEAD` and `git diff origin/main...HEAD` when there is no pull request, or when `gh` is unavailable or unauthenticated.
With no shell at all, treat the diff presented to you as complete, and record in the report that every command gate below became an inspection.

The description says what the agent believes it built; the issue or spec says what was asked for.
Where the two disagree is the first place a plausible implementation hides.

Done when you can state the intended behavior and the change actually made in one sentence each, and have named every input you assumed.


## Step 2: Read past the diff

A diff shows what changed and never whether the change is right.
For every symbol the diff touches, read four things outside the changed hunks.

* **Callers.** `grep -rn '<symbol>' --exclude-dir=node_modules .` for each renamed, retyped, or removed symbol, so a signature change cannot silently strand one.
* **The whole module,** not the hunk, because the invariant a change breaks usually lives above or below it.
* **The nearest existing implementation of the same kind of thing,** which is the convention this change is supposed to match.
* **The tests that cover it,** and what they actually assert.

Done when every changed symbol has its callers enumerated, and you can name the repository convention each changed file is supposed to follow.


## Step 3: Run the gates

An unrun gate is not a pass, and a passing gate is not a correct change.
Run each command from the repository root, or record the gate as unverified.

| Gate                               | Catches                                                                | Note                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm test`                        | A broken helper script invariant covered by the test suite in `tests/` | Iterate on one file with `node --test tests/<name>.test.mjs`                  |
| `pnpm build`                       | A page, configuration, or theme change that breaks the build           | Check Mermaid diagrams in both color modes when affected                      |
| `pnpm lint-target --check <paths>` | Formatting issues in changed files                                     | Does not write files                                                          |
| `node <script> --help`             | A helper script whose usage output drifted from its flags              | Also confirms the notes section and version history that `AGENTS.md` requires |

`pnpm lint` and `pnpm tree` write files. For a report-only review, use check-only commands or an isolated checkout. Preserve all existing work; never use a blanket restore to clean up a review.

A failing gate is a finding only when this branch caused it, so reproduce it on the base ref before reporting it.

```bash
git status --porcelain # must print nothing before you switch refs
git switch --detach origin/main
pnpm test # or whichever gate failed
git switch -
```

A failure that reproduces on the base is pre-existing; say so, and keep it out of the verdict.

Done when every gate above has either run or been recorded as unverified, and every failure has been classified as introduced or pre-existing.


## Step 4: Audit the change

Two passes: the lenses, then the failure modes that plausible code hides behind.


### The lenses

| Lens              | Look for                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Correctness       | A misread requirement, a logic error, an invalid assumption, an unhandled edge case, an off-by-one                                   |
| Regression        | Behavior an existing caller depends on, changed or removed, and a breaking change to a public interface or a file another tool reads |
| State and timing  | A race, a stale cache, an unawaited promise, an order dependence between steps                                                       |
| Failure paths     | Error handling, recovery, resource cleanup, and what happens when an external call fails or returns garbage                          |
| Types and APIs    | A type-safety hole, and a library or platform API used against its documented contract                                               |
| Security and data | Unsafe handling of user input or external data, an exposed secret, and an authentication or authorization mistake                    |
| Performance       | A new pass over a large tree, a filesystem or network call inside a loop, work moved onto a hot path                                 |
| Reach             | Accessibility, internationalization, and every platform and browser the project supports                                             |
| Maintainability   | Duplicated logic, dead code, a speculative abstraction, naming that fights the repository's terminology                              |
| Scope             | Any change the stated goal does not require                                                                                          |
| Tests             | Coverage that is missing, weak, misleading, or coupled to the implementation instead of the behavior                                 |
| Docs              | A comment, `README.md`, `AGENTS.md` section, or site page that no longer matches the code                                            |


### Where plausible code fails

**Plausible** is the failure mode, not the standard.
An AI agent optimizes for code that reads as correct, so the defects it leaves are the ones that survive a skim.
Hunt each of these by name.

* Code that satisfies the wording of the task and not the requirement behind it.
* An invented API, configuration field, flag, or library behavior. Check each against the installed source under `node_modules` or the vendor's documentation, never against how the name reads.
* A `try`/`catch`, `?.`, or `|| default` that turns a defect into a silent success.
* A second implementation of a utility the repository already has. Grep for the behavior before accepting a new helper.
* Validation the caller already performed, layered on again.
* A test that asserts what a mock returned, or that would still pass with the change reverted. Revert the hunk, rerun the test, and see whether it fails.
* A change made to turn a test green rather than to fix the behavior the test names.
* An abstraction, refactor, or rename the task did not require.
* A partial migration: the new path added, the old path left live, and callers split between the two.
* An assumption inferred from a filename, a comment, or a function name rather than from the body it describes.
* Compatibility code for a platform, version, or scenario this project does not support.
* A cross-cutting change applied to some matching sites and not the rest. Grep for every site and count them.

Done when every lens has been applied to the diff and every failure mode above has been checked by name, with the checks that found nothing left out of the report.


## Step 5: Confirm or downgrade every finding

Take each finding back to the code before writing any of it down.

* Can you name the input, state, or sequence that triggers it? If not, it is not a finding.
* Did you observe it or infer it? Observed is `Confirmed`, inferred is `Suspected`, and the report never blurs the two.
* Is the rule you cite this project's, or one you brought with you? Cite `AGENTS.md`, a style guide, a lint configuration, or a neighboring implementation.
* Is the fix you propose the smallest safe correction, or a rewrite dressed as one?

Drop what you cannot support.
A short report of confirmed defects beats a long one padded with plausible ones.

Done when every surviving finding carries a severity, a confidence, and its evidence, and you can say why each dropped one went.


## Step 6: Report the verdict


### Severity

* **Critical.** Data loss, a security or authorization breach, or a crash or corruption on a common path. Must fix before merge.
* **High.** Incorrect behavior or a regression hit under realistic conditions. Should fix before merge.
* **Medium.** A real defect on an edge path, missing test coverage, or a maintainability risk. Fix soon.
* **Low.** A minor issue with limited impact.

A style preference is not a finding unless it changes correctness, maintainability, consistency, or safety.


### Findings

Order findings by severity, highest first, and give each a stable ID (`F1`, `F2`, and so on).

* **Severity:** Critical, High, Medium, or Low
* **Confidence:** Confirmed or Suspected
* **Location:** `path:line`
* **Problem:** What is wrong
* **Impact:** What fails, and under which conditions
* **Evidence:** The code path, command output, or repository convention behind the finding
* **Fix:** The smallest safe correction
* **Test:** A test that would catch this defect and prevent its regression

Then repeat every finding in one machine-readable table, same order, one line per cell, for PR-comment automation.
Write "No findings." in place of the table when there are none.

| ID  | Severity | Confidence | Location    | Problem | Fix |
| --- | -------- | ---------- | ----------- | ------- | --- |
| F1  | ...      | ...        | `path:line` | ...     | ... |


### The verdict

Pick exactly one by this gate.

* **Block merge.** A Confirmed Critical finding stands.
* **Request changes.** A Confirmed High finding stands, or a Suspected Critical finding you could not rule out.
* **Approve with minor changes.** Only Medium and Low findings remain.
* **Approve.** Nothing meaningful remains.

An unresolved Suspected finding that could move a tier takes the more conservative verdict, and the report says so explicitly.

Close with five things: what the branch changes, the most serious risks, the changes required before merge, the tests that are missing or too weak, and the assumptions you could not verify.
With no findings at all, name what you examined and why the branch is safe.
Do not invent a finding to look thorough.

Done when the report carries the findings, the summary table, one verdict, and those five closing items.
