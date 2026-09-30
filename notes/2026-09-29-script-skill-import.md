# Script and skill import - 2026-09-29

Imported reusable tools from the local `../ahandsel.github.io` checkout.


## Scope

* Added 14 skills: `code-review`, `general-ja-polisher`, `gh-address-comments`, `gh-fix-ci`, `gh-pr-generator`, `gh-sync-with-main`, `ja-readability-editor`, `ja-review-text`, `playwright`, `pr-auditor`, `readability-editor`, `security-best-practices`, `security-threat-model`, `vitepress-include-lint`.
* Imported `trim-png.mjs` v1.1 and upgraded `cleanup-temp-files.sh` to v5.4.
* Imported the GitHub comment, check inspection, branch sync, include lint, and browser helpers with their skills.
* Adapted portfolio paths, commands, published URLs, Japanese writing guidance, artifact locations, and the browser wrapper.
* The include checker v1.3 accepts the space before the closing comment used by Tokyo Hiker.
* Retained bundled license and notice files; imported the naming linter v1.1 exception for `NOTICE.txt`.


## Deliberate exclusions

| Source                                                             | Reason                                                                                                                                                                                        |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/check-en-ja-parity.mjs`, its tests, and `docs-sync-en-ja` | Require mirrored `contents/en` and `contents/ja` trees. Tokyo Hiker uses optional adjacent `.ja.md` translations ; the existing `blog-translator` is a separate workflow and was not changed. |
| `scripts/generate-doc-structure.mjs`                               | Portfolio-specific structure generator; retain `generate-site-structure.mjs`.                                                                                                                 |
| `scripts/index.sh`                                                 | Local version already has the same behavior and additional required output documentation.                                                                                                     |
| `readme-maintainer`                                                | Duplicates the existing `folder-readme-maintainer`.                                                                                                                                           |
| Skills already present                                             | Preserve local fixes, script audit behavior, naming rules, allowlist script discovery, and blog conventions.                                                                                  |

The import adds no Node dependencies and does not modify the source repository.

Only the general browser and Vue security references are included; server frameworks and other frontend frameworks are outside this project scope.
