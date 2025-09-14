#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "[🚀] Starting ultimate deploy & upgrade for ÒsánVault Africa..."

# Step 1: Ensure prewritten content exists
mkdir -p ~/osanvault-africa/prewritten_content
mkdir -p ~/osanvault-africa/www

echo "[*] Copying prewritten website content..."
cp -r ~/osanvault-africa/prewritten_content/* ~/osanvault-africa/www/ || echo "[⚠️] No prewritten content found!"

# Step 2: Clean empty folders & logs
echo "[*] Cleaning empty folders and temp/log files..."
find ~/osanvault-africa -type d -empty -delete
find ~/osanvault-africa/logs -type f -name "*.log" -delete 2>/dev/null || true

# Step 3: Setup NGINX folders & config
mkdir -p ~/nginx/sites-available ~/nginx/sites-enabled
if [ -f ~/osanvault-africa/ssl/osanvaultafrica.conf ]; then
    mv ~/osanvault-africa/ssl/osanvaultafrica.conf ~/nginx/sites-available/
fi
ln -sf ~/nginx/sites-available/osanvaultafrica.conf ~/nginx/sites-enabled/osanvaultafrica.conf

# Include sites-enabled if not already in nginx.conf
grep -q 'include /data/data/com.termux/files/home/nginx/sites-enabled/*;' ~/nginx/nginx.conf || \
echo 'include /data/data/com.termux/files/home/nginx/sites-enabled/*;' >> ~/nginx/nginx.conf

# Step 4: Test & reload NGINX
echo "[*] Testing NGINX configuration..."
nginx -t || { echo "[❌] NGINX config test failed!"; exit 1; }
echo "[*] Reloading NGINX..."
nginx -s reload || echo "[⚠️] NGINX reload warning (may be first run)."

# Step 5: Commit & push to GitHub
echo "[*] Committing changes to GitHub..."
cd ~/osanvault-africa
git add . 
git commit -m "Deploy: update www, NGINX, SSL, assets, README, LICENSE" 2>/dev/null || echo "[*] Nothing new to commit."
git push origin main || echo "[⚠️] Git push failed, check your connection or credentials."

# Step 6: Set GitHub Pages branch to www
echo "[*] Setting GitHub Pages branch to www..."
gh repo edit Darkhearted007/osanvault-africa --branch main --source www || echo "[⚠️] GitHub Pages setup failed!"

# Step 7: Run ultimate deploy script for SSL & cron
echo "[*] Running ultimate deploy script for SSL & cron..."
if [ -f ~/osanvault-africa/ultimate_deploy_osanvault.sh ]; then
    bash ~/osanvault-africa/ultimate_deploy_osanvault.sh
else
    echo "[⚠️] ultimate_deploy_osanvault.sh not found!"
fi

echo "[✅] ÒsánVault Africa fully deployed, upgraded, and synced!"
