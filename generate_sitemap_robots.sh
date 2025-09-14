#!/bin/bash
# ============================================================
# Script: generate_sitemap_robots.sh
# Purpose: Generate sitemap.xml and robots.txt for ÒsánVault Africa
# Author: Olugbenga Ajayi
# ============================================================

# Define web root
WEB_ROOT="/var/www/osanvaultafrica"

# Generate sitemap.xml
cat > "$WEB_ROOT/sitemap.xml" << 'EOF'
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

# Generate robots.txt
cat > "$WEB_ROOT/robots.txt" << 'EOF'
User-agent: *
Allow: /

Sitemap: https://www.osanvaultafrica.com/sitemap.xml
EOF

# Set permissions
chown www-data:www-data "$WEB_ROOT/sitemap.xml" "$WEB_ROOT/robots.txt"
chmod 644 "$WEB_ROOT/sitemap.xml" "$WEB_ROOT/robots.txt"

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

# Confirmation
echo "✅ Sitemap and robots.txt generated and Nginx reloaded!"
echo "Check sitemap: https://www.osanvaultafrica.com/sitemap.xml"
echo "Check robots.txt: https://www.osanvaultafrica.com/robots.txt"
