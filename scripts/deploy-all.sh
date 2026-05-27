#!/bin/bash
# ÒsánVault Africa - Deploy All Programs to Solana Devnet
# Usage: ./scripts/deploy-all.sh

set -e

PROGRAMS=(
  "osanvault_core"
  "osanvault_lend"
  "reits"
  "minerals"
  "carbon"
  "landbank"
  "oracle"
)

echo "=========================================="
echo "  ÒsánVault Africa - Program Deployment"
echo "=========================================="
echo ""

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo "ERROR: Solana CLI not installed"
    echo "Install: sh -c \"\$(curl -sSfL https://release.solana.com/v1.18.26/install.sh)\""
    exit 1
fi

# Check version
echo "Solana CLI version:"
solana --version
echo ""

# Check cluster config
CURRENT_CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "Current cluster: $CURRENT_CLUSTER"
echo ""

# Check wallet
echo "Deploy wallet:"
solana address
echo ""

# Check balance
echo "Wallet balance:"
solana balance
echo ""

# Confirm deployment
read -p "Deploy all 7 programs to devnet? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo "Starting deployment..."

# Build all programs
echo ""
echo "=========================================="
echo "  Building Programs"
echo "=========================================="

if command -v anchor &> /dev/null; then
    anchor build
else
    echo "Anchor CLI not found. Attempting cargo build-sbf..."
    for prog in "${PROGRAMS[@]}"; do
        echo "Building $prog..."
        if [ -f "programs/$prog/Cargo.toml" ]; then
            cargo build-sbf --manifest-path="programs/$prog/Cargo.toml" 2>/dev/null || \
            cargo build --manifest-path="programs/$prog/Cargo.toml" --release
        fi
    done
fi

echo ""
echo "Build complete. Artifacts in target/deploy/"
echo ""

# Deploy each program
echo "=========================================="
echo "  Deploying Programs"
echo "=========================================="

for prog in "${PROGRAMS[@]}"; do
    echo ""
    echo "Deploying $prog..."
    
    # Get program ID from Anchor.toml
    PROGRAM_ID=$(grep -A1 "^\s*$prog = " Anchor.toml | grep -o '"[^"]*"' | tr -d '"')
    
    if [ -z "$PROGRAM_ID" ]; then
        echo "ERROR: No program ID found for $prog in Anchor.toml"
        continue
    fi
    
    echo "  Program ID: $PROGRAM_ID"
    
    # Check if keypair exists
    KEYPAIR_PATH="programs/$prog/target/deploy/$prog-keypair.json"
    SO_PATH="programs/$prog/target/deploy/$prog.so"
    
    if [ -f "$KEYPAIR_PATH" ]; then
        echo "  Keypair: $KEYPAIR_PATH"
        
        # Deploy (skip if already deployed)
        if solana program deploy "$SO_PATH" --keypair "$KEYPAIR_PATH" -- Commitment --skip preflight 2>/dev/null; then
            echo "  ✓ Deployed: $prog"
        else
            echo "  ⚠ Already deployed or deployment failed"
        fi
    else
        echo "  ! Keypair not found at $KEYPAIR_PATH"
        echo "  ! Run: solana program deploy programs/$prog/target/deploy/$prog.so --keypair <keypair>"
    fi
done

echo ""
echo "=========================================="
echo "  Deployment Summary"
echo "=========================================="

echo ""
echo "Program IDs (save these for frontend):"
echo ""
for prog in "${PROGRAMS[@]}"; do
    PROGRAM_ID=$(grep -A1 "^\s*$prog = " Anchor.toml | grep -o '"[^"]*"' | tr -d '"')
    echo "  $prog: $PROGRAM_ID"
done

echo ""
echo "Update your frontend .env with:"
echo "  VITE_PROGRAM_CORE=<osanvault_core_id>"
echo "  VITE_PROGRAM_LEND=<osanvault_lend_id>"
echo "  ..."
echo ""
echo "Deployment complete!"