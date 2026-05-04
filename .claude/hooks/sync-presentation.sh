#!/usr/bin/env bash
# PostToolUse — when routes or flow change, flag the presentation as stale.
set -uo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

case "$FILE_PATH" in
  */prototype/src/routes/*|*/docs/FLOW.md)
    touch presentation/.stale 2>/dev/null || true
    echo "🎯 Presentation marked stale (route or flow changed). Use the presentation-updater subagent to sync."
    ;;
esac

exit 0
