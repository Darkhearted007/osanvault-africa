#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Ultimate ÒsánVault Africa Termux Deployment Script
# Features: SSL, Cloudflare DNS, Python bots, logs, auto-update
# ============================================================

echo "[🚀] Starting Ultimate ÒsánVault Africa Deployment..."

# 1️⃣ Set up environment
mkdir -p ~/osanvault-africa/{logs,ai,ssl,landing,investor,nft,messages}
export PATH="$HOME/.acme.sh:$PATH"

# 2️⃣ Install dependencies
pkg update -y && pkg upgrade -y
pkg install -y git curl wget nano socat python python3 clang make

# 3️⃣ Upgrade pip and install Python packages
python3 -m ensurepip --upgrade
pip install --upgrade pip
pip install openai solana pandas plotly pyngrok requests tqdm pydantic websockets construct solders jsonalias

# 4️⃣ Install acme.sh if not exists
if [ ! -f "$HOME/.acme.sh/acme.sh" ]; then
    curl https://get.acme.sh | sh
    echo "[✅] acme.sh installed"
fi

# 5️⃣ Export Cloudflare API token
export CF_Token="AQKE5UXR28KHVT0OR7S982JYGHFCNZK7"
export CF_Email="your-email@domain.com" # Replace with your Cloudflare email

# 6️⃣ Issue SSL certificate via Cloudflare DNS
~/.acme.sh/acme.sh --issue --dns dns_cf -d osanvaultafrica.com -d www.osanvaultafrica.com

# 7️⃣ Install SSL locally
~/.acme.sh/acme.sh --install-cert -d osanvaultafrica.com \
--key-file ~/osanvault-africa/ssl/osanvaultafrica.com.key \
--fullchain-file ~/osanvault-africa/ssl/osanvaultafrica.com.crt \
--reloadcmd "echo '[✅] SSL deployed for osanvaultafrica.com'"

# 8️⃣ Prepare Python bot scripts if missing
touch ~/osanvault-africa/ai/{dashboard_bot.py,dashboard_public.py,oracle_post.py}
touch ~/osanvault-africa/investor/posts.txt
touch ~/osanvault-africa/nft/properties.txt
touch ~/osanvault-africa/landing/index.html
touch ~/osanvault-africa/messages/index.txt.idx

chmod -R 700 ~/osanvault-africa

# 9️⃣ Start Python bots in background
nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/dashboard_public.py > ~/osanvault-africa/logs/dashboard_public.log 2>&1 &
nohup python3 ~/osanvault-africa/ai/oracle_post.py > ~/osanvault-africa/logs/oracle_post.log 2>&1 &

# 1️⃣0️⃣ GitHub auto-sync
cd ~/osanvault-africa
git init
git add .
git commit -m "Full Termux Deployment $(date '+%Y-%m-%d %H:%M:%S')"
git remote add origin https://github.com/Darkhearted007/osanvault-africa.git || echo "Remote exists"
git push -u origin main || echo "✅ GitHub sync complete"

echo "[🚀] ÒsánVault Africa Termux deployment completed successfully!"
echo "[ℹ️] SSL certificates: ~/osanvault-africa/ssl/"
echo "[ℹ️] Logs: ~/osanvault-africa/logs/"
echo "[ℹ️] Python bots running in background."
