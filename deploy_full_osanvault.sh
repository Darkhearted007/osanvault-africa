#!/data/data/com.termux/files/usr/bin/bash

# 1️⃣ Install NGINX
pkg update -y && pkg install nginx curl git jq nano socat -y

# 2️⃣ Create website directory
WEB_DIR="/data/data/com.termux/files/usr/share/nginx/html/osanvaultafrica"
mkdir -p $WEB_DIR

# 3️⃣ Copy website files (assumes you have a folder ~/osanvault-africa/www)
cp -r ~/osanvault-africa/www/* $WEB_DIR/

# 4️⃣ Install acme.sh for Cloudflare SSL
git clone https://github.com/acmesh-official/acme.sh.git ~/osanvault-africa/.acme.sh
bash ~/osanvault-africa/.acme.sh/acme.sh --install

# 5️⃣ Set Cloudflare API token and domain
export CF_Token="SMH3U0A56e63j5eGJabJGoIlR-UI6cMRvGPC4UOI"
export CF_Account_ID="YOUR_CLOUDFLARE_ACCOUNT_ID" # replace with your account ID
DOMAIN="osanvaultafrica.com"

# 6️⃣ Issue SSL using DNS mode
~/.acme.sh/acme.sh --issue --dns dns_cf -d $DOMAIN -d www.$DOMAIN

# 7️⃣ Install SSL to nginx folder
SSL_DIR=~/osanvault-africa/ssl
mkdir -p $SSL_DIR
~/.acme.sh/acme.sh --install-cert -d $DOMAIN \
  --key-file $SSL_DIR/$DOMAIN.key \
  --fullchain-file $SSL_DIR/$DOMAIN.crt \
  --reloadcmd "nginx -s reload"

# 8️⃣ Configure NGINX
NGINX_CONF="/data/data/com.termux/files/usr/etc/nginx/sites-available/$DOMAIN.conf"
mkdir -p /data/data/com.termux/files/usr/etc/nginx/sites-available
cat > $NGINX_CONF <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate $SSL_DIR/$DOMAIN.crt;
    ssl_certificate_key $SSL_DIR/$DOMAIN.key;

    root $WEB_DIR;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOL

# 9️⃣ Enable site
mkdir -p /data/data/com.termux/files/usr/etc/nginx/sites-enabled
ln -sf $NGINX_CONF /data/data/com.termux/files/usr/etc/nginx/sites-enabled/

# 🔟 Start NGINX
nginx

echo "[✅] ÒsánVault Africa deployed with HTTPS!"
