#!/bin/bash
# ÒsánVault Africa Termux Solana + Rust + Anchor Installer
# Fully bypasses TLS issues

PROJECT_DIR=~/osanvault-africa
SOLANA_DIR=$PROJECT_DIR/solana

echo "🚀 Starting Termux setup for ÒsánVault Africa..."

# -------------------------
# 1️⃣ Install dependencies
# -------------------------
pkg update -y
pkg upgrade -y
pkg install git wget curl tar python -y
pkg install rust -y

echo "✅ Dependencies installed."

# -------------------------
# 2️⃣ Download Solana CLI manually
# -------------------------
mkdir -p $SOLANA_DIR
echo "📥 Download the Solana release .tar.bz2 via Android browser from:"
echo "https://github.com/solana-labs/solana/releases/latest"
echo "Save it to ~/osanvault-africa/solana/"

read -p "Press Enter after downloading the file to continue..."

SOLANA_TAR=$(ls $SOLANA_DIR/solana-release-*.tar.bz2 | head -n 1)
if [ ! -f "$SOLANA_TAR" ]; then
  echo "❌ Solana tar file not found! Make sure it is in $SOLANA_DIR"
  exit 1
fi

# Extract Solana CLI
tar -xvf $SOLANA_TAR -C $SOLANA_DIR
export PATH="$SOLANA_DIR/solana-release/bin:$PATH"

echo "✅ Solana CLI installed."
solana --version

# -------------------------
# 3️⃣ Setup devnet wallet
# -------------------------
WALLET_PATH=$PROJECT_DIR/net-wallet.json
solana-keygen new --outfile $WALLET_PATH --no-passphrase
solana config set --keypair $WALLET_PATH
solana config set --url https://api.devnet.solana.com

echo "✅ Devnet wallet created at $WALLET_PATH"
solana balance

# -------------------------
# 4️⃣ Install Anchor
# -------------------------
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

echo "✅ Anchor installed."

# -------------------------
# 5️⃣ Setup complete
# -------------------------
echo "🎉 Termux setup for ÒsánVault Africa complete!"
echo "You can now build and deploy NET Token smart contract to devnet."
