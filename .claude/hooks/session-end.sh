#!/usr/bin/env bash
# Stop hook — log session end. Async, never blocks.
set -uo pipefail

mkdir -p .claude/logs
echo "[$(date -Iseconds)] session end on branch $(git branch --show-current 2>/dev/null || echo none)" \
  >> .claude/logs/sessions.log
exit 0
