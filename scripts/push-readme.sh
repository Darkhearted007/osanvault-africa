#!/data/data/com.termux/files/usr/bin/bash
# push-readme.sh
# Auto-sync README.md and other changes to GitHub

REPO_DIR=~/osanvault-africa
cd $REPO_DIR || { echo "❌ Repository folder not found!"; exit 1; }

# Stage all changes
git add .

# Commit with a standard message
git commit -m "📄 Update README.md and other changes" 2>/dev/null

# Pull latest changes to avoid conflicts
git pull origin main --rebase

# Push changes to GitHub
git push origin main --force

echo "✅ All changes synced to GitHub successfully!"
