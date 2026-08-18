# Prompts

Reusable AI prompt files (`*.prompt.md`) for reviewing, linting, and maintaining the Markdown content, scripts, and repository setup in this project. Each file defines a task-specific instruction set to run with an AI assistant.


## Usage

To use a prompt, reference the prompt's file path in the AI interface (VS Code extension, terminal prompt, or desktop app) with the appropriate prefix for the AI tool.

| Tool           | Input                                    | Example                                                 |
| -------------- | ---------------------------------------- | ------------------------------------------------------- |
| Claude         | `Follow prompts/<prompt-file>.prompt.md` | `Follow prompts/md-ref-link.prompt.md for example.md`   |
| Codex          | `Follow prompts/<prompt-file>.prompt.md` | `Follow prompts/md-ref-link.prompt.md for example.md`   |
| GitHub Copilot | `#prompts/<prompt-file>.prompt.md`       | `#prompts/script-version-sync.prompt.md for example.md` |


## Contents

| Prompt                            | Description                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| [md-en-review.prompt.md][]        | Proofread and edit English text for clarity, grammar, and style guide compliance.                 |
| [md-lint.prompt.md][]             | Scan Markdown files, update tables of contents, fix formatting, and enforce the style guide.      |
| [md-map-link.prompt.md][]         | Link the first mention of every real-world location to a Google Maps search query.                |
| [md-ref-link.prompt.md][]         | Convert inline Markdown links into reference-style links.                                         |
| [repo-public-audit.prompt.md][]   | Audit a repository for personal, public use and flag terms or files that do not fit its purpose.  |
| [script-version-sync.prompt.md][] | Auto-update changed scripts' version history and flag related documentation that is out of sync.  |
| [setup-ja-font.prompt.md][]       | Set up a Japanese-friendly VS Code font so Markdown tables that mix English and Japanese line up. |

[md-en-review.prompt.md]: md-en-review.prompt.md
[md-lint.prompt.md]: md-lint.prompt.md
[md-map-link.prompt.md]: md-map-link.prompt.md
[md-ref-link.prompt.md]: md-ref-link.prompt.md
[repo-public-audit.prompt.md]: repo-public-audit.prompt.md
[script-version-sync.prompt.md]: script-version-sync.prompt.md
[setup-ja-font.prompt.md]: setup-ja-font.prompt.md
