---
name: gh-cli
description: Interact with GitHub repositories using the GitHub CLI (gh). Covers pull requests, issues, releases, workflow runs, and branch operations. Supports beginner and intermediate tracks, write-operation confirmation, and an --auto flag to skip prompts.
---

# GitHub CLI skill

Use the `gh` CLI to read and write GitHub data for the repository in the current working directory.


## Choose your track

| Track        | You should pick this if...                                        |
| ------------ | ----------------------------------------------------------------- |
| Beginner     | You have never used `gh` or need setup help                       |
| Intermediate | `gh` is installed and authenticated; you want a command reference |


## Prerequisites

* `gh` CLI installed (see Beginner Track for instructions)
* Authenticated via `gh auth login`
* Current working directory is inside a cloned GitHub repository, or run `gh repo set-default` to set one

---


## Beginner Track


### 1 Installation


#### macOS

```bash
brew install gh
```


#### Linux (Debian / Ubuntu)

```bash
(type -p wget > /dev/null || sudo apt-get install wget -y) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y
```


#### Windows (WSL)

Inside your WSL terminal, follow the Linux instructions above.

Verify the install:

```bash
gh --version
```

Expected output (version number may differ):

```text
gh version 2.x.x (2025-xx-xx)
```


### 2 Authentication

Run:

```bash
gh auth login
```

The CLI walks you through an interactive prompt:

1. Select **GitHub.com** (or GitHub Enterprise if applicable).
2. Choose your preferred protocol - **HTTPS** is simplest.
3. Authenticate via **browser** (recommended) or paste a personal access token.

Expected output on success:

```text
✓ Logged in as your-username
```


### 3 Environment verification

Check auth status:

```bash
gh auth status
```

Expected output:

```text
github.com
  ✓ Logged in to github.com account your-username (keyring)
  - Active account: true
```

If the current directory is not inside a cloned repo, set a default:

```bash
gh repo set-default
```

This prompts you to pick from your repositories.


### 4 Command guide


#### Repository and branch operations

**Pull the latest commits on the current branch**

`git pull` is the standard way to pull commits, but to stay within `gh` you can sync:

```bash
gh repo sync
```

This fetches and fast-forwards the current branch from its upstream. If you need to pull a specific branch like `main`:

```bash
git switch main && gh repo sync
```

**View recent commit history**

`gh` does not have a dedicated log command, so use the API:

```bash
gh api repos/{owner}/{repo}/commits --jq '.[] | "\(.commit.author.date) \(.commit.author.name) \(.commit.message | split("\n") | .[0])"' | head -10
```

This prints the 10 most recent commits with date, author, and first line of the message.


#### Pull requests

**List open pull requests**

```bash
gh pr list
```

Expected output:

```text
Showing 3 of 3 open pull requests in owner/repo

ID    TITLE                  BRANCH           CREATED AT
#12   Fix login bug          fix/login        about 2 hours ago
#11   Add dark mode          feature/dark     about 1 day ago
#10   Update README          docs/readme      about 3 days ago
```

**View all comments on a PR**

```bash
gh pr view 12 --comments
```

This prints the PR description followed by every comment, with author and timestamp.

**Check out a PR locally**

```bash
gh pr checkout 12
```

This creates a local branch tracking the PR and switches to it.


#### Issues

**List open issues**

```bash
gh issue list
```

Add `--label bug` or `--assignee @me` to filter.

Expected output:

```text
Showing 5 of 5 open issues in owner/repo

ID    TITLE                     LABELS     UPDATED
#8    Crash on login            bug        about 1 day ago
#7    Add SSO support           feature    about 3 days ago
```


#### Releases and workflows

**List latest releases**

```bash
gh release list --limit 5
```

Expected output:

```text
TITLE     TAG       PUBLISHED
v2.1.0    v2.1.0    about 1 week ago
v2.0.0    v2.0.0    about 1 month ago
```

**View recent workflow runs**

```bash
gh run list --limit 5
```

Expected output:

```text
STATUS  TITLE             WORKFLOW    BRANCH   EVENT   ID          ELAPSED  AGE
✓       Fix login bug     CI          main     push    123456789   2m30s    about 1 hour ago
```

---


## Intermediate Track


### Quick-start checklist

1. `gh --version` confirms installation.
2. `gh auth status` confirms authentication.
3. `cd` into a cloned repo, or run `gh repo set-default`.


### Command reference


#### Repository and branch operations

| Action                            | Command                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sync current branch from upstream | `gh repo sync`                                                                                                                                            |
| View recent commits               | `gh api repos/{owner}/{repo}/commits --jq '.[] \| "\(.commit.author.date) \(.commit.author.name) \(.commit.message \| split("\n") \| .[0])"' \| head -10` |


#### Pull requests

