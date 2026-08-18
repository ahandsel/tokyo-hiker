# Git commit style guide


## Title format

* 50 characters or fewer, including the emoji.
* Start with exactly 1 emoji from the commit type emoji guide.
* Do not end with a period.
* If scripts or tools are edited, include the script name and version number in the title when possible. For example `✨ phrase-push.sh v1.2.3: add new feature`.


## Body format

* Use bullet points.
* Summarize what changed and why.
* Group related changes into logical bullets.
* Include testing, risk, migration, or rationale bullets only when supported by evidence.
* Omit file-by-file noise unless a specific file change is important.
* Do not split a sentence with a new line. Keep each bullet on a single line, no matter how long.
* Manage line length by writing shorter sentences or splitting one idea into several bullets, never by hard-wrapping a sentence across lines.


## Commit type emoji guide

* `🐛` bug fix
* `🔧` configuration, tooling, or maintenance
* `⬇️` dependency downgrade
* `⬆️` dependency upgrade
* `📝` documentation
* `✨` feature
* `🚚` file or structure move
* `🎨` formatting or linting
* `🚀` performance
* `♻️` refactor
* `🗑️` removal or cleanup
* `🔄` rollback or undoing tests
* `🧪` tests
