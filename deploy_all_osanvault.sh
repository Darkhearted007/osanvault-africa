#!/bin/bash
# ÒsánVault Africa - Unified Deploy Script
# Author: Olugbenga Ajayi
# Purpose: One-click deployment for production-ready site

set -e

DEPLOY_MSG="${1:-Deploy: $(date +'%Y-%m-%d %H:%M')}"

echo "🚀 Starting full deploy for ÒsánVault Africa..."
echo "Message: $DEPLOY_MSG"

# 1. Sync from repo (remove secrets before pushing)
echo "🔄 Syncing Git repo..."
git add .
git reset HEAD -- webhook_secret.txt || true
git reset HEAD -- api/* || true
git commit -m "$DEPLOY_MSG" || echo "⚠️ Nothing to commit"
git pull origin main --rebase || true
git push origin main || echo "⚠️ Push skipped"

# 2. Update HTML pages (latest brand info)
echo "📄 Updating web files..."
cp templates/index.html ./index.html
cp templates/about.html ./about.html
cp templates/roadmap.html ./roadmap.html
cp templates/tokenomics.html ./tokenomics.html
cp templates/properties.html ./properties.html
cp templates/contact.html ./contact.html
cp templates/osanvault-whitepaper.html ./osanvault-whitepaper.html

# 3. SEO: regenerate sitemap + robots.txt
echo "🔍 Regenerating sitemap & robots.txt..."
bash scripts/generate_sitemap_robots.sh || true

# 4. Ensure NGINX + SSL live
echo "🔑 Restarting NGINX with SSL..."
systemctl reload nginx || systemctl restart nginx

# 5. Deploy Analytics
echo "📊 Ensuring Google Analytics active..."
grep -q "G-96LEYX1WZG" index.html || \
sed -i '/<\/head>/i <script async src="https://www.googletagmanager.com/gtag/js?id=G-96LEYX1WZG"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-96LEYX1WZG");</script>' index.html

# 6. Finalize
echo "✅ ÒsánVault Africa successfully deployed at $(date)"
