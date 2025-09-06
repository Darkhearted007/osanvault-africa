#!/data/data/com.termux/files/usr/bin/bash
# Termux Solana CLI setup for ÒsánVault Africa

set -e

# Folder for Solana
SOLANA_DIR="$HOME/osanvault-africa/solana"
mkdir -p "$SOLANA_DIR"
cd "$SOLANA_DIR"

# Check if solana CLI already exists
if command -v solana >/dev/null 2>&1; then
    echo "✅ Solana CLI already installed: $(solana --version)"
else
    echo "⚡ Solana CLI not found. Downloading ARM64 binary..."
    
    # Download latest stable ARM64 binary from GitHub releases
    SOLANA_VERSION="1.18.26"
    BINARY_URL="https://github.com/solana-labs/solana/releases/download/v$SOLANA_VERSION/solana-release-aarch64-unknown-linux-gnu.tar.bz2"
    
    wget -O solana-arm64.tar.bz2 "$BINARY_URL" || {
        echo "❌ Download failed. Please download manually from:"
        echo "https://github.com/solana-labs/solana/releases"
        exit 1
    }

    echo "⚡ Extracting Solana binary..."
    tar -xjf solana-arm64.tar.bz2
    rm solana-arm64.tar.bz2
fi

# Add Solana to PATH permanently
SHELL_RC="$HOME/.bashrc"
if ! grep -q 'solana/bin' "$SHELL_RC"; then
    echo "export PATH=\$HOME/osanvault-africa/solana/bin:\$PATH" >> "$SHELL_RC"
    export PATH="$HOME/osanvault-africa/solana/bin:$PATH"
fi

echo "✅ Solana CLI ready: $(solana --version)"

# Initialize devnet wallet (optional)
WALLET_FILE="$SOLANA_DIR/solana-wallet.json"
if [ ! -f "$WALLET_FILE" ]; then
    echo "⚡ Creating devnet wallet for ÒsánVault Africa..."
    solana-keygen new --outfile "$WALLET_FILE" --no-bip39-passphrase
    solana config set --keypair "$WALLET_FILE"
    solana config set --url https://api.devnet.solana.com
    echo "✅ Wallet created at $WALLET_FILE and connected to devnet"
fi

echo "🎉 Setup complete! You can now run Solana commands on Termux."
