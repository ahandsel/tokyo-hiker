---
mode: 'agent'
model: GPT-5
tools:
  [
    'changes',
    'edit',
    'extensions',
    'fetch',
    'githubRepo',
    'ms-vscode.vscode-websearchforcopilot/websearch',
    'new',
    'openSimpleBrowser',
    'problems',
    'runCommands',
    'runNotebooks',
    'runTasks',
    'search',
    'testFailure',
    'usages',
    'vscodeAPI',
  ]
description: 'Audit every CI and automation file, then upgrade each pinned version to the newest release that is safe with Node.js v24.19.0 and the current toolchain.'
---

# Audit the CI setup and upgrade to the latest safe versions

Please audit all continuous integration and automation configuration in this repository, then upgrade every pinned version to the newest release that is safe to use with the current setup.


## Role

You are a CI and release engineer. You are careful, you verify every version claim against an authoritative source, and you never bump a version you have not checked. You prefer the smallest change that removes real risk, and you explain the reason for each change.


## Current setup

These facts were verified on 2026-08-08. Confirm each one is still true before you rely on it.

| Item               | Value                                       | Source of truth                    |
| ------------------ | ------------------------------------------- | ---------------------------------- |
| Node.js (local)    | 24.19.0                                     | `.node-version`                    |
| pnpm               | 11.20.0                                     | `packageManager` in `package.json` |
| pnpm minimum Node  | >= 22.13                                    | `engines.node` of pnpm 11.20.0     |
| Lockfile format    | `lockfileVersion: '9.0'`                    | `pnpm-lock.yaml`                   |
| VitePress          | 2.0.0-alpha.12 (prerelease, pinned exactly) | `package.json`                     |
| Supply chain delay | `minimumReleaseAge: 1440` (1 day)           | `pnpm-workspace.yaml`              |


## Scope

Audit every file below. Do not change application content under `contents/`.

* `.github/workflows/deploy.yml` - builds the VitePress site and deploys it to GitHub Pages on pushes to `main`.
* `.github/workflows/pr-linter.yml` - runs `pnpm md-lint` and `pnpm code-format` on pull requests.
* `.github/workflows/vitepress-auto-update.yml` - weekly scheduled job that bumps VitePress and opens a pull request.
* `.github/dependabot.yml` - Dependabot version update configuration.
* `package.json` - the `packageManager` field and the `scripts` that CI calls.
* `.node-version` - the Node.js version that CI should match.
* Any other file under `.github/` that affects automation.


## Constraints

Treat these as hard rules. If a rule blocks a change you believe is important, stop and explain the conflict instead of working around it.

1. Node.js v24.19.0 is the target runtime. Every workflow must run on Node.js 24, and `.node-version` is the single source of truth. Prefer `node-version-file: .node-version` over a hardcoded number so that local and CI versions cannot drift apart.
2. pnpm 11.20.0 requires Node.js >= 22.13. Any workflow still on Node.js 20 or older is broken and must be fixed.
3. Keep the existing pinning convention. Third-party and GitHub-owned actions are pinned to a full 40 character commit SHA with a trailing comment naming the human readable version, for example `uses: actions/checkout@08c6903... # actions/checkout@v5.0.0, pinned`. Convert any action that still uses a floating tag to this format.
4. Do not change the VitePress version. It is deliberately pinned to an exact `2.0.0-alpha.12` prerelease.
5. Respect `minimumReleaseAge: 1440`. Do not adopt any release published less than one day ago.
6. Do not cross a major version boundary without reading that project's changelog or release notes for breaking changes. Report what you found. If a major bump is risky, recommend it separately rather than including it with the safe changes.
7. Do not add a new third-party action or service unless it replaces one that is deprecated or unmaintained. Say so explicitly when you do.
8. Do not weaken permissions, remove SHA pinning, or disable a check in order to make something pass.


## Research steps

Do not rely on memory for any version number. Your training data is older than the current release of every tool in this repository.

For each GitHub Action, resolve the latest release and its commit SHA:

```sh
gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name'
gh api repos/<owner>/<repo>/commits/<tag> --jq '.sha'
```

For each npm package, resolve the latest version and its Node.js requirement:

```sh
npm view <package> dist-tags
npm view <package>@<version> engines
```

Record where every version number came from so the report can be checked later.


## Audit checklist

Work through each area and record a finding even when nothing is wrong.

**A. Runtime versions**

* Does every `setup-node` step use Node.js 24, ideally through `node-version-file: .node-version`?
* Does every workflow that runs pnpm use a Node.js version that satisfies pnpm's `engines.node`?
* Is the runner image (`ubuntu-latest`) still appropriate, or should it be pinned to a specific release?

**B. Action versions and pinning**

* Is every `uses:` reference pinned to a full commit SHA with a version comment?
* Is any action behind its latest release, deprecated, or archived?
* Does the version comment actually match the SHA it sits next to?

**C. Package manager wiring**

* Do all workflows install pnpm the same way? Two workflows read the version from `packageManager` with `jq`, and one uses `version: latest`. Make them consistent.
* Is `cache: pnpm` on `setup-node` ordered correctly? The pnpm binary must exist before `setup-node` runs, otherwise the cache step fails.
* Does every workflow that should be reproducible use `pnpm install --frozen-lockfile`?

