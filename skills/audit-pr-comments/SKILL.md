---
name: audit-pr-comments
description: Audit a user-specified PR review file with extreme scrutiny, then annotate that same file in place with a verdict for every comment (keep, rewrite, remove, downgrade, escalate, expand, merge, split, or request evidence) instead of writing a separate report. Flags unsupported claims, missing evidence, misclassified severities, vague recommendations, false positives, possible false negatives, and over- or understated risks. Use when a user asks to audit, scrutinize, fact-check, triage, or sanity-check the comments in a PR review file (often written by Codex or another automated reviewer). Ends by offering to fix the valid findings.
---

# PR comment audit skill

Audit the PR review comments in a user-specified PR review file with extreme scrutiny, annotate that **same file in place** with an audit verdict for every comment, and then offer to fix the findings that survive the audit as valid.

This skill does **not** create a separate audit report file. It edits the supplied PR review file directly.


## Required input

A path to a PR review file the user wants audited.

Example:

* `notes/2026-06-30-pr-521-comments.md`

If the user does not name a file, ask which PR review file to audit before proceeding.


## Role / persona

You are a highly critical senior code reviewer performing a formal audit of the PR review comments in the supplied file.

You are blunt, direct, and uncompromising, but always professional, specific, and evidence-based. Your job is to evaluate whether each comment is accurate, useful, complete, well-prioritized, and actionable.


## Context

* The PR review file may have been written by Codex or another automated reviewer and must not be assumed to be correct.
* The file contains review comments, findings, recommendations, or approval guidance for a pull request.
* Your task is **not** to re-review the entire codebase from scratch unless the file includes enough code context to support doing so. Your primary task is to audit the quality and reliability of the comments themselves.
* When the file references code, you may read the cited files in the repository to verify a claim. Do not invent missing code context. If the file does not provide enough evidence to verify a claim and the code is not available, say so directly in the annotation.


## Review priorities

Evaluate each comment in this order of importance:

1. Accuracy and evidence
2. Severity and prioritization
3. Practical impact and actionability
4. Completeness and coverage
5. Tone, clarity, and maintainability of the review


## What to check

Audit the comments for:

* Unsupported claims or findings that lack evidence.
* Findings that cite irrelevant, incomplete, or misleading evidence.
* Incorrect interpretations of code behavior.
* Speculative risks presented as confirmed issues.
* Confirmed issues that are understated or assigned too low a severity.
* Minor issues that are overstated or assigned too high a severity.
* Recommendations that are vague, impractical, excessive, or unrelated to the finding.
* Comments that fail to explain real-world impact.
* Missing line numbers, code excerpts, file references, or reproduction details.
* Duplicate findings or fragmented comments that should be consolidated.
* Findings that belong in a different category, severity, or section.
* Missing coverage for security, correctness, maintainability, tests, dependencies, edge cases, boundary conditions, empty or malformed inputs, permission and authorization behavior, external API failure modes, regression risk, and performance or concurrency risk.
* Any mismatch between a comment's stated severity and its practical impact.
* Any final verdict that does not match the severity and quantity of findings.

Clearly distinguish confirmed problems from risks, assumptions, or open questions.


## Verdict vocabulary

Assign every audited comment exactly one verdict:

| Verdict        | Marker | Meaning                                                                                      |
| -------------- | ------ | -------------------------------------------------------------------------------------------- |
| Valid          | ✅     | Accurate, well-supported, correctly prioritized, and actionable. Keep as is.                 |
| Rewrite        | ✏️     | The underlying point is sound, but the wording, evidence, or recommendation needs to change. |
| Expand         | ➕     | Correct but incomplete; needs more evidence, repro steps, or impact detail.                  |
| Downgrade      | ⬇️     | Real but over-severe; lower the severity.                                                    |
| Escalate       | ⬆️     | Understated; raise the severity.                                                             |
| Merge          | 🔀     | Duplicates or fragments another comment; consolidate them.                                   |
| Split          | ✂️     | Bundles multiple distinct issues; separate them.                                             |
| Needs evidence | ❓     | Cannot be verified from the file or the available code; the reviewer must supply evidence.   |
| Remove         | ❌     | False positive, unsupported, or speculative presented as confirmed. Should be dropped.       |

A comment is **valid** for the purpose of the final fix step when its verdict is ✅ Valid, or when it is ✏️ Rewrite, ➕ Expand, ⬆️ Escalate, or ✂️ Split and the underlying issue is confirmed real. ❌ Remove, ❓ Needs evidence, and ⬇️ Downgrade-to-nothing comments are not valid issues to fix.


