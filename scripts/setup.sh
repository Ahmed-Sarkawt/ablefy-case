#!/usr/bin/env bash
# One-time setup. Idempotent.
set -euo pipefail

cd "$(dirname "$0")/.."

# Check Node version (need 20+)
NODE_MAJOR=$(node -v | sed 's/v//;s/\..*//' || echo "0")
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "❌ Node 20+ required. You have $(node -v)."
  exit 1
fi

echo "→ Installing prototype dependencies..."
(cd prototype && npm install)

echo "→ Initializing database..."
(cd prototype && npm run db:reset)

echo "→ Installing Playwright browsers..."
(cd prototype && npx playwright install --with-deps chromium 2>/dev/null || true)

# Ensure all hook scripts are executable
chmod +x .claude/hooks/*.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ Setup complete."
echo ""
echo "Next steps:"
echo "  cd prototype && npm run dev    # start frontend + API"
echo "  claude                         # start Claude Code with the configured agents/hooks"
echo ""
echo "Or spawn parallel Claude instances with worktrees:"
echo "  ./scripts/worktree.sh prototype"
echo "  ./scripts/worktree.sh presentation"
