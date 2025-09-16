#!/bin/bash
# ===============================================================
# ÒsánVault Africa: Deploy latest website + PM2 + Cloudflare purge
# ===============================================================

# Variables (from memory)
CLOUDFLARE_API_TOKEN="9DYEMLE6FXgNCuaPnbD02IlgOm1mxC47EGZ2HeiY"
CLOUDFLARE_ZONE_ID="4ba54edd079497a4ff34fa2d6f8f07a9"
PROJECT_DIR="/root/osanvault-africa"
LATEST_FILES_DIR="$PROJECT_DIR/latest_files"

echo "🚀 Deploying ÒsánVault Africa..."

# Navigate to project
cd "$PROJECT_DIR" || exit

# Force-restart PM2 servers
echo "🔄 Restarting PM2 servers..."
pm2 restart all -f
pm2 save

# Copy latest files to live folder
echo "📂 Copying latest website files..."
cp -r "$LATEST_FILES_DIR"/* "$PROJECT_DIR"/

# Purge Cloudflare cache
echo "🧹 Purging Cloudflare cache..."
response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
-H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
-H "Content-Type: application/json" \
--data '{"purge_everything":true}')

success=$(echo "$response" | jq -r '.success')

if [ "$success" == "true" ]; then
  echo "✅ Cloudflare cache purged successfully!"
else
  echo "❌ Cloudflare purge failed:"
  echo "$response"
fi

echo "🎉 Deployment complete!"
