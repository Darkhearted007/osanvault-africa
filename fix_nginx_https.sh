#!/data/data/com.termux/files/usr/bin/bash

# Termux-ready fix for ÒsánVault Africa HTTPS

# Paths
NGINX_CONF_DIR="$PREFIX/etc/nginx"
SITES_AVAILABLE="$NGINX_CONF_DIR/sites-available"
SITES_ENABLED="$NGINX_CONF_DIR/sites-enabled"
WEB_ROOT="$PREFIX/share/nginx/html/osanvaultafrica"
SSL_DIR="$HOME/osanvault-africa/ssl"

# Step 1: Install NGINX if not installed
if ! command -v nginx >/dev/null 2>&1; then
    echo "[*] Installing NGINX..."
    pkg update -y
    pkg install nginx -y
fi

# Step 2: Create directories
mkdir -p "$SITES_AVAILABLE" "$SITES_ENABLED" "$WEB_ROOT"

# Step 3: Create server block
CONF_FILE="$SITES_AVAILABLE/osanvaultafrica.conf"
cat > "$CONF_FILE" <<EOL
server {
    listen 80;
    server_name osanvaultafrica.com www.osanvaultafrica.com;

    root $WEB_ROOT;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }

    listen 443 ssl;
    ssl_certificate $SSL_DIR/osanvaultafrica.com.crt;
    ssl_certificate_key $SSL_DIR/osanvaultafrica.com.key;
}
EOL

# Step 4: Enable site
ln -sf "$CONF_FILE" "$SITES_ENABLED/osanvaultafrica.conf"

# Step 5: Create a test index.html if missing
if [ ! -f "$WEB_ROOT/index.html" ]; then
    echo "<h1>Welcome to ÒsánVault Africa!</h1>" > "$WEB_ROOT/index.html"
fi

# Step 6: Start or reload NGINX
if pgrep nginx >/dev/null 2>&1; then
    echo "[*] Reloading NGINX..."
    nginx -s reload
else
    echo "[*] Starting NGINX..."
    nginx
fi

echo "[✅] ÒsánVault Africa is live with HTTPS!"
