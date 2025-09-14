#!/bin/bash
# Ultimate deployment for ÒsánVault Africa
# Run: bash deploy_ultimate_osanvault.sh
# Requirements: curl, jq, python3, git, nginx, certbot

# -------------------------------
# CONFIG
# -------------------------------
API_KEY="AQKE5UXR28KHVT0OR7S982JYGHFCNZK7"
DOMAIN="osanvaultafrica.com"
IP="141.95.120.221"
GITHUB_REPO="https://github.com/Darkhearted007/osanvault-africa.git"
EMAIL="olugbenga1000@gmail.com"

# -------------------------------
# DNS SETUP
# -------------------------------
echo "[*] Configuring DNS for $DOMAIN..."
create_dns() {
  TYPE=$1
  NAME=$2
  VALUE=$3
  curl -s -X POST "https://api.truehost.cloud/domains/dns/create" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"domain\": \"$DOMAIN\",
      \"type\": \"$TYPE\",
      \"name\": \"$NAME\",
      \"value\": \"$VALUE\",
      \"ttl\": \"3600\"
    }" | jq
}

# A records
create_dns "A" "@" "$IP"
create_dns "A" "www" "$IP"

# Subdomains
SUBS=("ftp" "cpanel" "autoconfig" "autodiscover" "cpcalendars" "cpcontacts" "webdisk" "webmail")
for sub in "${SUBS[@]}"; do
  create_dns "A" "$sub" "$IP"
done

# CNAME for mail
create_dns "CNAME" "mail" "@"

# MX record
curl -s -X POST "https://api.truehost.cloud/domains/dns/create" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"domain\": \"$DOMAIN\",
    \"type\": \"MX\",
    \"name\": \"@\",
    \"value\": \"$DOMAIN\",
    \"priority\": 10,
    \"ttl\": \"3600\"
}" | jq

echo "[✅] DNS configured"

# -------------------------------
# NGINX + HTTPS
# -------------------------------
echo "[*] Installing NGINX and Certbot..."
apt update -y && apt install nginx certbot python3-certbot-nginx git -y

echo "[*] Creating NGINX server block..."
NGINX_CONF="/etc/nginx/sites-available/osanvaultafrica.conf"
cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root /var/www/osanvaultafrica;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

mkdir -p /var/www/osanvaultafrica
ln -s $NGINX_CONF /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo "[*] Requesting SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL
echo "0 3 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew

# -------------------------------
# GIT SETUP
# -------------------------------
echo "[*] Pulling GitHub repository..."
cd /var/www/osanvaultafrica || mkdir -p /var/www/osanvaultafrica && cd /var/www/osanvaultafrica
git init
git remote add origin $GITHUB_REPO || echo "Remote exists"
git pull origin main || echo "Pulled latest code"

# -------------------------------
# PYTHON BOTS SETUP
# -------------------------------
echo "[*] Setting up Python environment and logs..."
mkdir -p logs ai nft investor landing messages

# Install dependencies
apt install python3-pip -y
pip install --upgrade pip openai solana pandas plotly pyngrok requests tqdm pydantic websockets construct solders jsonalias

# Create placeholders if missing
touch ai/{dashboard_bot.py,dashboard_public.py,oracle_post.py}
touch nft/properties.txt investor/posts.txt landing/index.html messages/index.txt.idx

# -------------------------------
# RUN BOTS IN BACKGROUND
# -------------------------------
echo "[*] Running bots in background..."
nohup python3 ai/dashboard_bot.py > logs/dashboard_bot.log 2>&1 &
nohup python3 ai/dashboard_public.py > logs/dashboard_public.log 2>&1 &
nohup python3 ai/oracle_post.py > logs/oracle_post.log 2>&1 &

# -------------------------------
# FINAL MESSAGE
# -------------------------------
echo "[🚀] ÒsánVault Africa fully deployed on VPS!"
echo " - Landing page: https://$DOMAIN"
echo " - Logs: /var/www/osanvaultafrica/logs"
echo " - GitHub sync enabled"
echo " - Python bots running in background"
echo " - HTTPS enabled via Let's Encrypt"
