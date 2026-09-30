---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: 'What will the next session be used for?'
disable-model-invocation: true
---

# Handoff skill

Write a handoff document summarizing the current conversation so a fresh agent can continue the work. Save to `notes/<YYYY-MM-DD>-handoff.md` and update `notes/README.md`, following the repository artifact conventions.

Include a "suggested skills" section in the document, which suggests skills that the agent should invoke.

Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
