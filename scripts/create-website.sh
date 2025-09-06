#!/bin/bash
# Script to create the main pages of ÒsánVault Africa website

cd ~/osanvault-africa || exit

echo "🔹 Creating website pages..."

# Index Page
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ÒsánVault Africa</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header>
    <h1>Welcome to ÒsánVault Africa</h1>
    <nav>
        <a href="index.html">Home</a> |
        <a href="about.html">About</a> |
        <a href="roadmap.html">Roadmap</a> |
        <a href="tokenomics.html">NET Token</a> |
        <a href="contact.html">Contact</a>
    </nav>
</header>
<main>
    <h2>Invest in Africa, One Token at a Time</h2>
    <p>ÒsánVault Africa is a blockchain-powered platform enabling secure fractional investments in real estate and tokenized assets.</p>
</main>
<footer>
    <p>&copy; 2025 ÒsánVault Africa | <a href="https://osanvaultafrica.com">Website</a></p>
</footer>
</body>
</html>
EOF

# About Page
cat > about.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About ÒsánVault Africa</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header>
    <h1>About ÒsánVault Africa</h1>
    <nav>
        <a href="index.html">Home</a> |
        <a href="about.html">About</a> |
        <a href="roadmap.html">Roadmap</a> |
        <a href="tokenomics.html">NET Token</a> |
        <a href="contact.html">Contact</a>
    </nav>
</header>
<main>
    <h2>Our Mission</h2>
    <p>Empowering Africans and global investors to access secure, fractionalized real estate and tokenized assets.</p>

    <h2>Our Vision</h2>
    <p>Become Africa’s leading decentralized investment ecosystem while generating real on-chain yields.</p>

    <h2>Goals</h2>
    <ul>
        <li>Tokenize real estate and mineral resources.</li>
        <li>Offer NET token staking, lending, and governance.</li>
        <li>Provide fiat and crypto on-ramps for accessibility.</li>
        <li>Partner with governments and institutions for compliance.</li>
        <li>Educate and onboard investors through community programs.</li>
    </ul>

    <h2>Future Prospects</h2>
    <p>Expansion into NFT loans, carbon credits, cross-chain solutions, and global adoption.</p>
</main>
<footer>
    <p>&copy; 2025 ÒsánVault Africa | <a href="https://osanvaultafrica.com">Website</a></p>
</footer>
</body>
</html>
EOF

# Roadmap Page
cat > roadmap.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roadmap - ÒsánVault Africa</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header>
    <h1>ÒsánVault Africa Roadmap</h1>
    <nav>
        <a href="index.html">Home</a> |
        <a href="about.html">About</a> |
        <a href="roadmap.html">Roadmap</a> |
        <a href="tokenomics.html">NET Token</a> |
        <a href="contact.html">Contact</a>
    </nav>
</header>
<main>
    <ul>
        <li>Q4 2025: Launch initial properties and NET token.</li>
        <li>Q1 2026: Implement staking and lending features.</li>
        <li>Q2 2026: Add fractional mineral and carbon credit investments.</li>
        <li>Q3 2026: Global expansion and partnerships with financial institutions.</li>
        <li>Q4 2026: Community DAO-lite governance and NFT loans.</li>
    </ul>
</main>
<footer>
    <p>&copy; 2025 ÒsánVault Africa | <a href="https://osanvaultafrica.com">Website</a></p>
</footer>
</body>
</html>
EOF

# Tokenomics Page
cat > tokenomics.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NET Token - ÒsánVault Africa</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header>
    <h1>NET Token</h1>
    <nav>
        <a href="index.html">Home</a> |
        <a href="about.html">About</a> |
        <a href="roadmap.html">Roadmap</a> |
        <a href="tokenomics.html">NET Token</a> |
        <a href="contact.html">Contact</a>
    </nav>
</header>
<main>
    <h2>About NET Token</h2>
    <p>The NigeriaEstate Token (NET) powers ÒsánVault Africa’s ecosystem, enabling:</p>
    <ul>
        <li>Staking and earning real yield.</li>
        <li>Governance voting (DAO-lite).</li>
        <li>Collateral lending and NFT loans.</li>
        <li>Cross-chain utility and trading.</li>
    </ul>
</main>
<footer>
    <p>&copy; 2025 ÒsánVault Africa | <a href="https://osanvaultafrica.com">Website</a></p>
</footer>
</body>
</html>
EOF

# Contact Page
cat > contact.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact ÒsánVault Africa</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header>
    <h1>Contact Us</h1>
    <nav>
        <a href="index.html">Home</a> |
        <a href="about.html">About</a> |
        <a href="roadmap.html">Roadmap</a> |
        <a href="tokenomics.html">NET Token</a> |
        <a href="contact.html">Contact</a>
    </nav>
</header>
<main>
    <p>Email: contact@osanvaultafrica.com</p>
    <p>Website: <a href="https://osanvaultafrica.com">https://osanvaultafrica.com</a></p>
    <p>Telegram: <a href="https://t.me/ÒsánVaultAfrica">@ÒsánVaultAfrica</a></p>
</main>
<footer>
    <p>&copy; 2025 ÒsánVault Africa</p>
</footer>
</body>
</html>
EOF

echo "✅ All pages created successfully!"
