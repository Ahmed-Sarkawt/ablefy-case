#!/usr/bin/env bash
# SessionStart hook — loads project context into Claude's session.
# Outputs JSON with `additionalContext` so Claude sees branch + recent decisions + open TODOs.
set -euo pipefail

BRANCH=$(git branch --show-current 2>/dev/null || echo "no-git")

# Last 5 lines of the decisions log
RECENT_DECISIONS=""
if [[ -f docs/DECISIONS.md ]]; then
  RECENT_DECISIONS=$(tail -n 30 docs/DECISIONS.md | sed 's/"/\\"/g' | tr '\n' ' ' | head -c 800)
fi

# Open TODOs (lines containing TODO or FIXME in src + server)
TODOS=""
if [[ -d prototype ]]; then
  TODOS=$(grep -rn "TODO\|FIXME" prototype/src prototype/server 2>/dev/null \
    | head -n 10 \
    | sed 's/"/\\"/g' \
    | tr '\n' '|' \
    | head -c 600 || echo "")
fi

CONTEXT="Branch: ${BRANCH}. Recent decisions: ${RECENT_DECISIONS}. Open TODOs: ${TODOS}"

# Output JSON for Claude Code to inject as additional context
cat <<JSON
{
  "additionalContext": "${CONTEXT}"
}
JSON
