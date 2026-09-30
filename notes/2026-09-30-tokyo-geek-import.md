# Tokyo Geek scripts and skills import - 2026-09-30

Imported reusable tools from the local `../tokyo-geek` checkout without modifying that repository.


## Imported and updated

* Six skills: `audit-gh-branches`, `audit-pr-comments`, `grill-me`, `grilling`, `handoff`, `writing-great-skills`.
* Sitemap checker v1.1 adapted to `https://ahandsel.github.io/tokyo-hiker/`.
* Branch inventory and extraction helpers v1.3, including protection against misclassifying unpushed local work.
* Branch sync helper v1.2 with `--verify`, error propagation, and ref argument validation.
* Allowlist checker v2.2 with shell helper discovery and duplicate reporting.
* Handoff artifacts use `notes/`; branch audits retain `main` and `dev` regardless of automated classification.
* Original licenses and explicit-invocation metadata are preserved.


## Exclusions

| Source                                       | Reason                                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `check-content.mjs` and `content-sync-en-ja` | Require mirrored locale folders and mandatory localization fields. Tokyo Hiker uses optional adjacent `.ja.md` translations. |
| `generate-doc-structure.mjs`                 | Existing site structure generator already handles the local content root and output path.                                    |
| `targeted-linting.sh`                        | Existing `lint-target.mjs` provides targeted formatting and check-only mode.                                                 |
| `cleanup-temp-files.sh` and `index.sh`       | Equivalent behavior is already present; source differences are documentation conventions.                                    |
| `script-auditor`                             | Source enforces a different version-history format and makes advisory warnings fail. Retain the local policy.                |
| Other overlapping skills                     | Retain existing blog conventions and the adaptations from the previous import.                                               |

No package dependencies were added. Existing site edits and the prior import remain intact.

The first build exposed sitemap URLs missing the project base. The source configuration fix was imported: sitemap hostname includes `/tokyo-hiker/`.
