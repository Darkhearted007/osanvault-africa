
#!/bin/bash
# Ensure we are in the Git repo
cd /data/data/com.termux/files/home/osanvault-africa || exit 1
# ÒsánVault Africa All-in-One Automation Script
# This script commits changes, pushes to GitHub, and applies grants automatically

# Timestamp
echo "⏱ Starting sync at $(date)"

# Step 1: Stage all changes
git add .

# Step 2: Commit changes
echo "Enter a commit message (or press Enter for default):"
read commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Auto-update: $(date)"
fi
git commit -m "$commit_msg"

# Step 3: Pull latest changes and rebase to avoid conflicts
git pull origin main --rebase

# Step 4: Push changes to GitHub
git push origin main --force
echo "✅ All changes synced to GitHub successfully!"

# Step 5: Run grant application script
if [ -f "./scripts/grant-apply.sh" ]; then
    chmod +x ./scripts/grant-apply.sh
    ./scripts/grant-apply.sh
    echo "✅ Grant application process completed!"
else
    echo "⚠️ Grant script not found, skipping..."
fi

# Step 6: Push README updates (if needed)
if [ -f "./scripts/push-readme.sh" ]; then
    chmod +x ./scripts/push-readme.sh
    ./scripts/push-readme.sh
    echo "✅ README.md updated and pushed!"
fi

echo "🎉 ÒsánVault Africa automation complete at $(date)"
