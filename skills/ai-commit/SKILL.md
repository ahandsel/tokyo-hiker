---
name: ai-commit
description: Auto-gather git changes, confirm scope with the user, and draft a commit title and message following the project commit style guide.
---

# AI commit message drafter

Review git changes, confirm scope with the user, and draft a commit message following the selected commit style guide. This skill supports normal commits, `--head` message-only amend mode, `--commit <hash>` message-only reword mode for a specific commit, and `--auto` no-question drafting.

* If a file named `repo-commit-style-guide.md` exists anywhere in the repository, use it.
* Otherwise, use `skills/ai-commit/default-commit-style-guide.md`.


## Workflow flags


### Default workflow (No flags)

1. **Resolve style guide source.** Detect the repository root (for example, with `git rev-parse --show-toplevel`). Search the repository for a file named `repo-commit-style-guide.md` (for example, with `git ls-files ':(glob)**/repo-commit-style-guide.md'` from the repo root, or `find <repo-root> -name repo-commit-style-guide.md -not -path '*/node_modules/*'`). If exactly one match is found, use it as the source of truth. If multiple matches are found, prefer one at the repo root, then one under `docs/`, then ask the user which to use. If no match is found, use `skills/ai-commit/default-commit-style-guide.md`.
2. **Auto-gather git inputs.** Run `git status`, `git diff`, and `git diff --staged` automatically. Do not ask the user to paste anything.
3. **Present findings, confirm scope, and accept notes.** Show the user a list of changed files and a brief summary of the changes. In the same prompt, ask which files are in-scope for this commit and whether the user has additional context or notes (for example, a related ticket ID or a short explanation of intent). Default if no notes provided: draft from the diff alone. Wait for the user's response before proceeding.
4. **Run linter.** Run `pnpm lint` before drafting the commit message. If the linter reports errors, show the output to the user and fix the issues before proceeding. Do not draft a commit message until the linter passes cleanly.
5. **Draft the commit message.** Based only on the in-scope diffs and any user-provided notes, draft a commit title and message body following the rules below and in the selected style guide source.
6. **Determine single or split commit.** Prefer a single commit unless the evidence clearly supports a logical split into multiple commits with distinct purposes.
7. **Handle ambiguity.** If the in-scope diffs or notes are too ambiguous to write a reliable commit message, ask clarifying questions with 2-3 suggested answers instead of guessing.
8. **Confirm and commit.** Show the drafted commit message to the user. If the user approves, stage the in-scope files and run `git commit` with the approved message. If the user requests changes, revise the message and confirm again before committing.


### `--head` workflow flag

When `--head` is used, the workflow focuses on amending the current `HEAD` commit message without staging any changes or including any unstaged/staged diffs. The steps are:

1. **Resolve style guide source.** Detect the repository root and resolve the style guide source the same way as in the default workflow.
2. **Gather HEAD-only inputs.** Run `git log -1` and `git show --name-status --patch HEAD` to inspect only the current `HEAD` commit.
3. **Present HEAD findings and accept notes.** Show the files and summary from `HEAD` only. Ask for optional context/notes for improving the existing commit message. Do not ask for file scope in this mode.
4. **Skip linter in this mode.** Do not run `pnpm lint` for `--head` because no file content is being committed.
5. **Draft amended commit message.** Base the title/body only on `HEAD` diff content plus user notes.
6. **Single commit only.** `--head` mode always amends exactly one commit (`HEAD`); do not recommend split commits.
7. **Handle ambiguity.** If `HEAD` diff or notes are too ambiguous, ask clarifying questions with 2-3 suggested answers.
8. **Confirm and amend only message.** After approval, run `git commit --amend --only` with the approved message. Never stage files and never include working-tree or staged changes in `HEAD`.


### `--commit <hash>` workflow flag

When `--commit <hash>` is used, the workflow focuses on rewording the message of a specific past commit identified by `<hash>` without staging any changes or including any unstaged/staged diffs. The steps are:

1. **Resolve style guide source.** Detect the repository root and resolve the style guide source the same way as in the default workflow.
2. **Validate the target commit.**
   * Run `git rev-parse --verify <hash>^{commit}` to confirm the commit exists.
   * Run `git merge-base --is-ancestor <hash> HEAD` to confirm the commit is reachable from `HEAD` on the current branch.
   * Run `git rev-list --merges <hash>^..<hash>` (or check `git cat-file -p <hash>` parents) to detect merge commits; if `<hash>` is a merge commit, stop and warn the user instead of rewording.
   * Check that the working tree and index are clean (`git status --porcelain` is empty). If not, stop and ask the user to commit or stash first - a rebase requires a clean tree.
   * Warn the user if the commit has likely been pushed (for example, if `git branch -r --contains <hash>` returns any remote branch). Rewording rewrites history and requires a force-push to update the remote.
   * If `<hash>` resolves to `HEAD`, fall back to the `--head` workflow.
