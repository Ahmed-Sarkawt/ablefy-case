#!/usr/bin/env bash
# PreToolUse for Bash — blocks destructive commands.
# Reads JSON on stdin, exits 2 to block, 0 to allow.
set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Patterns that should never run
BLOCKED_PATTERNS=(
  'rm[[:space:]]+-rf[[:space:]]+/'
  'rm[[:space:]]+-rf[[:space:]]+~'
  'rm[[:space:]]+-rf[[:space:]]+\*'
  'DROP[[:space:]]+TABLE'
  'DROP[[:space:]]+DATABASE'
  ':(){ :|:&};:'   # fork bomb
  'mkfs\.'
  'dd[[:space:]]+if=.*of=/dev/'
  'chmod[[:space:]]+-R[[:space:]]+777[[:space:]]+/'
  'curl[[:space:]]+.*\|[[:space:]]*(ba)?sh'
  'wget[[:space:]]+.*\|[[:space:]]*(ba)?sh'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "Blocked dangerous command pattern: $pattern" >&2
    exit 2
  fi
done

# Force-deny git push to main/master without explicit override
if echo "$COMMAND" | grep -qE 'git[[:space:]]+push.*[[:space:]]+(main|master)' \
   && ! echo "$COMMAND" | grep -q 'CASE_STUDY_ALLOW_PUSH_MAIN'; then
  echo "Refused: direct push to main/master. Set CASE_STUDY_ALLOW_PUSH_MAIN=1 in the command to override." >&2
  exit 2
fi

exit 0
