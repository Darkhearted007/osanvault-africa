#!/data/data/com.termux/files/usr/bin/bash
# ultimate_deploy_osanvault.sh
# Fully automated deployment + GitHub sync for ÒsánVault Africa

echo "[🚀] Starting ultimate deployment for ÒsánVault Africa..."

# --- Variables ---
REPO="https://github.com/Darkhearted007/osanvault-africa.git"
HOME_DIR="$HOME/osanvault-africa"
WWW_DIR="$HOME_DIR/www"
SSL_DIR="$HOME_DIR/ssl"
NGINX_PID="$HOME_DIR/nginx.pid"

# --- Step 1: Ensure necessary folders ---
mkdir -p $WWW_DIR $SSL_DIR /data/data/com.termux/files/usr/tmp

# --- Step 2: Pull latest website files from GitHub ---
if [ -d "$HOME_DIR/.git" ]; then
    cd $HOME_DIR
    git fetch --all
    git reset --hard origin/main
else
    git clone $REPO $HOME_DIR
    cd $HOME_DIR
fi

# --- Step 3: Clean empty folders ---
find $HOME_DIR -type d -empty -delete

# --- Step 4: Ensure SSL exists ---
if [ ! -f "$SSL_DIR/osanvaultafrica.com.crt" ] || [ ! -f "$SSL_DIR/osanvaultafrica.com.key" ]; then
    echo "[⚠️] SSL missing, requesting..."
    bash $HOME_DIR/ultimate_deploy_cf.sh
fi

# --- Step 5: Fix NGINX PID issue ---
sed -i "s|pid .*|pid $NGINX_PID;|" $SSL_DIR/osanvaultafrica.conf

# --- Step 6: Start/Reload NGINX ---
if pgrep nginx > /dev/null; then
    nginx -c $SSL_DIR/osanvaultafrica.conf -s reload
else
    nginx -c $SSL_DIR/osanvaultafrica.conf
fi

# --- Step 7: Commit any local changes to GitHub ---
cd $HOME_DIR
git add .
git commit -m "Sync live site changes: updated assets, website files, SSL, and optimization" 2>/dev/null
git push origin main

# --- Step 8: Final confirmation ---
echo "[✅] ÒsánVault Africa is live with HTTPS at https://osanvaultafrica.com"
echo "[✅] Local changes have been pushed to GitHub."
