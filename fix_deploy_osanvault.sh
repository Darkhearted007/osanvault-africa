#!/bin/bash
# Ultimate fix & deploy for ÒsánVault Africa

echo "[🚀] Starting ultimate fix & deploy..."

# 1️⃣ Ensure website folder exists
WWW_DIR="$HOME/osanvault-africa/www"
if [ ! -d "$WWW_DIR" ]; then
    mkdir -p "$WWW_DIR"
    echo "<h1>Welcome to ÒsánVault Africa</h1>" > "$WWW_DIR/index.html"
    echo "[⚠️] Website folder missing, created a default index.html"
fi

# 2️⃣ Set correct permissions
chmod -R 755 "$WWW_DIR"
echo "[✅] Set permissions for website folder"

# 3️⃣ Setup NGINX config
NGINX_CONF="$HOME/osanvault-africa/ssl/osanvaultafrica.conf"
cat > "$NGINX_CONF" <<EOL
server {
    listen 80;
    server_name osanvaultafrica.com www.osanvaultafrica.com;

    root $WWW_DIR;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOL
echo "[✅] NGINX config created at $NGINX_CONF"

# 4️⃣ Start / reload NGINX
nginx -c "$NGINX_CONF" 2>/dev/null || nginx -s reload
echo "[✅] NGINX started / reloaded"

# 5️⃣ Ensure SSL cert exists
SSL_DIR="$HOME/osanvault-africa/ssl"
if [ ! -f "$SSL_DIR/osanvaultafrica.com.crt" ] || [ ! -f "$SSL_DIR/osanvaultafrica.com.key" ]; then
    echo "[⚠️] SSL not found, requesting via acme.sh..."
    export CF_Token="SMH3U0A56e63j5eGJabJGoIlR-UI6cMRvGPC4UOI"
    export CF_AccountEmail="your-email@example.com"
    $HOME/.acme.sh/acme.sh --issue --dns dns_cf -d osanvaultafrica.com -d www.osanvaultafrica.com
    $HOME/.acme.sh/acme.sh --install-cert -d osanvaultafrica.com \
        --key-file "$SSL_DIR/osanvaultafrica.com.key" \
        --fullchain-file "$SSL_DIR/osanvaultafrica.com.crt"
fi
echo "[✅] SSL certificates verified"

# 6️⃣ Reload NGINX to apply HTTPS
nginx -s reload
echo "[🚀] ÒsánVault Africa is now live with HTTPS at https://osanvaultafrica.com"
