#!/bin/bash

echo "🔹 Starting ÒsánVault Africa auto-maintenance..."

# 1️⃣ Check Nginx status
echo "[INFO] Checking Nginx status..."
systemctl is-active --quiet nginx
if [ $? -ne 0 ]; then
    echo "[WARN] Nginx is not running. Starting..."
    systemctl start nginx
else
    echo "[OK] Nginx is running."
fi

# 2️⃣ Test Nginx configuration
echo "[INFO] Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    echo "[ERROR] Nginx configuration invalid. Exiting."
    exit 1
fi

# 3️⃣ Reload Nginx
echo "[INFO] Reloading Nginx..."
systemctl reload nginx

# 4️⃣ Ensure firewall allows ports 80 & 443
echo "[INFO] Checking firewall rules..."
ufw allow 80
ufw allow 443
ufw reload

# 5️⃣ Renew SSL certificates
echo "[INFO] Renewing SSL certificates..."
certbot renew --quiet

# 6️⃣ Restart Nginx to apply any SSL changes
echo "[INFO] Restarting Nginx..."
systemctl restart nginx

# 7️⃣ Test HTTP & HTTPS connectivity
echo "[INFO] Testing connectivity..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://osanvaultafrica.com)
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://osanvaultafrica.com)

echo "[INFO] HTTP status: $HTTP_STATUS"
echo "[INFO] HTTPS status: $HTTPS_STATUS"

if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "301" ]] && [[ "$HTTPS_STATUS" == "200" || "$HTTPS_STATUS" == "301" ]]; then
    echo "✅ Website is live and secure."
else
    echo "⚠️ Warning: Website may not be fully reachable!"
fi

echo "🔹 Auto-maintenance complete."
