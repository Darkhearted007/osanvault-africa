#!/data/data/com.termux/files/usr/bin/bash
while true; do
    if ! pgrep -x nginx >/dev/null; then
        echo "[INFO] Starting Nginx..."
        nginx -c /data/data/com.termux/files/home/www/osanvault-africa/nginx.conf
    fi
    sleep 5
done
