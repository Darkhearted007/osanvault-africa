#!/bin/bash
# ultimate_upgrade_osanvault.sh - Full clean, deploy, HTTPS, and GitHub push

echo "[🚀] Starting ultimate upgrade for ÒsánVault Africa..."

# Set folders
REPO_DIR=~/osanvault-africa
LIVE_DIR="$REPO_DIR/current/www"
WWW_DIR="$REPO_DIR/www"
SSL_DIR="$REPO_DIR/ssl"

# 1. Remove empty folders and unnecessary files
find "$REPO_DIR" -type d -empty -exec rm -rf {} +
find "$REPO_DIR" -type f \( -name "*.log" -o -name "*.tmp" \) -delete
echo "[✅] Cleaned empty folders and temp/log files."

# 2. Remove old website files in live folder not present in www/
mkdir -p "$LIVE_DIR"
rsync -av --delete "$WWW_DIR/" "$LIVE_DIR/"
echo "[✅] Synced website files to live folder."

# 3. Check SSL certificates
if [[ -f "$SSL_DIR/osanvaultafrica.com.crt" && -f "$SSL_DIR/osanvaultafrica.com.key" ]]; then
    echo "[✅] SSL certificates are present."
else
    echo "[⚠️] SSL certificates missing. Run ultimate_deploy_cf.sh first."
fi

# 4. Reload NGINX
if command -v nginx >/dev/null 2>&1; then
    nginx -s reload
    echo "[✅] NGINX reloaded."
else
    echo "[⚠️] NGINX not installed or not found."
fi

# 5. Commit & push to GitHub
cd "$REPO_DIR" || exit
git add .
git commit -m "Ultimate upgrade: website sync, cleanup, SSL, assets, README, license, GitHub profile tweaks"
git push origin main
echo "[✅] Changes committed and pushed to GitHub."

echo "[🚀] ÒsánVault Africa fully upgraded and deployed!"
