#!/bin/bash
# ÒsánVault Africa - All-in-One Automation Script
# Automatically updates, commits, and pushes changes to GitHub
# Author: Olugbenga Ajayi

# Set variables
REPO_DIR="$HOME/osanvault-africa"
BRANCH="main"

# Navigate to repository
cd "$REPO_DIR" || { echo "❌ Repository directory not found! Exiting..."; exit 1; }

# Ensure we are in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initialize first!"
    exit 1
fi

# Pull latest changes to avoid conflicts
echo "🔄 Pulling latest changes from GitHub..."
git pull origin $BRANCH --rebase

# Stage all changes
echo "📥 Staging all changes..."
git add .

# Commit changes
COMMIT_MSG="Auto update $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "ℹ️ Nothing to commit."

# Push to GitHub
echo "🚀 Pushing changes to GitHub..."
git push origin $BRANCH

# Optional: Run grant script if it exists
GRANT_SCRIPT="$REPO_DIR/scripts/grant-apply.sh"
if [ -f "$GRANT_SCRIPT" ]; then
    echo "💰 Running grant script..."
    bash "$GRANT_SCRIPT"
else
    echo "⚠️ Grant script not found, skipping..."
fi

# Optional: Any other automation scripts
AUTO_SCRIPT="$REPO_DIR/scripts/push-readme.sh"
if [ -f "$AUTO_SCRIPT" ]; then
    echo "📝 Running README push script..."
    bash "$AUTO_SCRIPT"
fi

echo "🎉 ÒsánVault Africa automation complete at $(date '+%Y-%m-%d %H:%M:%S')"
