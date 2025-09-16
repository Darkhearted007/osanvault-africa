#!/bin/bash
# Ultimate deployment of ÒsánVault Africa on Ubuntu VPS
# Features:
# - SSH login using encrypted password
# - Fix Git dubious ownership errors
# - Auto-deploy all Python scripts in background
# - Setup NGINX to serve landing page
# - Automatic HTTPS with Let's Encrypt
# - Logs for all processes
# - Domain OsanVaultAfrica.com configured

# === STEP 1: Decrypt VPS password ===
VPS_PASSWORD=$(openssl enc -aes-256-cbc -d -pbkdf2 -a -in ~/osanvault-africa/.vps_pass.enc)

# === STEP 2: SSH to VPS and execute deployment ===
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no root@72.60.184.119 << 'ENDSSH'

# === STEP 2a: Prepare directories ===
mkdir -p ~/osanvault-africa/{logs,ai,landing,investor,nft,analytics,messages}
cd ~/osanvault-africa

# === STEP 2b: Fix Git dubious ownership ===
git config --global --add safe.directory /root/osanvault-africa

# === STEP 2c: Initialize repo if needed & pull latest code ===
git init || echo "Repo exists"
git remote add origin https://github.com/Darkhearted007/osanvault-africa.git || echo "Remote exists"
git pull origin main

# === STEP 2d: Set permissions ===
chmod -R 700 ~/osanvault-africa

# === STEP 2e: Install dependencies ===
apt update -y && apt upgrade -y
apt install -y python3 python3-pip git curl nginx certbot python3-certbot-nginx

pip3 install --upgrade pip openai solana pandas plotly pyngrok requests tqdm pydantic websockets construct solders jsonalias sshpass

# === STEP 2f: Start Python bots in background ===
nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/dashboard_public.py > ~/osanvault-africa/logs/dashboard_public.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/oracle_post.py > ~/osanvault-africa/logs/oracle_post.log 2>&1 &
nohup python3 ~/osanvault-africa/nft/properties_update.py > ~/osanvault-africa/logs/properties.log 2>&1 &
nohup python3 ~/osanvault-africa/investor/posts_update.py > ~/osanvault-africa/logs/investor_posts.log 2>&1 &

# === STEP 2g: Configure NGINX to serve landing page ===
cat > /etc/nginx/sites-available/osanvault << 'NGINXCONF'
server {
    listen 80;
    server_name OsanVaultAfrica.com www.OsanVaultAfrica.com;
    root /root/osanvault-africa/landing;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/osanvault /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# === STEP 2h: Obtain SSL certificate with Let's Encrypt ===
certbot --nginx -d OsanVaultAfrica.com -d www.OsanVaultAfrica.com --non-interactive --agree-tos -m olugbenga1000@gmail.com

# === STEP 2i: Setup auto-renewal for SSL ===
systemctl enable certbot.timer
systemctl start certbot.timer

ENDSSH

# === STEP 3: Confirm deployment complete ===
echo "✅ ÒsánVault Africa fully deployed on VPS with:"
echo "- Domain: OsanVaultAfrica.com"
echo "- HTTPS via Let's Encrypt"
echo "- Python bots running in background"
echo "- NGINX serving landing page"
echo "- GitHub sync enabled"
echo "- Logs available in ~/osanvault-africa/logs"
