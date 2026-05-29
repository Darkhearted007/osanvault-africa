#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# ── Install git post-commit hook ─────────────────────────────────────────────
# This fires on every local git commit (including Replit checkpoint commits),
# keeping GitHub in sync throughout the session, not just after task merges.
HOOK_DIR="/home/runner/workspace/.git/hooks"
HOOK_PATH="$HOOK_DIR/post-commit"

mkdir -p "$HOOK_DIR"
cat > "$HOOK_PATH" << 'HOOK'
#!/bin/bash
# Auto-sync workspace to GitHub after every commit.
# Uses the GitHub Data API — works even when git histories have diverged.
# Runs in the background so it never blocks the commit itself.
if [ -n "$GITHUB_PAT" ]; then
  (cd /home/runner/workspace && node scripts/src/github-api-push.mjs >> /tmp/github-sync.log 2>&1) &
fi
HOOK
chmod +x "$HOOK_PATH"
echo "✓ post-commit hook installed"

# ── Sync to GitHub now ───────────────────────────────────────────────────────
# Run synchronously so this merge's sync is confirmed before returning.
# Failure is non-fatal: setup should not break if GitHub is temporarily
# unreachable — the post-commit hook will catch the next commit.
echo "Syncing workspace to GitHub…"
if node scripts/src/github-api-push.mjs; then
  echo "✓ GitHub sync complete"
else
  echo "⚠ GitHub sync failed (non-fatal) — will retry on next commit"
fi
