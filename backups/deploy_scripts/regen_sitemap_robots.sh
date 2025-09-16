#!/bin/bash
# Regenerate sitemap.xml and robots.txt

SITE_DIR="/var/www/osanvaultafrica"
SITEMAP="$SITE_DIR/sitemap.xml"
ROBOTS="$SITE_DIR/robots.txt"

echo "📂 Generating sitemap for $SITE_DIR ..."

cat > "$SITEMAP" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.osanvaultafrica.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.osanvaultafrica.com/about.html</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.osanvaultafrica.com/roadmap.html</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.osanvaultafrica.com/tokenomics.html</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.osanvaultafrica.com/contact.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.osanvaultafrica.com/investor/</loc>
    <priority>0.8</priority>
  </url>
</urlset>
EOF

cat > "$ROBOTS" << 'EOF'
User-agent: *
Allow: /

Sitemap: https://www.osanvaultafrica.com/sitemap.xml
EOF

# Set permissions
chown www-data:www-data "$SITEMAP" "$ROBOTS"
chmod 644 "$SITEMAP" "$ROBOTS"

# Reload Nginx (optional)
nginx -s reload

echo "✅ Sitemap and robots.txt regenerated!"
