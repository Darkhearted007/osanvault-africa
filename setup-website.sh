#!/bin/bash
# setup-website.sh
# Script to auto-generate ÒsánVault Africa website skeleton with ready-made content
# and push it directly to GitHub

# --------- CONFIG (edit these before first run) ---------
PROJECT_DIR=~/osanvault-africa
GIT_REPO=https://github.com/Darkhearted007/osanvault-africa.git
BRANCH=main
COMMIT_MSG="🚀 Auto-generated ÒsánVault Africa website update"
# --------------------------------------------------------

mkdir -p $PROJECT_DIR
cd $PROJECT_DIR || exit

echo "🌍 Setting up ÒsánVault Africa website..."

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
      <a href="contact.html">Contact</a>
    </nav>
  </header>
  
  <section>
    <h2>Own a Piece of Nigeria, One Piece at a Time</h2>
    <p>ÒsánVault Africa is the first Web3 platform tokenizing real estate and minerals across Nigeria.</p>
    <a href="about.html" class="cta">Learn More</a>
  </section>
  
  <footer>
    <p>&copy; 2025 ÒsánVault Africa. All rights reserved.</p>
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
    <h1>About ÒsánVault</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>
  
  <section>
    <h2>Our Mission</h2>
    <p>ÒsánVault Africa bridges blockchain technology with real estate, land banking, minerals, and carbon credits—empowering Africans to invest, own, and earn transparently.</p>
    
    <h2>Vision</h2>
    <p>To be Africa’s leading decentralized vault for wealth creation and sustainable development.</p>
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
    <h1>ÒsánVault Roadmap</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>
  
  <section>
    <h2>Phase 1: Foundation</h2>
    <ul>
      <li>Mint NigeriaEstate Token (NET)</li>
      <li>Tokenize 10 properties</li>
      <li>Launch community channels</li>
    </ul>
    
    <h2>Phase 2: Expansion</h2>
    <ul>
      <li>Introduce ÒsánVault Minerals</li>
      <li>Government partnerships (Ekiti & Oyo)</li>
      <li>Launch rent payout backend</li>
    </ul>
    
    <h2>Phase 3: Global Scale</h2>
    <ul>
      <li>Cross-chain expansion</li>
      <li>DAO-lite governance</li>
      <li>Regional inclusion programs</li>
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
    <h1>ÒsánVault Tokenomics</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>
  
  <section>
    <h2>NigeriaEstate Token (NET)</h2>
    <ul>
      <li>Total Supply: 1,000,000,000 NET</li>
      <li>Utility: Real Estate, Minerals, Carbon Credits</li>
      <li>Rewards: Rent payouts, staking, and governance</li>
    </ul>
    
    <h2>Distribution</h2>
    <ul>
      <li>40% Community & Rewards</li>
      <li>25% Properties & Minerals Backing</li>
      <li>20% Development & Team</li>
      <li>10% Partnerships & Grants</li>
      <li>5% Liquidity</li>
    </ul>
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
    <h1>Contact ÒsánVault</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="tokenomics.html">Tokenomics</a>
      <a href="contact.html">Contact</a>
    </nav>
  </header>
  
  <section>
    <h2>Get in Touch</h2>
    <p>Email: <a href="mailto:olugbenga1000@gmail.com">olugbenga1000@gmail.com</a></p>
    <p>Telegram: <a href="https://t.me/OsanVaultAfrica">@OsanVaultAfrica</a></p>
    <p>WhatsApp: +2347065056103</p>
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
  background: #f9f9f9;
  color: #333;
}
header {
  background: #0a3d62;
  color: white;
  padding: 15px;
}
nav a {
  color: white;
  margin: 0 10px;
  text-decoration: none;
}
nav a:hover {
  text-decoration: underline;
}
section {
  padding: 20px;
}
.cta {
  display: inline-block;
  padding: 10px 15px;
  background: #1abc9c;
  color: white;
  border-radius: 5px;
  text-decoration: none;
}
.cta:hover {
  background: #16a085;
}
footer {
  background: #0a3d62;
  color: white;
  text-align: center;
  padding: 10px;
}
EOF

echo "✅ Website files generated in $PROJECT_DIR"

# ---------- GitHub push ----------
echo "📦 Pushing to GitHub..."

if [ ! -d ".git" ]; then
  git init
  git remote add origin $GIT_REPO
fi

git checkout -B $BRANCH
git add .
git commit -m "$COMMIT_MSG"
git pull origin $BRANCH --rebase || true
git push origin $BRANCH --force

echo "🚀 Deployment complete!"
