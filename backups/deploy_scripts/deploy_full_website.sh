#!/bin/bash
# ===============================================================
# ÒsánVault Africa: Full VPS Deployment Script
# ===============================================================

# ------------------------
# Configurable Variables
# ------------------------
PROJECT_DIR="/root/osanvault-africa"
LATEST_FILES_DIR="$PROJECT_DIR/latest_files"
SOL_WALLET="7rDzXgyZhNEZT9KFoNowL7fo8cbdryg8RnVUhuN2MjXd"
CLOUDFLARE_API_TOKEN="9DYEMLE6FXgNCuaPnbD02IlgOm1mxC47EGZ2HeiY"
CLOUDFLARE_ZONE_ID="4ba54edd079497a4ff34fa2d6f8f07a9"

# ------------------------
# Helper Functions
# ------------------------
function log() { echo -e "\n🚀 $1"; }

# ------------------------
# Step 1: Check .env and required files
# ------------------------
log "Checking environment..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "❌ .env file not found! Please create it before running this script."
  exit 1
fi

if [ -z "$SOL_WALLET" ]; then
  echo "❌ SOL_WALLET not defined!"
  exit 1
fi

# ------------------------
# Step 2: Copy latest files
# ------------------------
log "Copying latest website files..."
mkdir -p "$LATEST_FILES_DIR"
cp -r $PROJECT_DIR/latest_files/* $PROJECT_DIR/ || log "⚠️ Warning: Could not copy all files."

# ------------------------
# Step 3: Start/Restart PM2 Services
# ------------------------
log "Restarting PM2 services..."
pm2 start $PROJECT_DIR/server.js --name osanvault-africa --update-env || pm2 restart osanvault-africa --update-env
pm2 start $PROJECT_DIR/webhook.js --name osanvault-webhook --update-env || pm2 restart osanvault-webhook --update-env
pm2 start $PROJECT_DIR/website.js --name osanvault-website --update-env || pm2 restart osanvault-website --update-env
pm2 save

# ------------------------
# Step 4: Purge Cloudflare cache
# ------------------------
log "Purging Cloudflare cache..."
CF_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

if echo $CF_RESPONSE | grep -q '"success":true'; then
  log "✅ Cloudflare cache purged successfully!"
else
  log "⚠️ Cloudflare purge failed:"
  echo $CF_RESPONSE
fi

# ------------------------
# Step 5: Verify NET Token in Wallet
# ------------------------
log "Checking NET token in wallet ($SOL_WALLET)..."
SOL_BALANCE=$(solana balance $SOL_WALLET 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "💰 SOL Balance: $SOL_BALANCE"
else
  echo "⚠️ Wallet not found or network error!"
fi

# Optional: Check token balance (requires spl-token CLI installed)
TOKEN_BALANCE=$(spl-token accounts --owner $SOL_WALLET 2>/dev/null)
echo "🔹 NET token holdings:"
echo "$TOKEN_BALANCE"

# ------------------------
# Step 6: Finish
# ------------------------
log "🎉 ÒsánVault Africa fully deployed and operational!"
log "📂 Latest files: $LATEST_FILES_DIR"
log "🔗 Dashboard: http://<your_server_ip>:<PORT>/investor-dashboard.html"
log "🔗 Token audit: http://<your_server_ip>:<PORT>/token-audit.html"

exit 0
