# Prompts

Reusable prompt files for this repository. This folder is the only place a prompt file is stored.

Two symlinks point here, so every agent tool reads the same files:

* `.claude/commands` -> `../prompts` - Claude Code slash commands.
* `.github/prompts` -> `../prompts` - GitHub Copilot prompt files.

Add and edit prompts here, never through a symlinked path.


## Index

| Prompt                                                           | Purpose                                                                          |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [ci-audit.prompt.md](ci-audit.prompt.md)                         | Audit every CI and automation file, then upgrade each pinned version safely.     |
| [csv-to-md.prompt.md](csv-to-md.prompt.md)                       | Convert a CSV table into a Markdown table.                                       |
| [md-en-review.prompt.md](md-en-review.prompt.md)                 | Proofread a Markdown file, keeping the edits minimal.                            |
| [md-lint.prompt.md](md-lint.prompt.md)                           | Proofread a Markdown file, fix formatting, and convert links to reference style. |
| [md-ref-link.prompt.md](md-ref-link.prompt.md)                   | Convert inline Markdown links to reference-style links.                          |
| [quick-en-review.prompt.md](quick-en-review.prompt.md)           | Proofread a short piece of English text.                                         |
| [quick-ja-translation.prompt.md](quick-ja-translation.prompt.md) | Translate an English Markdown file into business Japanese.                       |
| [script-review-min.prompt.md](script-review-min.prompt.md)       | Review a script and apply surgical, minimal edits.                               |
| [script-review.prompt.md](script-review.prompt.md)               | Full review of a script for quality, readability, and security.                  |


## Authoring rules

* Name a file `<slug>.prompt.md`, using `lowercase-with-dashes`. GitHub Copilot only recognizes the `.prompt.md` suffix.
* Keep the frontmatter minimal: a single `description` key, quoted, and nothing else. Both tools read it, and a tool-specific key such as `mode`, `model`, or `tools` only works in one of them.
* Write the prompt body against the repository rules in [AGENTS.md](../AGENTS.md) rather than restating the writing style rules in each prompt.
* Update the index above whenever a prompt is added, removed, or renamed.
