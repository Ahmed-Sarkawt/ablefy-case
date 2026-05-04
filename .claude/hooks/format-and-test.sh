#!/usr/bin/env bash
# PostToolUse for Write/Edit/MultiEdit — format the changed file, run affected tests.
# Non-blocking on test failures (exit 1 logs without halting Claude).
set -uo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Only act on prototype files
case "$FILE_PATH" in
  */prototype/*) ;;
  *) exit 0 ;;
esac

# Format
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    if command -v npx >/dev/null 2>&1; then
      (cd prototype && npx prettier --write --log-level=error "../$FILE_PATH" 2>/dev/null) || true
    fi
    ;;
esac

# Run tests for that file if a sibling test exists
TEST_FILE="${FILE_PATH%.tsx}.test.tsx"
if [[ -f "$TEST_FILE" ]]; then
  (cd prototype && npx vitest run "$TEST_FILE" --silent 2>&1 | tail -n 20) || \
    echo "⚠️  Tests failed for $TEST_FILE — see above" >&2
fi

exit 0
