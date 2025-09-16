#!/data/data/com.termux/files/usr/bin/bash
# ÒsánVault Africa All-in-One Automation

set -e

BASE_DIR="$HOME/osanvault-africa"
SCRIPTS="$BASE_DIR/scripts"
WEBSITE="$BASE_DIR/website"
TELEGRAM_SCRIPT="$SCRIPTS/auto-telegram.py"

echo "🚀 Starting ÒsánVault Africa Automation..."

# 1. Sync GitHub
echo "🔄 Syncing GitHub repository..."
cd "$BASE_DIR"
git add .
git commit -m "Auto-sync update $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main || echo "Git push failed"

# 2. Deploy website to Truehost
if [ -f "$SCRIPTS/deploy-truehost-auto.sh" ]; then
    echo "🌐 Deploying website to Truehost..."
    bash "$SCRIPTS/deploy-truehost-auto.sh"
else
    echo "⚠️ deploy-truehost-auto.sh not found!"
fi

# 3. Run Telegram Automation
if [ -f "$TELEGRAM_SCRIPT" ]; then
    echo "💬 Running Telegram automation..."
    nohup python3 "$TELEGRAM_SCRIPT" &
else
    echo "⚠️ Telegram script not found!"
fi

# 4. Backup server files
if [ -f "$SCRIPTS/backup-server.sh" ]; then
    echo "💾 Running server backup..."
    bash "$SCRIPTS/backup-server.sh"
else
    echo "⚠️ Backup script not found!"
fi

# 5. Apply for grants automatically
if [ -f "$SCRIPTS/grant-apply.sh" ]; then
    echo "🎯 Running grant applications..."
    bash "$SCRIPTS/grant-apply.sh"
else
    echo "⚠️ Grant apply script not found!"
fi

# 6. Tokenomics simulation (optional)
if [ -f "$SCRIPTS/tokenomics.py" ]; then
    echo "📊 Running tokenomics simulation..."
    python3 "$SCRIPTS/tokenomics.py"
else
    echo "⚠️ tokenomics.py not found!"
fi

# 7. Prepare Solana environment (check if source exists)
SOLANA_BIN="$BASE_DIR/solana/solana-1.18.26/bin/solana"
if [ -f "$SOLANA_BIN" ]; then
    echo "🛠 Solana CLI is ready: $($SOLANA_BIN --version)"
else
    echo "⚠️ Solana CLI not found. Place solana source or binaries in ~/osanvault-africa/solana/"
fi

echo "✅ ÒsánVault Africa automation completed!"
