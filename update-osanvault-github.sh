#!/bin/bash
# ÒsánVault Africa: Auto GitHub Update Script
# Automatically adds all website files + all Medium HTML posts in medium/

# --- CONFIGURATION ---
REPO_URL="https://github.com/Darkhearted007/osanvault-website.git"
LOCAL_DIR="$HOME/osanvault-africa"
MEDIUM_DIR="$LOCAL_DIR/medium"
COMMIT_MSG="Update ÒsánVault Africa - $(date '+%Y-%m-%d %H:%M:%S')"

# --- NAVIGATE TO LOCAL REPO ---
echo "[INFO] Navigating to $LOCAL_DIR"
cd "$LOCAL_DIR" || { echo "[ERROR] Directory $LOCAL_DIR not found!"; exit 1; }

# --- ADD ALL MEDIUM HTML FILES ---
if [ -d "$MEDIUM_DIR" ]; then
    HTML_FILES=$(find "$MEDIUM_DIR" -type f -name "*.html")
    if [ -n "$HTML_FILES" ]; then
        echo "[INFO] Adding all Medium HTML files..."
        git add $HTML_FILES
    else
        echo "[WARN] No HTML files found in $MEDIUM_DIR"
    fi
else
    echo "[WARN] Medium directory not found: $MEDIUM_DIR"
fi

# --- ADD ALL OTHER CHANGES ---
echo "[INFO] Adding all other changes..."
git add .

# --- COMMIT ---
echo "[INFO] Committing changes..."
git commit -m "$COMMIT_MSG"

# --- PULL LATEST CHANGES (rebase) ---
echo "[INFO] Pulling latest from origin/main..."
git pull --rebase origin main

# --- PUSH TO GITHUB ---
echo "[INFO] Pushing changes to GitHub..."
git push origin main

echo "[SUCCESS] Repository updated with website, assets, and Medium HTML posts!"
