#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# ── Install git post-commit hook ─────────────────────────────────────────────
# Fires on every local git commit (including Replit checkpoint commits).
# flock serializes concurrent hook invocations so only one sync runs at a time.
# Uses push-to-github.mjs which performs a real git fetch + merge + push,
# preserving full commit ancestry on the remote.
HOOK_DIR="/home/runner/workspace/.git/hooks"
HOOK_PATH="$HOOK_DIR/post-commit"

mkdir -p "$HOOK_DIR"
cat > "$HOOK_PATH" << 'HOOK'
#!/bin/bash
# Auto-sync workspace to GitHub after every commit.
# push-to-github.mjs: fetch remote main, merge (ours wins on conflict), push.
# flock (/tmp/github-sync.lock) serializes runs — no concurrent sync processes.
if [ -n "$GITHUB_PAT" ]; then
  (
    flock 9
    cd /home/runner/workspace && node scripts/src/push-to-github.mjs >> /tmp/github-sync.log 2>&1
  ) 9>/tmp/github-sync.lock &
else
  echo "[github-sync] GITHUB_PAT not set — skipping sync" >> /tmp/github-sync.log 2>&1
fi
HOOK
chmod +x "$HOOK_PATH"
echo "✓ post-commit hook installed (push-to-github.mjs)"

# ── Sync to GitHub now ───────────────────────────────────────────────────────
if [ -z "$GITHUB_PAT" ]; then
  echo "⚠ GITHUB_PAT not set — skipping GitHub sync"
else
  echo "Syncing workspace to GitHub (git fetch + merge + push)…"
  if node scripts/src/push-to-github.mjs; then
    echo "✓ GitHub sync complete"
  else
    echo "⚠ GitHub sync failed (non-fatal) — will retry on next commit"
  fi
fi
