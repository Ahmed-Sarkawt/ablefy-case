#!/usr/bin/env bash
# Spawn a git worktree for parallel Claude work.
# Usage: ./scripts/worktree.sh <name>
set -euo pipefail

NAME="${1:?usage: worktree.sh <name>}"
BRANCH="feature/${NAME}"
PATH_WT="../ablefy-case-study-${NAME}"

if [[ -d "$PATH_WT" ]]; then
  echo "Worktree already exists at $PATH_WT — cd into it."
  exit 0
fi

git worktree add "$PATH_WT" -b "$BRANCH"
echo ""
echo "✅ Worktree created at $PATH_WT on branch $BRANCH"
echo "   cd $PATH_WT && claude"