**D. Workflow logic**

* Does each workflow actually achieve what its name and comments claim?
* Does any step write files that are then discarded, so the check silently passes? A formatter run in write mode without a following commit or diff check is a common example.
* Are conditional steps guarded correctly, and does an early `exit 0` do what the author intended?

**E. Permissions and hardening**

* Is every `permissions:` block the minimum needed for the job?
* Does any job hold a write scope it does not use?
* Are secrets referenced only where they are required?

**F. Reliability**

* Does every job set `timeout-minutes`?
* Does every workflow that can overlap with itself set a `concurrency` group?
* Are failure modes handled, or would a transient error open a bad pull request?

**G. Dependabot coverage**

* Which ecosystems are covered, and which are missing?
* Does the `npm` ecosystem need to be added, and would it duplicate the scheduled auto-update workflow?
* Do the `cooldown` and `schedule` settings agree with `minimumReleaseAge` in `pnpm-workspace.yaml`?


## Leads to verify

These were observed on 2026-08-08. Confirm each one yourself before acting on it, and correct the description if it is wrong. This list is a starting point, not the full set of findings.

1. `vitepress-auto-update.yml` pins `node-version: '20'`, which is below pnpm 11's minimum of 22.13. This workflow will fail on its next scheduled run.
2. `vitepress-auto-update.yml` uses floating tags (`actions/checkout@v5`, `actions/setup-node@v6`, `pnpm/action-setup@v4`, `peter-evans/create-pull-request@v7`) while the other two workflows use pinned SHAs.
3. In `vitepress-auto-update.yml`, the `Setup Node.js` step sets `cache: 'pnpm'` but runs before the `Setup pnpm` step.
4. `vitepress-auto-update.yml` sets `pnpm/action-setup` to `version: latest`, which can disagree with the `packageManager` field in `package.json`.
5. `vitepress-auto-update.yml` has no `timeout-minutes` and no `concurrency` group, and the `deploy` job in `deploy.yml` has no `timeout-minutes`.
6. `pr-linter.yml` runs `pnpm code-format` (`prettier --write`) and `pnpm md-lint` (`markdownlint-cli2 --fix`). Both rewrite files in place, and nothing commits or inspects the result, so the job may pass while leaving problems unreported. Consider a check-only mode for CI.
7. `pr-linter.yml` grants `deployments: write` to a job that only lints.
8. `pr-linter.yml` runs `pnpm install` while `deploy.yml` runs `pnpm install --frozen-lockfile`.
9. `deploy.yml` and `pr-linter.yml` both hardcode `node-version: 22` with a comment citing vitepress.dev, which no longer matches `.node-version`.
10. pnpm 11 warns that `packageManager` and `devEngines.packageManager` cannot both be used and that `packageManager` will be ignored. CI reads `packageManager` with `jq`, so decide which field stays and keep CI consistent with that decision.
11. `dependabot.yml` covers `github-actions` only. The `npm` ecosystem is not covered.


## Deliverable

Produce three things, in this order.

1. **Audit report.** Save it to `notes/2026-08-08-ci-audit.md`, replacing the date with today's date. Use the table format below, one row per finding, ordered by severity.
2. **Proposed changes.** Show the exact edits as diffs, grouped into three sections: _Safe now_ (version bumps and fixes with no behavior change), _Behavior change_ (anything that alters what CI accepts or rejects), and _Recommended but deferred_ (major bumps and larger reworks). Explain the reason for each group.
3. **Applied changes.** Apply only the _Safe now_ group without asking. Ask for confirmation before applying anything in the other two groups.

Report table format:

| Severity | File | Line | Finding | Current | Proposed | Source |
| -------- | ---- | ---- | ------- | ------- | -------- | ------ |

Use `Critical` for anything that is broken today, `High` for a security or correctness risk, `Medium` for drift and inconsistency, and `Low` for polish.


## Verification

After applying changes, run these commands and report the real output. Do not claim success without it.

```sh
node -v                      # expect v24.19.0
pnpm -v                      # expect the version in packageManager
pnpm install --frozen-lockfile
pnpm build
```

Validate the workflow files as well. Use `actionlint` if it is available, otherwise parse each file as YAML and confirm it is well formed. If you change a workflow that can be triggered manually, say which one should be run with `workflow_dispatch` to confirm the fix, and note that `vitepress-auto-update.yml` cannot be fully verified without a scheduled or manual run.

State plainly what you verified, what you could not verify, and why.


## Style guidelines

Follow these rules in the report, in commit messages, and in any comment you add to a workflow file.

* Use straight quotes instead of curly quotes.
* Use a plain hyphen (`-`). Never use an en-dash or an em-dash.
* Avoid contractions (for example, use "do not" instead of "don't").
* Use the Oxford comma.
* Use sentence case for all headings and subheadings.
* Keep wording simple and direct so that non-native English speakers can easily understand it.
* Keep every existing explanatory comment in the workflow files, and update the comment whenever you change the line it describes.
