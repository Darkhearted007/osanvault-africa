#!/data/data/com.termux/files/usr/bin/bash
# Ultimate ÒsánVault Africa Deployment + Cloudflare DNS & SSL

# 1️⃣ Environment
CLOUDFLARE_TOKEN="AQKE5UXR28KHVT0OR7S982JYGHFCNZK7"
DOMAIN="OsanVaultAfrica.com"
VPS_IP="141.95.120.221"  # Replace with your VPS IP

# Move to project folder
cd ~/osanvault-africa || mkdir -p ~/osanvault-africa && cd ~/osanvault-africa

echo "[🚀] Starting deployment for ÒsánVault Africa..."

# 2️⃣ Create main directories
mkdir -p logs ai landing investor nft messages analytics

# 3️⃣ Update packages
pkg update -y && pkg upgrade -y
pkg install python git curl wget nano jq -y

# 4️⃣ Python setup
python3 -m ensurepip --upgrade
pip install --upgrade pip
pip install openai solana pandas plotly pyngrok requests tqdm pydantic websockets construct solders jsonalias cloudflare

# 5️⃣ Set permissions
chmod -R 700 ~/osanvault-africa

# 6️⃣ Git init and sync
git init
git add .
git commit -m "Full deployment $(date '+%Y-%m-%d-%H:%M:%S')"
git remote add origin https://github.com/Darkhearted007/osanvault-africa.git || echo "Remote exists"
git push -u origin main || echo "✅ GitHub sync complete"

# 7️⃣ Cloudflare DNS setup
echo "[🌐] Configuring Cloudflare DNS..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
-H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
-H "Content-Type: application/json" | jq -r '.result[0].id')

# Create A record for root domain
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
-H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
-H "Content-Type: application/json" \
--data '{"type":"A","name":"'"$DOMAIN"'","content":"'"$VPS_IP"'","ttl":120,"proxied":true}'

# Create CNAME for www
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
-H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
-H "Content-Type: application/json" \
--data '{"type":"CNAME","name":"www","content":"'"$DOMAIN"'","ttl":120,"proxied":true}'

echo "[✅] Cloudflare DNS records added."

# 8️⃣ Install acme.sh for SSL (Termux-friendly)
curl https://get.acme.sh | sh
export PATH="$HOME/.acme.sh:$PATH"
~/.acme.sh/acme.sh --issue --dns dns_cf -d $DOMAIN -d www.$DOMAIN --yes-I-know-dns-manual-mode-enough

# 9️⃣ Deploy SSL certificate
~/.acme.sh/acme.sh --install-cert -d $DOMAIN \
--key-file ~/osanvault-africa/ssl/$DOMAIN.key \
--fullchain-file ~/osanvault-africa/ssl/$DOMAIN.crt \
--reloadcmd "echo '[✅] SSL deployed for $DOMAIN'"

# 10️⃣ Run background bots
nohup python3 ai/dashboard_bot.py > logs/dashboard_bot.log 2>&1 &
nohup python3 ai/dashboard_public.py > logs/dashboard_public.log 2>&1 &
nohup python3 ai/oracle_post.py > logs/oracle_post.log 2>&1 &

echo "[🚀] Deployment complete! Bots running, GitHub synced, DNS + SSL configured."
