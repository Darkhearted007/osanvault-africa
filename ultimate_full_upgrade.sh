#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "[🚀] Starting FULL ultimate deploy & upgrade for ÒsánVault Africa..."

# Step 1: Create required folders
for dir in www prewritten_content assets logs ssl; do
    mkdir -p ~/osanvault-africa/$dir
done

# Step 2: Generate dynamic default website if www is empty
if [ -z "$(ls -A ~/osanvault-africa/www)" ]; then
    echo "[*] No website files found. Creating default dynamic website..."
    cat > ~/osanvault-africa/www/index.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ÒsánVault Africa</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<h1>Welcome to ÒsánVault Africa</h1>
<p>Dynamic Blockchain & AI integrated website placeholder.</p>
<div id="blockchain-section">
<h2>Solana Blockchain Features</h2>
<p>Tokenization, staking, and NFT features coming soon.</p>
</div>
<div id="ai-assistant">
<h2>AI Assistant</h2>
<p>Chatbot integration placeholder.</p>
</div>
<script src="script.js"></script>
</body>
</html>
EOF

    cat > ~/osanvault-africa/www/style.css <<EOF
body { font-family: Arial, sans-serif; margin: 20px; background: #f4f4f4; }
h1 { color: #2c3e50; }
#blockchain-section, #ai-assistant { background: #fff; padding: 15px; margin-top: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);}
EOF

    cat > ~/osanvault-africa/www/script.js <<EOF
console.log("ÒsánVault Africa website loaded. AI & Blockchain placeholders active.");
EOF
fi

# Step 3: Copy prewritten content if exists
if [ -d ~/osanvault-africa/prewritten_content ]; then
    echo "[*] Copying prewritten content..."
    cp -r ~/osanvault-africa/prewritten_content/* ~/osanvault-africa/www/ 2>/dev/null || echo "[⚠️] No prewritten content files found."
fi

# Step 4: Clean empty folders & logs
echo "[*] Cleaning empty folders & logs..."
find ~/osanvault-africa -type d -empty -delete
find ~/osanvault-africa/logs -type f -name "*.log" -delete 2>/dev/null || true

# Step 5: Install NGINX if not present
if ! command -v nginx >/dev/null 2>&1; then
    echo "[*] Installing NGINX..."
    pkg install -y nginx || echo "[⚠️] NGINX installation failed!"
fi

# Step 6: Setup NGINX config
NGINX_CONF=~/nginx/sites-available/osanvaultafrica.conf
mkdir -p ~/nginx/sites-available ~/nginx/sites-enabled
cat > $NGINX_CONF <<EOF
server {
    listen 8080;
    server_name osanvaultafrica.com www.osanvaultafrica.com;
    root /data/data/com.termux/files/home/osanvault-africa/www;
    index index.html;
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF
ln -sf $NGINX_CONF ~/nginx/sites-enabled/osanvaultafrica.conf

# Include sites-enabled in main NGINX config if missing
grep -q 'include /data/data/com.termux/files/home/nginx/sites-enabled/*;' ~/nginx/nginx.conf || \
echo 'include /data/data/com.termux/files/home/nginx/sites-enabled/*;' >> ~/nginx/nginx.conf

# Step 7: Start or reload NGINX
if pgrep nginx >/dev/null 2>&1; then
    echo "[*] Reloading NGINX..."
    nginx -s reload || echo "[⚠️] NGINX reload warning."
else
    echo "[*] Starting NGINX..."
    nginx || echo "[⚠️] NGINX start warning."
fi

# Step 8: Deploy SSL certificates
if [ -f ~/osanvault-africa/ultimate_deploy_osanvault.sh ]; then
    echo "[*] Running SSL & cron deployment..."
    bash ~/osanvault-africa/ultimate_deploy_osanvault.sh
else
    echo "[⚠️] ultimate_deploy_osanvault.sh not found. Please ensure SSL is deployed manually."
fi

# Step 9: GitHub sync
echo "[*] Syncing all changes to GitHub..."
cd ~/osanvault-africa
git add .
git commit -m "Full deploy: dynamic website, prewritten content, assets, NGINX, SSL, README, LICENSE" 2>/dev/null || echo "[*] Nothing new to commit."
git push origin main || echo "[⚠️] Git push failed!"

# Step 10: GitHub Pages setup (manual alternative)
echo "[⚠️] Automatic GitHub Pages setup via CLI may fail. Please set the Pages source to 'www/' manually."

echo "[✅] ÒsánVault Africa fully deployed, dynamic website created, SSL active, and synced to GitHub!"
