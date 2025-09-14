#!/bin/bash
# Auto-deploy ÒsánVault Africa with VPS SSH and GitHub sync

# Decrypt VPS password
VPS_PASSWORD=$(openssl enc -aes-256-cbc -d -pbkdf2 -a -in ~/osanvault-africa/.vps_pass.enc)

# SSH connect and auto-run commands on VPS
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no root@72.60.184.119 << 'ENDSSH'
mkdir -p ~/osanvault-africa
cd ~/osanvault-africa
git init || echo "Repo already exists"
git remote add origin https://github.com/Darkhearted007/osanvault-africa.git || echo "Remote exists"
git pull origin main
chmod -R 700 ~/osanvault-africa
nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/dashboard_public.py > ~/osanvault-africa/logs/dashboard_public.log 2>&1 &
ENDSSH
echo "✅ ÒsánVault Africa deployed on VPS and running in background!"
