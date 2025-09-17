mkdir -p ~/osanvault-africa/{scripts,assets,backups}

cat > ~/osanvault-africa/scripts/update-all-pages.sh <<'EOF'
#!/bin/bash
set -euo pipefail

echo "🔄 Starting ÒsánVault Africa full update..."

ASSETS_DIR="$HOME/osanvault-africa/assets"
BACKUP_DIR="$HOME/osanvault-africa/backups"
PAGES_DIR="$HOME/osanvault-africa"
ROBOTS_FILE="$PAGES_DIR/robots.txt"

# Ensure assets exist
if [ -d "$HOME/osanvault-assets/images" ]; then
  cp -r "$HOME/osanvault-assets/images/"* "$ASSETS_DIR/" 2>/dev/null || true
  echo "✅ Assets copied into $ASSETS_DIR"
else
  echo "⚠️ No new assets found. Skipping copy."
fi

# Pages to update
PAGES=("index.html" "about.html" "roadmap.html" "tokenomics.html" "contact.html")

# Inject SEO + banners into each page
for page in "${PAGES[@]}"; do
  if [ -f "$PAGES_DIR/$page" ]; then
    cp "$PAGES_DIR/$page" "$BACKUP_DIR/$page.$(date +%Y%m%d-%H%M%S).bak"
    echo "🔒 Backed up $page"

    # Add meta + og tags
    sed -i '/<head>/a \
    <meta name="description" content="ÒsánVault Africa — Own a piece of Nigeria, one piece at a time.">\
    <meta property="og:image" content="assets/osanvault-cover.svg">\
    <meta property="og:title" content="ÒsánVault Africa">\
    <meta property="og:description" content="Tokenized Real Estate & Minerals Platform">' "$PAGES_DIR/$page"

    # Inject banners per page
    case "$page" in
      index.html)
        sed -i '/<body>/a <img src="assets/banner-home.svg" alt="ÒsánVault Home Banner" class="banner">' "$PAGES_DIR/$page"
        ;;
      about.html)
        sed -i '/<body>/a <img src="assets/banner-about.svg" alt="About ÒsánVault" class="banner">' "$PAGES_DIR/$page"
        ;;
      roadmap.html)
        sed -i '/<body>/a <img src="assets/banner-roadmap.svg" alt="ÒsánVault Roadmap" class="banner">' "$PAGES_DIR/$page"
        ;;
      tokenomics.html)
        sed -i '/<body>/a <img src="assets/banner-tokenomics.svg" alt="ÒsánVault Tokenomics" class="banner">' "$PAGES_DIR/$page"
        ;;
      contact.html)
        sed -i '/<body>/a <img src="assets/banner-contact.svg" alt="Contact ÒsánVault" class="banner">' "$PAGES_DIR/$page"
        ;;
    esac

    echo "✨ Updated $page"
  else
    echo "⚠️ $page not found. Skipping..."
  fi
done

# Generate robots.txt
echo "User-agent: *" > "$ROBOTS_FILE"
echo "Allow: /" >> "$ROBOTS_FILE"
echo "✅ robots.txt updated"

# Skip Next.js files if not present
if [ -f "$PAGES_DIR/pages/_document.tsx" ]; then
  echo "✨ Updating Next.js _document.tsx..."
  sed -i '/<Head>/a <meta name="theme-color" content="#004aad" />' "$PAGES_DIR/pages/_document.tsx"
else
  echo "⚠️ _document.tsx not found. Skipping..."
fi

echo "🚀 ÒsánVault Africa update complete!"
EOF

chmod +x ~/osanvault-africa/scripts/update-all-pages.sh
~/osanvault-africa/scripts/update-all-pages.sh
