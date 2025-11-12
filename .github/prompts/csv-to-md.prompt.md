---
mode: 'agent'
model: GPT-5 mini
tools: [ 'changes', 'edit', 'extensions', 'fetch', 'githubRepo', 'ms-vscode.vscode-websearchforcopilot/websearch', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'testFailure', 'usages', 'vscodeAPI']
description: 'Convert CSV tables into Markdown tables following the specified template.'
---

# Convert CSV tables into Markdown


## Purpose

Convert CSV tables into Markdown tables. No commentary. No summaries. Output only Markdown.


## When to apply

* The user pastes a CSV table or a CSV file containing tabular data.
* The user asks to transform CSV to a Markdown table.


## Output contract

* Emit **only** Markdown table text. No code fences. No prose.
* Preserve column order and cell text exactly.
* Do not trim whitespace, reflow text, or alter punctuation.
* If multiple CSV tables are provided, convert the first unless the user specifies otherwise.


## Procedure

1. Read the entire CSV input line by line.
2. Parse rows and cells without altering cell content.
3. Write a Markdown table with `|` separators.
4. Generate a header row from the first line of CSV.
5. Add a divider row of `---` for each column.
6. Return the Markdown output only.


## Markdown template

When requested, use this template as the target schema:

```markdown
| key_name | en  | comment |
| -------- | --- | ------- |
```


## Example


### Input (CSV)

```csv
key_name,en,comment
keyValue,englishValue,descriptionValue
```


### Output (Markdown)

```markdown
| key_name | en           | comment          |
| -------- | ------------ | ---------------- |
| keyValue | englishValue | descriptionValue |
```
