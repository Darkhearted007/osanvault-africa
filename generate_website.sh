#!/bin/bash
# ===============================================================
# ÒsánVault Africa: Auto Generate Latest Website Files
# Purpose: Drop fully responsive website directly into latest_files
# ===============================================================

# Navigate to project folder
cd /root/osanvault-africa || exit

# Create latest_files folder if missing
mkdir -p latest_files

# Clean old files
rm -rf latest_files/*

# Generate HTML pages, CSS, and JS automatically
cat <<'EOL' > latest_files/index.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ÒsánVault Africa</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header>
  <h1>Welcome to ÒsánVault Africa</h1>
  <nav>
    <a href="about.html">About</a>
    <a href="investor-dashboard.html">Investor Dashboard</a>
    <a href="token-audit.html">Token Audit</a>
  </nav>
</header>

<main>
  <section>
    <h2>Our Properties</h2>
    <div id="properties"></div>
  </section>
</main>

<footer>
  <p>© 2025 ÒsánVault Africa | All Rights Reserved</p>
</footer>

<script src="app.js"></script>
</body>
</html>
EOL

cat <<'EOL' > latest_files/style.css
body { font-family: Arial, sans-serif; margin:0; padding:0; line-height:1.6; }
header { background:#0a3d62; color:white; padding:1rem; text-align:center; }
nav a { margin:0 1rem; color:white; text-decoration:none; }
footer { background:#1e272e; color:white; padding:1rem; text-align:center; margin-top:2rem; }
main { padding:2rem; }
section { margin-bottom:2rem; }
@media(max-width:768px){ nav a{display:block;margin:0.5rem 0;} }
EOL

cat <<'EOL' > latest_files/app.js
console.log("🎉 ÒsánVault Africa website JS loaded");
EOL

echo "🎉 Fully responsive ÒsánVault Africa website generated in latest_files/"
