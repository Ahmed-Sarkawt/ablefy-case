---
description: Process the code review queue — invoke the code-reviewer subagent on each queued file, then optionally invoke bug-fixer.
---

Read `.claude/.review-queue.txt`. For each file path in the queue:

1. Use the `code-reviewer` subagent to review the file.
2. Collect findings tagged "Auto-fixable: yes" into a single list.
3. After all files reviewed, ask: "Apply auto-fixes? (yes/no)"
4. On `yes`, invoke the `bug-fixer` subagent with the auto-fixable findings.
5. Empty the queue file once processed.

Output a summary at the end with files reviewed, total findings by severity, and auto-fixes applied.
