#!/bin/bash
# ===============================================================
# ÒsánVault Africa: Full Website Generator & GitHub Sync
# Pulls real estate API, generates latest files, investor dashboard
# ===============================================================

cd /root/osanvault-africa || exit

mkdir -p latest_files logs

# Load .env vars
if [ ! -f ".env" ]; then
    echo "❌ .env file missing!"
    exit 1
fi
export $(grep -v '^#' .env | xargs)

# Fail if wallet is missing
if [ -z "$NET_TOKEN_MINT" ] || [ -z "$OWNER_WALLET" ]; then
    echo "❌ NET_TOKEN_MINT or OWNER_WALLET not defined in .env"
    exit 1
fi

echo "🚀 Starting ÒsánVault Africa website generation..."

# ---------- Fetch Real Estate Data ----------
REAL_ESTATE_API_URL="https://api.example.com/properties?limit=20&apikey=$REAL_ESTATE_API_KEY"

PROPERTIES_JSON=$(curl -s "$REAL_ESTATE_API_URL")
if [ -z "$PROPERTIES_JSON" ] || [ "$PROPERTIES_JSON" == "[]" ]; then
    echo "⚠️ Real estate API returned empty data, using placeholder properties"
    PROPERTIES_JSON='[
        {"title":"Sample Property 1","description":"Beautiful estate in Lagos","price":1000000},
        {"title":"Sample Property 2","description":"Modern apartment in Abuja","price":1500000}
    ]'
    echo "$(date) - Real estate API failed or empty" >> logs/real_estate_api.log
else
    echo "📡 Pulled $(echo "$PROPERTIES_JSON" | jq length) properties from API"
fi

# ---------- Generate index.html ----------
cat <<EOL > latest_files/index.html
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
    <h2>Featured Properties</h2>
    <ul>
EOL

# Loop through properties and insert into index.html
echo "$PROPERTIES_JSON" | jq -c '.[]' | while read prop; do
    TITLE=$(echo "$prop" | jq -r '.title')
    DESC=$(echo "$prop" | jq -r '.description')
    PRICE=$(echo "$prop" | jq -r '.price')
    echo "      <li><strong>$TITLE</strong>: $DESC - ₦$PRICE</li>" >> latest_files/index.html
done

cat <<'EOL' >> latest_files/index.html
    </ul>
  </section>
</main>
<footer>
  <p>© ÒsánVault Africa</p>
</footer>
</body>
</html>
EOL

# ---------- Generate about.html ----------
cat <<EOL > latest_files/about.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About ÒsánVault Africa</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header><h1>About ÒsánVault Africa</h1></header>
<main>
<p>ÒsánVault Africa is Africa's premier tokenized real estate platform. Fractional ownership and investment transparency are core to our mission.</p>
</main>
<footer><p>© ÒsánVault Africa</p></footer>
</body>
</html>
EOL

# ---------- Generate investor-dashboard.html ----------
cat <<EOL > latest_files/investor-dashboard.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Investor Dashboard</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header><h1>Investor Dashboard</h1></header>
<main>
<ul>
EOL

# Loop through properties and calculate fractionation (example)
echo "$PROPERTIES_JSON" | jq -c '.[]' | while read prop; do
    TITLE=$(echo "$prop" | jq -r '.title')
    PRICE=$(echo "$prop" | jq -r '.price')
    # Example: 1 NET token = 100,000 NGN fraction
    FRACTION=$(echo "scale=2; $PRICE/100000" | bc)
    echo "  <li>$TITLE - Price: ₦$PRICE - Fractional NET Tokens: $FRACTION</li>" >> latest_files/investor-dashboard.html
done

cat <<'EOL' >> latest_files/investor-dashboard.html
</ul>
</main>
<footer><p>© ÒsánVault Africa</p></footer>
</body>
</html>
EOL

# ---------- Generate token-audit.html ----------
cat <<EOL > latest_files/token-audit.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Token Audit</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header><h1>Token Audit</h1></header>
<main>
<p>View the token audit here: <a href="https://osanvaultafrica.com/token-audit/$OWNER_WALLET" target="_blank">Token Audit</a></p>
</main>
<footer><p>© ÒsánVault Africa</p></footer>
</body>
</html>
EOL

# ---------- Generate style.css ----------
cat <<'EOL' > latest_files/style.css
body { font-family: Arial, sans-serif; margin:0; padding:0; }
header { background:#004080; color:white; padding:1rem; }
nav a { color:white; margin-right:1rem; text-decoration:none; }
main { padding:1rem; }
footer { background:#eee; padding:1rem; text-align:center; margin-top:2rem; }
ul { list-style:none; padding:0; }
li { margin-bottom:0.5rem; }
EOL

# ---------- GitHub Sync ----------
git add latest_files/
git commit -m "Auto-update latest website files with investor dashboard and token info"
git push origin main

echo "🎉 ÒsánVault Africa fully updated and GitHub synced!"
echo "✅ Latest files are in /root/osanvault-africa/latest_files/"
