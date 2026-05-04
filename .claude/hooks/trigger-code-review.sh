#!/usr/bin/env bash
# PostToolUse — appends the changed file to a review queue.
# A separate user prompt or scheduled run picks up the queue and invokes the code-reviewer subagent.
# We keep this as a queue rather than auto-spawning to keep human-in-the-loop.
set -uo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only queue prototype source files
case "$FILE_PATH" in
  */prototype/src/*|*/prototype/server/*) ;;
  *) exit 0 ;;
esac

QUEUE_FILE=".claude/.review-queue.txt"
mkdir -p .claude
# Dedupe: only add if not already present
grep -qxF "$FILE_PATH" "$QUEUE_FILE" 2>/dev/null || echo "$FILE_PATH" >> "$QUEUE_FILE"

# Surface a hint to Claude — printed to stdout, picked up in transcript
echo "📋 Queued for review: $FILE_PATH (run /review to process queue with code-reviewer subagent)"
exit 0
