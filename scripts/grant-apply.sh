#!/data/data/com.termux/files/usr/bin/bash
# grant-apply.sh
# Generate grant template for ÒsánVault Africa

GRANT_DIR=~/osanvault-africa/grants
mkdir -p $GRANT_DIR
chmod 700 $GRANT_DIR

GRANT_FILE="$GRANT_DIR/solana_grant.txt"

tee $GRANT_FILE > /dev/null <<EOL
Grant Proposal for ÒsánVault Africa
------------------------------------
Project: Tokenized Real Estate & Minerals
Website: https://osanvaultafrica.com
Funding Requested: [Enter Amount]
Use of Funds: Deploy NET token, expand platform, onboard users, scale blockchain infrastructure
Contact: olugbenga1000@gmail.com
EOL

echo "✅ Grant template created at $GRANT_FILE"
