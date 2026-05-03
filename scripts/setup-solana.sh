#!/bin/bash
# ÒsánVault - Solana CLI Setup & Token Deployment
# Run this on a machine with Solana CLI or in WSL

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        OSANV Token Deployment - Step by Step                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Check if solana CLI is installed
if command -v solana &> /dev/null; then
    echo "✓ Solana CLI found: $(solana --version)"
else
    echo "Installing Solana CLI..."
    
    # Try direct install
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.1/install)" || {
        echo "Manual install required:"
        echo "1. Download from https://github.com/solana-labs/solana/releases"
        echo "2. Add to PATH"
        exit 1
    }
    
    # Source the config
    source ~/.profile || true
fi

# Configuration
MINT_AUTHORITY="Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
TOTAL_SUPPLY=500000000

echo ""
echo "Step 1: Configure Solana Cluster"
echo "─────────────────────────────────"
echo "Choose network:"
echo "  1) Mainnet Beta (production)"
echo "  2) Devnet (testing)"
echo "  3) Local (development)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1) RPC_URL="https://api.mainnet-beta.solana.com" ;;
    2) RPC_URL="https://api.devnet.solana.com" ;;
    3) RPC_URL="http://localhost:8899" ;;
    *) RPC_URL="https://api.devnet.solana.com" ;;
esac

solana config set --url "$RPC_URL"
echo "✓ Connected to $RPC_URL"

echo ""
echo "Step 2: Check Wallet Balance"
echo "─────────────────────────────"
solana balance

echo ""
echo "Step 3: Create OSANV Token"
echo "───────────────────────────"
echo "Creating token with 9 decimals..."

MINT_OUTPUT=$(spl-token create-token --decimals 9 2>&1)
echo "$MINT_OUTPUT"

# Extract mint address
MINT_ADDR=$(echo "$MINT_OUTPUT" | grep -oP '(?<=Creating token )[A-Za-z0-9]+' || echo "")

if [ -z "$MINT_ADDR" ]; then
    MINT_ADDR=$(echo "$MINT_OUTPUT" | grep -oP '(?<=Token )[A-Za-z0-9]+' || echo "")
fi

if [ -z "$MINT_ADDR" ]; then
    echo "Could not detect mint address. Please check output above."
    read -p "Enter Mint Address manually: " MINT_ADDR
fi

echo "✓ Token created: $MINT_ADDR"

echo ""
echo "Step 4: Mint 500,000,000 OSANV"
echo "─────────────────────────────"
spl-token mint "$MINT_ADDR" $TOTAL_SUPPLY
echo "✓ Minted $TOTAL_SUPPLY tokens"

echo ""
echo "Step 5: Disable Mint Authority (Irrevocable)"
echo "────────────────────────────────────────────"
spl-token authorize "$MINT_ADDR" mint "$MINT_AUTHORITY"
echo "✓ Mint authority transferred to platform"

echo ""
echo "Step 6: Create Token Account"
echo "────────────────────────────"
spl-token create-account "$MINT_ADDR"
echo "✓ Token account created"

echo ""
echo "Step 7: Verify Deployment"
echo "─────────────────────────"
echo "Supply: $(spl-token supply "$MINT_ADDR")"
echo "Balance: $(spl-token balance "$MINT_ADDR")"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETE                        ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Token Address: $MINT_ADDR              ║"
echo "║ Total Supply:  $TOTAL_SUPPLY OSANV                       ║"
echo "║ Authority:     $MINT_AUTHORITY     ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Save for reference
echo "$MINT_ADDR" > .osanv-mint-address
echo "Mint address saved to .osanv-mint-address"