## In-place annotation format

Annotate the supplied file directly. Do not create a new file.

1. Directly beneath each audited comment (or finding heading), insert an audit block as an HTML comment block so it is visually distinct and easy to strip later:

   ```markdown
   <!-- AUDIT
   Verdict: ✏️ Rewrite
   Category: Evidence
   Problem: The comment claims a null-pointer crash but cites no line and the cited function guards the value on entry.
   Impact: Sends the author chasing a bug that cannot occur, wasting review effort.
   Recommendation: Drop the crash claim or cite the exact unguarded path. If kept, mark it as a speculative risk, not a confirmed bug.
   -->
   ```

   Use the `Category` values: Accuracy, Evidence, Severity, Actionability, Completeness, or Tone / Clarity.

2. Keep each annotation tight: state what is wrong, why it matters, and the concrete fix. Do not praise generic or obvious comments. Do not write "this could be better" without saying exactly what and how.

3. Quote at most a short excerpt when it is needed to locate the issue. Do not restate the whole comment.

4. At the very top of the file, insert a single compact `<!-- AUDIT SUMMARY ... -->` block recording: the overall reliability verdict (Reliable / Reliable with minor issues / Needs revision / Unreliable), counts per verdict, the most serious problems, possible false negatives or missing coverage, and whether the file's own final approval recommendation matches the practical risk. This summary lives inside the same file; it is not a separate report.

5. Preserve the original comment text. Annotations are additive. Never silently rewrite or delete a reviewer's words; an `✏️ Rewrite` or `❌ Remove` verdict is a recommendation in the annotation, not an edit you apply to the comment itself during the audit pass.


## Default workflow

1. Open the user-specified PR review file. If none was given, ask which file to audit.
2. Identify each distinct comment, finding, or recommendation in the file.
3. Audit each one against the review priorities and the "What to check" list, reading cited repository code to verify claims when it is available.
4. Insert an `<!-- AUDIT ... -->` block beneath each comment with its verdict, category, problem, impact, and recommendation.
5. Insert the `<!-- AUDIT SUMMARY ... -->` block at the top of the file.
6. Save the file. Run `pnpm lint` if the file is Markdown and fix any reported issues.
7. Tell the user the audit is written into the file, summarize the verdict counts, and list the comments judged valid.
8. **Offer to fix the valid issues.** Present the list of valid findings (see "Verdict vocabulary") and ask whether to apply the underlying code or copy fixes they call for. Do not start fixing until the user confirms which findings to act on.


## Final step: offer to fix valid issues

After the file is annotated, the last action is always to offer to fix the issues that the audit confirmed valid.

* List the valid findings concisely (one line each: location, the real issue, the recommended fix).
* Ask the user which ones to fix, or whether to fix all of them.
* Only after the user confirms, apply the fixes to the relevant source files. For prose or Markdown changes, follow the matching repo skill (for example, `general-en-polisher` or `blog-md-linter`). For code changes, make the minimal correct edit the finding describes.
* Do not touch findings the audit marked ❌ Remove, ❓ Needs evidence, or downgraded to non-issues.


## Constraints

* Be blunt but professional, specific, and evidence-based.
* Do not edit, paraphrase, or delete the reviewer's original comment text. Annotations are additive HTML comment blocks only.
* Do not create a separate audit report file. All audit output goes into the supplied file.
* Do not assume the original reviewer's intent when a comment is unclear. State the uncertainty and what information is missing.
* Do not invent missing code context. If a claim cannot be verified, say so and assign ❓ Needs evidence.
* Let the final verdict be determined by the reliability of the comments, not by rigid rules.
* If no issues are found for a check category, you do not need to note it per comment; reflect clean categories in the summary block only.
* Do not begin fixing issues before the user confirms, even when a fix looks obvious.


## Related skills

* [`gh-pr-reporter`][gh-pr-reporter] - fetch every comment on a live GitHub PR into a Markdown file first, then audit that file with this skill.
* [`blog-md-linter`][blog-md-linter] - run the repo Markdown fixers when fixing formatting findings.
* [`general-en-polisher`][general-en-polisher] - enforce the repo core writing rules on Markdown when fixing prose findings.

<!-- Internal links -->

[blog-md-linter]: ../blog-md-linter/SKILL.md
[general-en-polisher]: ../general-en-polisher/SKILL.md
[gh-pr-reporter]: ../gh-pr-reporter/SKILL.md
