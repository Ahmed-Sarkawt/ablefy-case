#!/usr/bin/env bash
# SubagentStop — runs after a subagent finishes.
# If the code-reviewer just ran, suggest invoking bug-fixer.
set -uo pipefail

INPUT=$(cat)
SUBAGENT_NAME=$(echo "$INPUT" | jq -r '.subagent_type // ""')

case "$SUBAGENT_NAME" in
  code-reviewer)
    if [[ -f .claude/.review-queue.txt && -s .claude/.review-queue.txt ]]; then
      echo "🔧 Code review complete. Use the bug-fixer subagent to apply auto-fixable findings."
    fi
    ;;
esac

exit 0
