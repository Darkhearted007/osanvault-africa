#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# ── Install git post-commit hook ─────────────────────────────────────────────
# This fires on every local git commit (including Replit checkpoint commits).
# flock serializes concurrent hook invocations so only one sync runs at a
# time — if two commits fire quickly, the second queues and runs after the
# first finishes, reading the then-current local HEAD (the newest state).
HOOK_DIR="/home/runner/workspace/.git/hooks"
HOOK_PATH="$HOOK_DIR/post-commit"

mkdir -p "$HOOK_DIR"
cat > "$HOOK_PATH" << 'HOOK'
#!/bin/bash
# Auto-sync workspace to GitHub after every commit.
# Uses the GitHub Data API — works even when git histories have diverged.
# flock (/tmp/github-sync.lock) serializes runs: no two sync processes
# execute concurrently, eliminating force-push races.
if [ -n "$GITHUB_PAT" ]; then
  (
    flock 9
    cd /home/runner/workspace && node scripts/src/github-api-push.mjs >> /tmp/github-sync.log 2>&1
  ) 9>/tmp/github-sync.lock &
else
  echo "[github-sync] GITHUB_PAT not set — skipping sync" >> /tmp/github-sync.log 2>&1
fi
HOOK
chmod +x "$HOOK_PATH"
echo "✓ post-commit hook installed"

# ── Sync to GitHub now ───────────────────────────────────────────────────────
# Explicit PAT guard — skip with a clear message rather than exit(1) so
# the rest of post-merge setup is unaffected.
if [ -z "$GITHUB_PAT" ]; then
  echo "⚠ GITHUB_PAT not set — skipping GitHub sync"
else
  echo "Syncing workspace to GitHub…"
  if node scripts/src/github-api-push.mjs; then
    echo "✓ GitHub sync complete"
  else
    echo "⚠ GitHub sync failed (non-fatal) — will retry on next commit"
  fi
fi
