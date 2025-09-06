#!/bin/bash
# ÒsánVault Africa Termux Solana CLI + Devnet Setup (Compile from Source)

PROJECT_DIR=~/osanvault-africa
SOLANA_DIR=$PROJECT_DIR/solana
WALLET_PATH=$PROJECT_DIR/net-wallet.json

echo "🚀 Starting Termux Solana CLI setup from source..."

# -------------------------
# 1️⃣ Install dependencies
# -------------------------
pkg update -y && pkg upgrade -y
pkg install git curl wget tar python build-essential clang make pkg-config -y
pkg install rust -y
rustup default stable

echo "✅ Dependencies installed."

# -------------------------
# 2️⃣ Download Solana source code
# -------------------------
mkdir -p $SOLANA_DIR
cd $SOLANA_DIR
echo "📥 Download Solana source code via browser or wget:"
echo "https://github.com/solana-labs/solana/releases/latest (Source code tar.gz)"
read -p "Press Enter after placing the tar.gz in $SOLANA_DIR..."

SOLANA_SRC=$(ls $SOLANA_DIR/solana-*.tar.gz | head -n 1)
if [ ! -f "$SOLANA_SRC" ]; then
  echo "❌ Source file not found!"
  exit 1
fi

tar -xvzf $SOLANA_SRC
SRC_FOLDER=$(ls -d $SOLANA_DIR/solana-* | head -n 1)
cd $SRC_FOLDER

# -------------------------
# 3️⃣ Compile Solana CLI
# -------------------------
echo "⚡ Compiling Solana CLI (this may take 20-40 minutes)..."
cargo build --release

export PATH="$SRC_FOLDER/target/release:$PATH"
solana --version

# -------------------------
# 4️⃣ Setup Devnet wallet
# -------------------------
solana-keygen new --outfile $WALLET_PATH --no-passphrase
solana config set --keypair $WALLET_PATH
solana config set --url https://api.devnet.solana.com

echo "✅ Devnet wallet created at $WALLET_PATH"
solana balance

# -------------------------
# 5️⃣ Install Anchor
# -------------------------
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

echo "✅ Anchor installed."

echo "🎉 Termux Solana CLI + Devnet + Anchor setup complete!"
echo "You can now deploy NET Token smart contract."
