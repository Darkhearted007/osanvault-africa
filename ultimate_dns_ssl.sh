#!/bin/bash
# Ultimate DNS & SSL Setup for OsanVaultAfrica.com
# Requirements: curl, jq, certbot, nginx
# Usage: bash ultimate_dns_ssl.sh

API_KEY="AQKE5UXR28KHVT0OR7S982JYGHFCNZK7"
DOMAIN="osanvaultafrica.com"
IP="141.95.120.221"

echo "[*] Configuring DNS for $DOMAIN..."

# Function to create DNS record
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

# Main A records
create_dns "A" "@" "$IP"
create_dns "A" "www" "$IP"

# Optional subdomains
SUBS=("ftp" "cpanel" "autoconfig" "autodiscover" "cpcalendars" "cpcontacts" "webdisk" "webmail")
for sub in "${SUBS[@]}"; do
    create_dns "A" "$sub" "$IP"
done

# CNAME record for mail
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

echo "[✅] DNS configuration completed for $DOMAIN"

# -----------------------------------------
# NGINX + HTTPS Setup
# -----------------------------------------
echo "[*] Installing NGINX and Certbot..."
apt update -y && apt install nginx certbot python3-certbot-nginx -y

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
echo "<h1>Welcome to ÒsánVault Africa</h1>" > /var/www/osanvaultafrica/index.html

ln -s $NGINX_CONF /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# -----------------------------------------
# Let's Encrypt SSL
# -----------------------------------------
echo "[*] Requesting SSL certificate with Certbot..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m olugbenga1000@gmail.com

# Auto-renewal
echo "0 3 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew

echo "[🚀] ÒsánVault Africa is live with HTTPS!"
