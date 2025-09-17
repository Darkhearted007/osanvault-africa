#!/bin/bash
set -euo pipefail

PROJECT_DIR=~/osanvault-africa
ASSET_DIR=$PROJECT_DIR/assets   # <-- use your existing assets folder
BACKUP_DIR=$PROJECT_DIR/backups
PUBLIC_DIR=$PROJECT_DIR/public/images

GA_ID="G-96LEYX1WZG"

echo "🔄 Starting ÒsánVault Africa update..."

# Ensure dirs
mkdir -p "$BACKUP_DIR"
mkdir -p "$PUBLIC_DIR"

# Copy assets
if compgen -G "$ASSET_DIR/*" > /dev/null; then
  cp -r $ASSET_DIR/* $PUBLIC_DIR/
  echo "📸 Assets copied to public/images"
else
  echo "⚠️ No assets found in $ASSET_DIR"
fi

# --- Backup helper ---
backup_file() {
  local file=$1
  if [[ -f "$file" ]]; then
    cp "$file" "$BACKUP_DIR/$(basename $file).$(date +%Y%m%d-%H%M%S).bak"
    echo "🔒 Backed up $file"
  fi
}

# --- SEO / OG Meta Injection ---
inject_meta() {
  local file=$1
  backup_file "$file"

  sed -i '/<head>/a \
  <meta name="description" content="ÒsánVault Africa – Own a piece of Nigeria, one piece at a time. Tokenized real estate, land banking, REITs, lending, and mineral resources."> \
  <meta property="og:title" content="ÒsánVault Africa"> \
  <meta property="og:description" content="Fractional property investment and Web3 real estate infrastructure for Africa."> \
  <meta property="og:image" content="/images/osanvault-cover.svg"> \
  <meta property="og:type" content="website">' "$file"

  echo "✨ Injected SEO meta into $(basename $file)"
}

# --- GA Injection ---
inject_ga() {
  local file=$1
  backup_file "$file"

  sed -i "/<head>/a <script async src=\"https://www.googletagmanager.com/gtag/js?id=$GA_ID\"></script>" "$file"
  sed -i "/<head>/a <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '$GA_ID');</script>" "$file"

  echo "📊 Google Analytics injected into $(basename $file)"
}

# --- Update all pages ---
for page in index.html about.html roadmap.html tokenomics.html contact.html; do
  if [[ -f "$PROJECT_DIR/$page" ]]; then
    inject_meta "$PROJECT_DIR/$page"
    inject_ga "$PROJECT_DIR/$page"
  fi
done

# --- Robots.txt ---
ROBOTS_FILE=$PROJECT_DIR/public/robots.txt
mkdir -p $(dirname $ROBOTS_FILE)

cat <<EOF > $ROBOTS_FILE
User-agent: *
Allow: /
Sitemap: https://osanvaultafrica.com/sitemap.xml
EOF
echo "🤖 robots.txt updated"

echo "✅ All updates completed successfully!"
