#!/bin/bash
# ===============================================================
# ÒsánVault Africa: Full Website & Investor Dashboard Deployment
# ===============================================================

# Set working directory
cd /root/osanvault-africa || exit

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check required env vars
if [ -z "$SOL_WALLET" ] || [ -z "$REAL_ESTATE_API_KEY" ]; then
  echo "❌ SOL_WALLET or REAL_ESTATE_API_KEY missing in .env"
  exit 1
fi

# Create latest_files folder if missing
mkdir -p latest_files

# Clean old files
rm -rf latest_files/*

# -----------------------------
# Generate HTML Pages
# -----------------------------

# index.html
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
    <h2>Fractional Real Estate Investment for Africa</h2>
    <p>Own a piece of Nigeria, one piece at a time with NET tokens.</p>
  </section>
</main>
<footer>
  <p>© 2025 ÒsánVault Africa</p>
</footer>
</body>
</html>
EOL

# about.html
cat <<EOL > latest_files/about.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About - ÒsánVault Africa</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header><h1>About ÒsánVault Africa</h1></header>
<main>
  <p>ÒsánVault Africa is Africa's premier real estate fractional investment platform. We use blockchain technology for transparency and security, enabling investors to own fractions of properties via NET tokens.</p>
</main>
<footer>© 2025 ÒsánVault Africa</footer>
</body>
</html>
EOL

# token-audit.html
cat <<EOL > latest_files/token-audit.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Token Audit - ÒsánVault Africa</title>
<link rel="stylesheet" href="style.css">
<script src="dashboard.js" defer></script>
</head>
<body>
<header><h1>NET Token Audit</h1></header>
<main>
  <p>View NET token transactions for transparency:</p>
  <input type="text" id="audit-wallet" placeholder="Enter wallet address">
  <button onclick="fetchTokenAudit()">View Audit</button>
  <pre id="audit-results"></pre>
</main>
<footer>© 2025 ÒsánVault Africa</footer>
</body>
</html>
EOL

# investor-dashboard.html
cat <<EOL > latest_files/investor-dashboard.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Investor Dashboard - ÒsánVault Africa</title>
<link rel="stylesheet" href="style.css">
<script src="dashboard.js" defer></script>
</head>
<body>
<header><h1>Investor Dashboard</h1></header>
<main>
  <section>
    <h2>Wallet: <span id="wallet-address">$SOL_WALLET</span></h2>
    <p>SOL Balance: <span id="sol-balance">Loading...</span></p>
    <p>NET Token Balance: <span id="net-balance">Loading...</span></p>
  </section>

  <section>
    <h2>Fractional Properties</h2>
    <div id="properties">Loading properties...</div>
  </section>
</main>
<footer>© 2025 ÒsánVault Africa</footer>
</body>
</html>
EOL

# style.css
cat <<EOL > latest_files/style.css
body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f5f5f5; }
header { background:#222; color:white; padding:1rem; }
header nav a { color:white; margin-right:1rem; text-decoration:none; }
main { padding:1rem; }
footer { text-align:center; padding:1rem; background:#222; color:white; margin-top:2rem; }
section { margin-bottom:2rem; background:white; padding:1rem; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1);}
EOL

# dashboard.js
cat <<EOL > latest_files/dashboard.js
const SOLANA_RPC = '$SOLANA_RPC';
const WALLET = '$SOL_WALLET';
const REAL_ESTATE_API_KEY = '$REAL_ESTATE_API_KEY';

async function fetchWalletData() {
  try {
    const solana = await import('@solana/web3.js');
    const spl = await import('@solana/spl-token');
    const connection = new solana.Connection(SOLANA_RPC);

    const publicKey = new solana.PublicKey(WALLET);
    const balance = await connection.getBalance(publicKey);
    document.getElementById('sol-balance').innerText = (balance/1e9).toFixed(4) + ' SOL';

    // NET token balance (assumes known mint)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {mint: new solana.PublicKey(WALLET)});
    let netBalance = 0;
    tokenAccounts.value.forEach(acc => { netBalance += acc.account.data.parsed.info.tokenAmount.uiAmount; });
    document.getElementById('net-balance').innerText = netBalance + ' NET';
  } catch (err) {
    console.error(err);
  }
}

async function fetchProperties() {
  try {
    const res = await fetch('https://api.example.com/properties?key=' + REAL_ESTATE_API_KEY);
    const data = await res.json();
    const container = document.getElementById('properties');
    container.innerHTML = '';
    data.properties.slice(0,20).forEach(p => {
      container.innerHTML += \`<div><h3>\${p.name}</h3><p>\${p.description}</p><p>Price: \$\${p.price}</p><p>Fraction: \${p.fraction}%</p></div>\`;
    });
  } catch (err) {
    console.error(err);
    document.getElementById('properties').innerText = 'Failed to load properties.';
  }
}

async function fetchTokenAudit() {
  const wallet = document.getElementById('audit-wallet').value;
  const res = await fetch('https://osanvaultafrica.com/token-audit/' + wallet);
  const data = await res.json();
  document.getElementById('audit-results').innerText = JSON.stringify(data, null, 2);
}

window.onload = () => {
  fetchWalletData();
  fetchProperties();
};
EOL

# -----------------------------
# Commit & Push to GitHub
# -----------------------------
git add latest_files/*
git commit -m "Auto-update website with full investor dashboard, wallet, NET token & properties"
git push origin main

echo "🎉 ÒsánVault Africa fully updated in latest_files/ and GitHub synced!"
