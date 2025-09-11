#!/bin/bash
set -e

# Variables
REPO_PATH=~/osanvault-africa
GITHUB_URL="https://github.com/Darkhearted007/osanvault-africa.git"
BRANCH="main"

echo "[🚀] Starting ÒsánVault Africa upgrade..."

# 1️⃣ Ensure www folder exists
mkdir -p $REPO_PATH/www/assets/css
mkdir -p $REPO_PATH/www/assets/js
mkdir -p $REPO_PATH/www/assets/images

# 2️⃣ Copy prewritten website files (replace ~/prewritten_content with your folder)
cp -r ~/prewritten_content/* $REPO_PATH/www/

# 3️⃣ Create README.md
cat > $REPO_PATH/README.md <<EOL
# ÒsánVault Africa

Official Web3 Real Estate & Tokenization Platform.

## Features
- Tokenized real estate on Solana
- DeFi tools and real-yield vaults
- DAO-lite governance
- Carbon credit & fractional REITs
- Secure blockchain integration

## Website
https://osanvaultafrica.com

## Setup
- Clone repo: git clone $GITHUB_URL
- Deploy website files from /www

## License
MIT License

EOL

# 4️⃣ Add LICENSE (MIT)
cat > $REPO_PATH/LICENSE <<EOL
MIT License

Copyright (c) 2025 Olugbenga Ajayi

Permission is hereby granted, free of charge, to any person obtaining a copy...
EOL

# 5️⃣ Git operations
cd $REPO_PATH
if [ ! -d ".git" ]; then
  git init
  git remote add origin $GITHUB_URL
fi

git add .
git commit -m "Full upgrade: website, content, SSL, NGINX, README, LICENSE, professional layout"
git push -u origin $BRANCH --force

echo "[✅] ÒsánVault Africa upgraded and pushed to GitHub!"
