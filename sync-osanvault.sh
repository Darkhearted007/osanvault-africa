#!/bin/bash

# Path to your repository
REPO_DIR="$HOME/osanvault-africa"
cd "$REPO_DIR" || exit

# Create dynamic README.md
cat > README.md <<EOL
# ÒsánVault Africa

Welcome to **ÒsánVault Africa**, a blockchain-powered platform revolutionizing real estate, investments, and digital assets in Africa. 

**Official Website:** [osanvaultafrica.com](https://osanvaultafrica.com)

## Key Features
- Tokenized Real Estate Investment
- Fractional Ownership of Properties
- Real On-Chain Yields
- DAO-lite Governance
- Cross-Chain Integration
- Community Dashboard & Voting
- Secure Wallet & Identity Verification

## Repository Contents

EOL

# Append file list dynamically
echo "📂 Listing all files in the repo..."  
for f in $(ls -1); do
  # Skip .git folder
  if [[ "$f" != ".git" ]]; then
    echo "- $f" >> README.md
  fi
done

# Append footer with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo -e "\n*Last updated: $TIMESTAMP*" >> README.md

echo "📝 README.md updated with latest files and project info."

# Pull remote changes and rebase
echo "⏳ Pulling latest changes from GitHub..."
git fetch origin main
git rebase origin/main

# Add all changes
echo "📂 Adding all changes..."
git add .

# Commit with timestamp
git commit -m "Update README and sync files at $TIMESTAMP" 2>/dev/null

# Push changes to GitHub
echo "🚀 Pushing changes..."
git push origin main --force

echo "✅ Sync complete at $TIMESTAMP"
