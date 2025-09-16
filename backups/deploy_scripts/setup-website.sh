#!/usr/bin/env bash
set -euo pipefail

echo "🌍 Setting up ÒsánVault Africa website..."

# Go to project folder
cd ~/osanvault-africa

# ---------- index.html ----------
cat > index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ÒsánVault Africa | Own a Piece of Nigeria</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>ÒsánVault Africa</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="net.html">NET Token</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section>
    <h2>Own a Piece of Nigeria, One Piece at a Time</h2>
    <p>ÒsánVault Africa is the first Web3 platform tokenizing real estate and minerals across Nigeria.</p>
    <p><b>Powered by NigeriaEstate Token (NET)</b></p>
    <a href="net.html" class="cta">Explore NET Token</a>
  </section>

  <footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
  </footer>
</body>
</html>
EOF

# ---------- about.html ----------
cat > about.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About | ÒsánVault Africa</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>About ÒsánVault Africa</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="net.html">NET Token</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section>
    <h2>Who We Are</h2>
    <p>ÒsánVault Africa is a blockchain-powered platform enabling fractional ownership of real estate, mineral resources, and sustainable assets across Nigeria. Our goal is to democratize access to wealth through tokenization.</p>
  </section>

  <footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
  </footer>
</body>
</html>
EOF

# ---------- roadmap.html ----------
cat > roadmap.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roadmap | ÒsánVault Africa</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Roadmap</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="net.html">NET Token</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section>
    <h2>Our Journey</h2>
    <ul>
      <li><b>2025 Q1:</b> Launch of NET Token on Solana Devnet</li>
      <li><b>2025 Q2:</b> Property and mineral listings begin</li>
      <li><b>2025 Q3:</b> Community DAO-lite governance launch</li>
      <li><b>2025 Q4:</b> Yield vaults, carbon credits, and cross-chain expansion</li>
    </ul>
  </section>

  <footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
  </footer>
</body>
</html>
EOF

# ---------- tokenomics.html ----------
cat > tokenomics.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tokenomics | ÒsánVault Africa</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Tokenomics</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="net.html">NET Token</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section>
    <h2>NET Token Distribution</h2>
    <ul>
      <li>Community & Airdrops: 40%</li>
      <li>Development & Team: 20%</li>
      <li>Strategic Partnerships: 20%</li>
      <li>Treasury & Reserves: 10%</li>
      <li>Public Sale: 10%</li>
    </ul>
  </section>

  <footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
  </footer>
</body>
</html>
EOF

# ---------- net.html ----------
cat > net.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NigeriaEstate Token (NET) | ÒsánVault Africa</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>NigeriaEstate Token (NET)</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="net.html">NET Token</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section>
    <h2>About NET</h2>
    <p><b>NigeriaEstate Token (NET)</b> is the official utility token powering ÒsánVault Africa.</p>
    <ul>
      <li><b>Total Supply:</b> 1,000,000,000 NET</li>
      <li><b>Network:</b> Solana (Devnet)</li>
      <li><b>Wallet Address:</b> 7rDzXgyZhNEZT9KFoNowL7fo8cbdryg8RnVUhuN2MjXd</li>
      <li><b>Utility:</b> Real estate tokenization, rent payouts, minerals, carbon credits, staking, governance</li>
    </ul>

    <h2>Explorer</h2>
    <p>
      <a href="https://explorer.solana.com/address/7rDzXgyZhNEZT9KFoNowL7fo8cbdryg8RnVUhuN2MjXd?cluster=devnet" target="_blank" class="cta">
        View NET on Solana Explorer
      </a>
    </p>

    <h2>Coming Soon</h2>
    <p>Swap NET, stake NET, and earn real on-chain yields.</p>
  </section>

  <footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
  </footer>
</body>
</html>
EOF

# ---------- contact.html ----------
cat > contact.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact | ÒsánVault Africa</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Contact ÒsánVault Africa</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="net.html">NET Token</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>

  <section>
    <h2>Get in Touch</h2>
    <p>Email: <a href="mailto:olugbenga1000@gmail.com">olugbenga1000@gmail.com</a></p>
    <p>Telegram: <a href="https://t.me/OsanVaultAfrica" target="_blank">@OsanVaultAfrica</a></p>
    <p>GitHub: <a href="https://github.com/Darkhearted007/osanvault-africa" target="_blank">osanvault-africa</a></p>
  </section>

  <footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
  </footer>
</body>
</html>
EOF

# ---------- styles.css ----------
cat > styles.css <<'EOF'
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  background: #f9f9f9;
  color: #333;
}
header {
  background: #0a2f5c;
  color: #fff;
  padding: 1rem;
  text-align: center;
}
header h1 {
  margin: 0;
}
nav a {
  color: #fff;
  margin: 0 0.5rem;
  text-decoration: none;
}
nav a:hover {
  text-decoration: underline;
}
section {
  padding: 2rem;
}
.cta {
  display: inline-block;
  background: #ff7a00;
  color: #fff;
  padding: 0.75rem 1.5rem;
  margin-top: 1rem;
  text-decoration: none;
  border-radius: 5px;
}
.cta:hover {
  background: #e56a00;
}
footer {
  text-align: center;
  padding: 1rem;
  background: #0a2f5c;
  color: #fff;
  margin-top: 2rem;
}
EOF

# ---------- Git Setup & Push ----------
echo "📦 Pushing to GitHub..."
git add .
git commit -m "🚀 Auto-generated ÒsánVault Africa website update with NET token"
git push origin main || true

echo "🚀 Deployment complete!"
# ---------- GitHub Pages Deployment ----------
echo "🌐 Ensuring GitHub Pages deployment..."

# Use GitHub API to set Pages source to branch 'main' at root
if [ -n "${GITHUB_TOKEN:-}" ]; then
  curl -s -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/Darkhearted007/osanvault-africa/pages \
    -d '{"source":{"branch":"main","path":"/"}}' >/dev/null 2>&1 \
    && echo "✅ GitHub Pages auto-deploy triggered!" \
    || echo "⚠️ Could not configure Pages automatically. Please check your PAT."
else
  echo "⚠️ Skipped Pages auto-config. Set GITHUB_TOKEN in your environment to enable."
fi

echo "🚀 Deployment complete! Visit your live site at:"
echo "👉 https://darkhearted007.github.io/osanvault-africa/"
