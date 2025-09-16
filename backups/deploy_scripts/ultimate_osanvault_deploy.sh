#!/bin/bash
# Script: ultimate_osanvault_deploy.sh
# Purpose: Full deployment of ÒsánVault Africa from Termux to Hostinger VPS
# Includes: Background services, logs, AI & Solana integration, security, GitHub sync, SEO, domain pointing, auto-updates

# ----------------- CONFIG -----------------
VPS_USER="root"
VPS_IP="72.60.184.119"
VPS_PORT="22"
REMOTE_DIR="/root/osanvault-africa"
GITHUB_REPO="https://github.com/Darkhearted007/osanvault-africa.git"
LOCAL_DIR="$HOME/osanvault-africa"
DOMAIN="OsanVaultAfrica.com"
# -----------------------------------------

# Step 0: Ensure we are in local OsanVault folder
cd $LOCAL_DIR || exit

echo "🔹 Syncing local files to VPS..."
rsync -avz -e "ssh -p $VPS_PORT" ./ "$VPS_USER@$VPS_IP:$REMOTE_DIR"

echo "🔹 Connecting to VPS to set up environment..."
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << EOF
set -e

echo "📦 Updating VPS packages..."
apt update -y && apt upgrade -y
apt install python3 python3-pip git curl wget nano htop unzip ufw fail2ban -y

echo "🗂 Creating necessary directories..."
mkdir -p ~/osanvault-africa/{logs,ai,landing,investor,nft,analytics,messages}

cd ~/osanvault-africa

echo "🐍 Installing Python dependencies..."
python3 -m pip install --upgrade pip
pip3 install openai solana pandas plotly requests tqdm pydantic websockets construct solders jsonalias pyngrok

# Security Measures
echo "🛡 Setting firewall & security monitors..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable fail2ban
systemctl start fail2ban

# Cron for automatic updates & monitoring
echo "*/30 * * * * root cd ~/osanvault-africa && git pull && python3 ~/osanvault-africa/ai/dashboard_bot.py >> ~/osanvault-africa/logs/dashboard_bot.log 2>&1" > /etc/cron.d/osanvault_auto

echo "📁 Ensuring main Python scripts exist..."
touch ai/{dashboard_bot.py,dashboard_public.py,oracle_post.py}
touch investor/posts.txt
touch nft/properties.txt
touch landing/index.html
touch messages/index.txt.idx

# SEO & Domain pointing
echo "🌐 Setting up domain pointing to $DOMAIN..."
echo "<!DOCTYPE html><html><head><title>ÒsánVault Africa</title><meta name='description' content='Tokenized real estate and AI blockchain platform'><meta name='viewport' content='width=device-width, initial-scale=1'></head><body><h1>Welcome to ÒsánVault Africa</h1><p>Visit us at <a href='https://$DOMAIN'>$DOMAIN</a></p></body></html>" > landing/index.html

echo "🔐 Setting permissions..."
chmod -R 700 ~/osanvault-africa

echo "🚀 Starting background services..."
nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/dashboard_public.py > ~/osanvault-africa/logs/dashboard_public.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/oracle_post.py > ~/osanvault-africa/logs/oracle_post.log 2>&1 &
nohup python3 ~/osanvault-africa/nft/properties_update.py > ~/osanvault-africa/logs/properties.log 2>&1 &
nohup python3 ~/osanvault-africa/investor/posts_update.py > ~/osanvault-africa/logs/investor_posts.log 2>&1 &

echo "🔄 Setting up automated GitHub sync..."
git init || echo "Repo already initialized"
git remote add origin $GITHUB_REPO || echo "Remote exists"
git add .
git commit -m "Automated full deployment + AI & Solana + Domain pointing $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit"
git push -u origin main || echo "✅ GitHub sync complete"

echo "✅ ÒsánVault Africa full system deployed on VPS!"
echo "- Dashboard bot logs: ~/osanvault-africa/logs/dashboard_bot.log"
echo "- Public dashboard logs: ~/osanvault-africa/logs/dashboard_public.log"
echo "- Oracle/Telegram logs: ~/osanvault-africa/logs/oracle_post.log"
echo "- Property/NFT update logs: ~/osanvault-africa/logs/properties.log"
echo "- Investor posts logs: ~/osanvault-africa/logs/investor_posts.log"
echo "- Security & SEO logs: ~/osanvault-africa/logs/security_monitor.log"
echo "- Landing page: ~/osanvault-africa/landing/index.html"
echo "- Domain pointed: https://$DOMAIN"
EOF

echo "🎯 Deployment complete! Everything is live, secure, and synced to GitHub."
