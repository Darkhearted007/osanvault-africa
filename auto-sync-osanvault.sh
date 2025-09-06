#!/data/data/com.termux/files/usr/bin/bash

# ÒsánVault Africa auto-sync README script
# Updates README.md dynamically and pushes to GitHub

# Navigate to project directory
cd $HOME/osanvault-africa || exit

# Function to generate README
update_readme() {
  TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S WAT")
  FILES=$(ls -1 | grep -v ".git")

  cat > README.md <<EOL
# ÒsánVault Africa

Welcome to **ÒsánVault Africa**, the blockchain-powered platform transforming real estate and digital asset investment in Africa.

🌐 Official Website: [https://osanvaultafrica.com](https://osanvaultafrica.com)

---

## About

ÒsánVault Africa allows users to:

- Invest in tokenized real estate assets
- Access real-yield vaults
- Participate in DAO-lite governance
- Enjoy a secure blockchain-backed platform

---

## Auto-generated File Listing

_Last update: $TIMESTAMP_

\`\`\`
$FILES
\`\`\`

---

## Contact

Email: olugbenga1000@gmail.com  
Telegram: @ÒsánVaultAfrica

---

**Disclaimer:** This README is updated automatically via the auto-sync script.
EOL
}

# Call update_readme function
update_readme

# Git commands to commit and push
git add README.md
git commit -m "📄 Update README automatically: $TIMESTAMP"
git push origin main --force
