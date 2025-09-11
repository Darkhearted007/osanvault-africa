#!/data/data/com.termux/files/usr/bin/bash
while true; do
    if ! pgrep -x nginx > /dev/null; then
        echo "[INFO] Starting Nginx..."
        nginx -c ~/www/osanvault-africa/nginx.conf
    fi
    sleep 10
done
