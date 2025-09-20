#!/bin/bash
# mint_net.sh - mint NET tokens with human-readable amounts

TOKEN_MINT="2wGmLXiJaNCRhKzpvifTywXWHMgA4FETep57DAcmLv41"
KEYPAIR_PATH="$HOME/osanvault/net-wallet.json"
NET_DECIMALS=9   # NET has 9 decimals (same as SOL)

# Function: Convert human NET to raw amount
convert_to_raw() {
  AMOUNT=$1
  RAW=$(echo "$AMOUNT * (10 ^ $NET_DECIMALS)" | bc)
  echo $RAW
}

# Ask for NET amount
read -p "Enter amount of NET to mint: " NET_AMOUNT
RAW_AMOUNT=$(convert_to_raw $NET_AMOUNT)

# Configure Solana CLI
solana config set --keypair "$KEYPAIR_PATH"

echo "=== Solana CLI Config ==="
solana config get
echo "========================="

# Find or create token account
TOKEN_ACCOUNT=$(spl-token accounts | grep "$TOKEN_MINT" | awk '{print $1}')

if [ -z "$TOKEN_ACCOUNT" ]; then
    echo "No token account found. Creating..."
    TOKEN_ACCOUNT=$(spl-token create-account "$TOKEN_MINT" | grep 'Creating account' | awk '{print $3}')
    echo "Created token account: $TOKEN_ACCOUNT"
else
    echo "Token account exists: $TOKEN_ACCOUNT"
fi

# Mint tokens
echo "Minting $NET_AMOUNT NET ($RAW_AMOUNT raw units) to $TOKEN_ACCOUNT..."
spl-token mint "$TOKEN_MINT" "$RAW_AMOUNT" "$TOKEN_ACCOUNT"

# Verify balance
echo "=== Token Account Info ==="
spl-token account-info "$TOKEN_ACCOUNT"
echo "=========================="
