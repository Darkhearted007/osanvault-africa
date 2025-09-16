#!/bin/bash
set -e

echo "🚀 Starting Òsánvault Africa Website Auto-Update with Analytics..."

# Ensure backup folder exists
mkdir -p backup

# Move all old scripts to backup (except this one)
find . -maxdepth 1 -type f -name "*.sh" ! -name "osanvault-update.sh" -exec mv {} backup/ \;
echo "📦 Old scripts moved to backup/"

# Ensure templates folder exists
mkdir -p templates

# Define Analytics script
GA_TAG='<script async src="https://www.googletagmanager.com/gtag/js?id=G-96LEYX1WZG"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-96LEYX1WZG");
</script>'

# Write new website files
echo "📝 Rebuilding website files with GA..."

cat > templates/index.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Òsánvault Africa | Tokenized Real Estate Investment</title>
  <meta name="description" content="Òsánvault Africa - Africa's #1 Tokenized Real Estate Investment Web3 Platform. Invest in fractional properties using the NigeriaEstate Token (NET).">
  $GA_TAG
</head>
<body>
  <h1>Welcome to Òsánvault Africa</h1>
  <p>Own a piece of Africa, one property at a time. Powered by the NigeriaEstate Token (NET).</p>
  <nav>
    <a href="about.html">About</a> | 
    <a href="roadmap.html">Roadmap</a> | 
    <a href="tokenomics.html">Tokenomics</a> | 
    <a href="contact.html">Contact</a>
  </nav>
</body>
</html>
EOF

cat > templates/about.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>About Òsánvault Africa</title>
  $GA_TAG
</head>
<body>
  <h1>About Òsánvault Africa</h1>
  <p>Òsánvault Africa is the #1 Tokenized Real Estate Web3 platform in Africa, enabling investors worldwide to own fractions of premium properties using NigeriaEstate Token (NET).</p>
</body>
</html>
EOF

cat > templates/roadmap.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Òsánvault Africa Roadmap</title>
  $GA_TAG
</head>
<body>
  <h1>Roadmap</h1>
  <ul>
    <li>✅ Q3 2025: Platform launch</li>
    <li>🚀 Q4 2025: Onboard 10 properties</li>
    <li>🌍 2026: Expand to multiple African countries</li>
    <li>💰 2027: Full DAO governance and yield vaults</li>
  </ul>
</body>
</html>
EOF

cat > templates/tokenomics.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Òsánvault Africa Tokenomics</title>
  $GA_TAG
</head>
<body>
  <h1>Tokenomics</h1>
  <p><strong>Token:</strong> NigeriaEstate Token (NET)</p>
  <p><strong>Total Supply:</strong> 1 Billion NET</p>
  <p><strong>Utility:</strong> Property ownership, governance, staking, yield vaults, swaps.</p>
</body>
</html>
EOF

cat > templates/contact.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Òsánvault Africa</title>
  $GA_TAG
</head>
<body>
  <h1>Contact Us</h1>
  <p>Email: info@osanvaultafrica.com</p>
  <p>Telegram: @OsanVaultAfrica</p>
</body>
</html>
EOF

echo "✅ Website files updated with Google Analytics!"

# Commit and push
git add .
git commit -m "🚀 Auto-update: Òsánvault Africa website latest build + GA tracking"
git push origin main

echo "🎯 Update complete! Òsánvault Africa is now synced & tracking traffic with GA."