3. **Gather commit-only inputs.** Run `git log -1 <hash>` and `git show --name-status --patch <hash>` to inspect only the target commit. Do not run `git status`, `git diff`, or `git diff --staged`.
4. **Present findings and accept notes.** Show the files and summary from `<hash>` only. Ask for optional context/notes for improving the existing commit message. Do not ask for file scope in this mode.
5. **Skip linter in this mode.** Do not run `pnpm lint` for `--commit` because no file content is being committed.
6. **Draft reworded commit message.** Base the title/body only on `<hash>` diff content plus user notes.
7. **Single commit only.** `--commit` mode always rewords exactly one commit; do not recommend split commits.
8. **Handle ambiguity.** If the commit diff or notes are too ambiguous, ask clarifying questions with 2-3 suggested answers.
9. **Confirm and reword only the message.** After approval, perform a non-interactive reword of the target commit only, leaving its tree contents unchanged. For example, with `HASH` set to the target commit and `MSG_FILE` set to a file containing the approved message:

   ```sh
   GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/reword/'" \
     GIT_EDITOR="cp $MSG_FILE" \
     git rebase -i "$HASH^"
   ```

   Adjust `sed` syntax for the host platform; on macOS BSD `sed`, the `-i.bak` form shown above works. If the target commit has no parent (root commit), use `git rebase -i --root` instead and reword the first entry. Never stage files, never include working-tree or staged changes, and do not modify any other commit's message.

10. **Handle rebase conflicts.** If the rebase encounters conflicts (unlikely for a pure reword but possible if later commits depend on the rewritten commit's hash chain), abort with `git rebase --abort` and report the failure to the user instead of attempting to resolve.


### `--auto` workflow flag

When `--auto` is used, the workflow drafts a commit message without asking any intermediate questions. The user can optionally combine `--auto` with `--head` to amend the `HEAD` commit message, or with `--commit <hash>` to reword a specific past commit's message. The steps are:

1. **No intermediate questions.** Do not ask scope questions, note questions, or clarifying questions before drafting.
2. **Auto scope in default mode.** If `--auto` is used without `--head` or `--commit`, treat all current working-tree changes as in-scope.
3. **HEAD scope in amend mode.** If `--auto` is used with `--head`, use only `HEAD` commit data as in-scope.
4. **Target commit scope in reword mode.** If `--auto` is used with `--commit <hash>`, use only the target commit's data as in-scope. Still run the safety validations from the `--commit <hash>` workflow (commit exists and is reachable, not a merge commit, clean working tree); if any check fails, stop and report the failure instead of rewording.
5. **Confirmation policy.**
   * **Single commit.** Show the draft and proceed directly without asking for confirmation.
   * **Multiple commits (split recommendation).** Show the draft and ask exactly one yes/no confirmation question before committing.
6. **Commit action (default mode).** Run `git add -A`, then create the commit(s) with the drafted message(s). For multiple commits, only proceed after a `yes` confirmation.
7. **Commit action (`--head` mode).** Run `git commit --amend --only` with the drafted message. `--head` is always a single commit, so no confirmation is needed.
8. **Commit action (`--commit <hash>` mode).** Reword only the target commit using the rebase approach described in the `--commit <hash>` workflow. Always a single commit, so no confirmation is needed.
9. **On non-`yes` (multiple commits only).** Do not run git write commands; stop and wait for new instructions.


## Output format

Wrap the entire output in a single fenced code block with the `markdown` language tag so the user can copy it easily.


### Single commit

```markdown
Title: <emoji> <commit title>

Message:

- <main change>
- <supporting change or rationale, if supported>
- <testing details, if supported>
- <risk, migration, or compatibility note, if supported>
```


### Split recommendation

```markdown
Split recommendation:

1. Title: <emoji> <commit title>
   Message:
   - <main change>
   - <supporting change or rationale, if supported>

2. Title: <emoji> <commit title>
   Message:
   - <main change>
   - <supporting change or rationale, if supported>
```


### Clarifying questions

```markdown
Clarifying questions:

1. <question>
   - Option A: <answer>
   - Option B: <answer>
   - Option C: <answer>
```


## Constraints

* Base commit messages only on information from the diff and user-provided notes. Do not invent intent, implementation details, side effects, testing, or risk.
* Do not include speculative claims.
* Do not copy large chunks of the diff verbatim.
* Do not mention that you are an AI.
* Do not include commentary before or after the output.
* If the diff or notes are too ambiguous, ask clarifying questions instead of guessing.
* In `--head` mode, ignore `git status`, `git diff`, and `git diff --staged`; use only `HEAD` commit data.
* In `--head` mode, do not run `git add`, do not stage/unstage files, and do not include any additional files in the amend.
* In `--commit <hash>` mode, ignore `git status`, `git diff`, and `git diff --staged`; use only the target commit's data.
* In `--commit <hash>` mode, do not run `git add`, do not stage/unstage files, do not modify any other commit's message, and do not change any commit's tree contents.
* In `--commit <hash>` mode, require a clean working tree and index before running the rebase. If the working tree is dirty, stop and ask the user to commit or stash first.
* In `--commit <hash>` mode, if `<hash>` resolves to the same commit as `HEAD`, fall back to the `--head` workflow rather than running a rebase.
* In `--auto` mode, ask no intermediate questions. Skip the final confirmation when drafting a single commit; ask exactly one yes/no confirmation only when drafting multiple commits (split recommendation).
* In `--auto` mode without `--head`, run `git add -A` before committing.
* In `--auto --head` mode, do not include additional files and do not stage files. Always a single commit, so no confirmation is asked.
