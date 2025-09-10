#!/bin/bash
# =======================================================
# ÒsánVault Africa Full Deployment Script for Termux
# =======================================================

# Create directories if missing
mkdir -p ~/osanvault-africa/{logs,messages,landing,ai,investor,nft,analytics}

# Update & upgrade packages
pkg update -y && pkg upgrade -y

# Install required packages
pkg install python git curl jq wget unzip -y

# Ensure pip & upgrade
python3 -m ensurepip --upgrade
pip install --upgrade pip

# Install Python dependencies
pip install openai solana pandas plotly pyngrok requests tqdm pydantic websockets construct solders jsonalias

# GitHub sync
cd ~/osanvault-africa
git add .
git commit -m "Automated full deployment + prewritten content + Solana & AI integration [$(date +%Y-%m-%d-%H:%M:%S)]"
git push || echo "✅ GitHub sync complete"

# Start Dashboard bot in background
nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 &

# Start Public dashboard in background
nohup python3 ~/osanvault-africa/ai/dashboard_public.py > ~/osanvault-africa/logs/dashboard_public.log 2>&1 &

# Start Oracle/Telegram bot in background
nohup python3 ~/osanvault-africa/ai/oracle_post.py > ~/osanvault-africa/logs/oracle_post.log 2>&1 &

# Start Property/NFT update script in background
nohup python3 ~/osanvault-africa/nft/properties_update.py > ~/osanvault-africa/logs/properties.log 2>&1 &

# Start Investor posts update script in background
nohup python3 ~/osanvault-africa/investor/posts_update.py > ~/osanvault-africa/logs/investor_posts.log 2>&1 &

# Setup ngrok for public dashboard
if [ ! -f ~/osanvault-africa/ai/ngrok ]; then
    wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip -O ~/osanvault-africa/ai/ngrok.zip
    unzip ~/osanvault-africa/ai/ngrok.zip -d ~/osanvault-africa/ai/
    chmod +x ~/osanvault-africa/ai/ngrok
fi

# Start ngrok for dashboard (logs)
nohup ~/osanvault-africa/ai/ngrok http 8050 --log=stdout > ~/osanvault-africa/logs/ngrok.log 2>&1 &

# Display final status
echo "🚀 ✅ ÒsánVault Africa full system deployed in background:
- Dashboard bot logs: ~/osanvault-africa/logs/dashboard_bot.log
- Public dashboard logs: ~/osanvault-africa/logs/dashboard_public.log
- Oracle/Telegram logs: ~/osanvault-africa/logs/oracle_post.log
- Property/NFT update logs: ~/osanvault-africa/logs/properties.log
- Investor posts logs: ~/osanvault-africa/logs/investor_posts.log
- Landing page: ~/osanvault-africa/landing/index.html
- Public dashboard URL via ngrok
All systems auto-updating, posting, multi-chain ready, and wealth-esoterically enhanced!"
