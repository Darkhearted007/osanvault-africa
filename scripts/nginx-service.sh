#!/data/data/com.termux/files/usr/bin/bash
NGINX_CONF="$HOME/www/nginx.conf"
while true; do
    if ! pgrep -x nginx > /dev/null; then
        echo "[INFO] Nginx not running, starting..."
        nginx -c "$NGINX_CONF" || echo "[WARN] Failed to start Nginx, retrying in 10s..."
    fi
    sleep 10
done