| Action                       | Command                                                  |
| ---------------------------- | -------------------------------------------------------- |
| List open PRs                | `gh pr list`                                             |
| View PR details and comments | `gh pr view <number> --comments`                         |
| Check out PR locally         | `gh pr checkout <number>`                                |
| Create PR (write)            | `gh pr create --title "Title" --body "Body" --base main` |


#### Issues

| Action                     | Command                                                     |
| -------------------------- | ----------------------------------------------------------- |
| List open issues           | `gh issue list`                                             |
| List issues by label       | `gh issue list --label bug`                                 |
| List issues assigned to me | `gh issue list --assignee @me`                              |
| Create issue (write)       | `gh issue create --title "Title" --body "Body" --label bug` |
| Comment on issue (write)   | `gh issue comment <number> --body "Comment text"`           |


#### Releases and workflows

| Action                     | Command                                      |
| -------------------------- | -------------------------------------------- |
| List latest releases       | `gh release list --limit 5`                  |
| View recent workflow runs  | `gh run list --limit 5`                      |
| View a specific run        | `gh run view <run-id>`                       |
| Trigger a workflow (write) | `gh workflow run <workflow-file> --ref main` |

---


## Write operations and the --auto flag


### Confirmation protocol

All write operations modify data on GitHub. By default, Claude displays a summary and asks for confirmation before executing.

**Confirmation format:**

```text
Warning: Write operation requested
Action: <plain-English description of what will happen>
Proceed? [yes / no]
```

**The --auto flag:** Include `--auto` in your request to skip the confirmation prompt and execute immediately.

Example: "Create a PR for this branch --auto"


### Write commands


#### Create a pull request

Requires: write access to the repository.

```bash
gh pr create --title "Fix login bug" --body "Resolves the null pointer on the login page." --base main
```


#### Create an issue

Requires: write access or issue creation enabled for the repository.

```bash
gh issue create --title "Crash on login" --body "Steps to reproduce: ..." --label bug
```


#### Comment on an issue

Requires: write access to the repository.

```bash
gh issue comment 8 --body "Confirmed - reproduced on v2.1.0."
```


#### Trigger a workflow run

Requires: write access and the workflow must have a `workflow_dispatch` trigger.

```bash
gh workflow run deploy.yaml --ref main
```

To pass inputs defined in the workflow:

```bash
gh workflow run deploy.yaml --ref main -f environment=staging
```

---


## Error handling

| Error                                                  | Cause                                                                  | Fix                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `gh: command not found`                                | `gh` is not installed or not on PATH                                   | Install `gh` per the Beginner Track, or add it to your shell PATH     |
| `not logged in` or `authentication required`           | Not authenticated                                                      | Run `gh auth login`                                                   |
| `could not determine base repo`                        | Not inside a git repo with a GitHub remote                             | `cd` into a cloned repo or run `gh repo set-default`                  |
| `HTTP 403` or `Resource not accessible by integration` | Insufficient permissions or token scope                                | Re-run `gh auth login` and grant the required scopes (repo, workflow) |
| `HTTP 404` on API calls                                | Repo is private and token lacks access, or the resource does not exist | Check repo visibility and token scopes                                |
| `pull request create failed: a]ready exists`           | A PR from this branch already exists                                   | Run `gh pr list` to find the existing PR                              |
| `workflow does not have workflow_dispatch trigger`     | The workflow YAML is missing `on: workflow_dispatch`                   | Add the trigger to the workflow file and push                         |

---


## Workflow chaining examples


### Example 1: Review and comment on a PR

Scenario: Check out a PR, review the diff, and leave a comment.

```bash
# List open PRs to find the one you want
gh pr list

# Check out PR #12 locally
gh pr checkout 12

# View the PR description and existing comments
gh pr view 12 --comments

# View the diff
gh pr diff 12

# Leave a review comment (write operation)
gh pr comment 12 --body "Looks good overall. One nit: the error message on line 42 could be clearer."
```


### Example 2: Triage an issue and link it to a new PR

Scenario: Read an issue, create a fix branch, and open a PR that references the issue.

```bash
# View the issue details
gh issue view 8

# Create a branch and make your fix (standard git)
git switch -c fix/login-crash
# ... edit files ...
git add -A && git commit -m "Fix null pointer on login"
git push -u origin fix/login-crash

# Open a PR that references the issue (write operation)
gh pr create --title "Fix login crash" --body "Fixes #8. Adds a null check before accessing the session object." --base main
```


### Example 3: Deploy after CI passes

Scenario: Verify the latest CI run passed, then trigger a deploy workflow.

```bash
# Check the latest workflow runs
gh run list --limit 3

# View details of a specific run to confirm success
gh run view 123456789

# Trigger the deploy workflow (write operation)
gh workflow run deploy.yaml --ref main -f environment=production
```
