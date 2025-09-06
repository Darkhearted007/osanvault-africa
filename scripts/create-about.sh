#!/bin/bash
# Script to create about.html for ÒsánVault Africa

# Navigate to the repo
cd ~/osanvault-africa || exit

# Create about.html
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
            <a href="roadmap.html">Roadmap</a> |
            <a href="tokenomics.html">NET Token</a> |
            <a href="contact.html">Contact</a>
        </nav>
    </header>

    <main>
        <section>
            <h2>Our Mission</h2>
            <p>ÒsánVault Africa is a blockchain-powered platform enabling Nigerians and Africans to invest in real estate and tokenized assets transparently and securely, unlocking real-world yields and fostering financial inclusion.</p>
        </section>

        <section>
            <h2>Our Vision</h2>
            <p>To become Africa’s leading decentralized real estate and tokenized asset ecosystem, empowering investors globally while contributing to Africa’s economic growth and digital innovation.</p>
        </section>

        <section>
            <h2>Core Goals</h2>
            <ul>
                <li>Tokenize real estate and mineral assets for fractional investment.</li>
                <li>Provide real on-chain yield opportunities through the NET token.</li>
                <li>Integrate fiat on-ramps and local payment solutions for accessibility.</li>
                <li>Enable governance through DAO-lite mechanisms for community decisions.</li>
                <li>Ensure compliance with local regulations and collaborate with governments.</li>
            </ul>
        </section>

        <section>
            <h2>Future Prospects</h2>
            <p>We plan to expand ÒsánVault Africa globally, partnering with financial institutions, offering NFT-based loans, carbon credit tokenization, and educational initiatives for African investors.</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 ÒsánVault Africa | <a href="https://osanvaultafrica.com">Website</a></p>
    </footer>
</body>
</html>
EOF

echo "✅ about.html created successfully in ~/osanvault-africa"
