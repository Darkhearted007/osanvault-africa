#!/bin/bash
echo "[🚀] Starting full ÒsánVault Africa upgrade..."

# --- 1. Sync website files ---
echo "[*] Syncing website files..."
rsync -av --delete ~/prewritten_content/ ~/osanvault-africa/www/

# --- 2. Add prewritten GitHub README, LICENSE, profile tweaks ---
echo "[*] Updating README, LICENSE, GitHub profile..."
cp ~/prewritten_content/README.md ~/osanvault-africa/
cp ~/prewritten_content/LICENSE ~/osanvault-africa/
cp -r ~/prewritten_content/.github ~/osanvault-africa/

# --- 3. Clean empty folders and temp/log files ---
echo "[*] Cleaning empty folders..."
find ~/osanvault-africa -type d -empty -delete
find ~/osanvault-africa -type f -name "*.log" -delete
echo "[✅] Cleaned empty folders and logs."

# --- 4. Ensure SSL certificates are in place ---
echo "[*] Checking SSL..."
if [ -f ~/osanvault-africa/ssl/osanvaultafrica.com.crt ] && [ -f ~/osanvault-africa/ssl/osanvaultafrica.com.key ]; then
    echo "[✅] SSL certificates are present."
else
    echo "[⚠️] SSL certificates missing! Run the SSL deployment script first."
fi

# --- 5. Reload NGINX ---
echo "[*] Reloading NGINX..."
if command -v nginx >/dev/null 2>&1; then
    nginx -s reload || echo "[⚠️] NGINX reload failed, check ports."
else
    echo "[⚠️] NGINX not installed."
fi

# --- 6. Git add, commit, push ---
echo "[*] Committing changes to GitHub..."
cd ~/osanvault-africa
git add .
git commit -m "Ultimate upgrade: website optimization, README, LICENSE, profile tweaks"
git push origin main

echo "[🚀] ÒsánVault Africa fully upgraded and optimized!"
