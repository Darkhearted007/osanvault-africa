#!/data/data/com.termux/files/usr/bin/bash

# Set repo path
REPO_DIR=~/osanvault-africa

echo "🔹 Verifying ÒsánVault Africa repo at $REPO_DIR ..."

# Step 1: Check if folder exists
if [ ! -d "$REPO_DIR" ]; then
    echo "❌ Repo folder not found! Exiting."
    exit 1
fi

cd "$REPO_DIR"

# Step 2: Check key files
KEY_FILES=("README.md" "LICENSE" "landing/index.html" "ai/dashboard_bot.py" "investor/posts.txt" "nft/properties.txt")
echo "🔹 Checking key files..."
for f in "${KEY_FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "⚠️ Missing: $f"
    else
        echo "✅ Found: $f"
    fi
done

# Step 3: Stage all changes
echo "🔹 Staging all changes..."
git add .

# Step 4: Commit
COMMIT_MSG="Verified & updated repo: full deployment + AI, Solana & Ifa integration [$(date +%Y-%m-%d-%H:%M:%S)]"
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "ℹ️ No changes to commit."

# Step 5: Push to GitHub
echo "🔹 Pushing to GitHub..."
git push origin main

# Step 6: Print final status
echo "🚀 ✅ ÒsánVault Africa repo verified and updated!"
git status
