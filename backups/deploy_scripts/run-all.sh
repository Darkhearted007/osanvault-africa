#!/bin/bash
# ÒsánVault Africa Automation Script
# Fully automated deployment, Telegram updates, and backup

# --- Step 0: Set paths ---
BASE="$HOME/osanvault-africa"
LOGS="$BASE/logs"
WEBSITE="$BASE/website"
BACKUP="$HOME/osanvault-backup"

# --- Step 1: Create necessary folders ---
mkdir -p "$LOGS" "$WEBSITE" "$BACKUP"

# --- Step 2: Move assets/ into website/ if needed ---
if [ -d "$BASE/assets" ]; then
    mv "$BASE/assets" "$WEBSITE/" 2>/dev/null
fi

# --- Step 3: Flatten website folder if nested ---
for dir in "$WEBSITE"/*/; do
    [ -d "$dir" ] && mv "$dir"* "$WEBSITE/" 2>/dev/null
done

# --- Step 4: Deploy website to Truehost ---
echo "🚀 Deploying website to Truehost..."
ZIPFILE="$BASE/website.zip"
cd "$WEBSITE"
zip -r "$ZIPFILE" ./* 1>/dev/null 2>&1
cd "$BASE"

# Replace these with your Truehost FTP credentials
FTP_USER="olugbenga@osanvaultafrica.com"
FTP_PASS="_OQH47+hOtZ=W=Qb"
FTP_HOST="ftp.osanvaultafrica.com"
FTP_DIR="/public_html"

# Upload zip via lftp
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
put "$ZIPFILE" -o "website.zip"
bye
EOF

echo "✅ Website uploaded! Extract zip in cPanel File Manager."
echo "🌐 Your site should be live at https://osanvaultafrica.com"

# --- Step 5: Backup current server files ---
echo "💾 Running backup..."
mkdir -p "$BACKUP"
cp -r "$WEBSITE"/* "$BACKUP/"
echo "✅ Backup complete! Files saved in $BACKUP"

# --- Step 6: Run Telegram automation ---
TELEGRAM_SCRIPT="$BASE/scripts/auto-telegram.py"
if [ -f "$TELEGRAM_SCRIPT" ]; then
    echo "📣 Sending Telegram updates..."
    nohup python3 "$TELEGRAM_SCRIPT" >> "$LOGS/telegram.log" 2>&1 &
fi

# --- Step 7: Run tokenomics simulation ---
TOKENOMICS_SCRIPT="$BASE/scripts/tokenomics.py"
if [ -f "$TOKENOMICS_SCRIPT" ]; then
    echo "💰 Running tokenomics..."
    nohup python3 "$TOKENOMICS_SCRIPT" >> "$LOGS/tokenomics.log" 2>&1 &
fi

echo "✅ ÒsánVault Africa automation complete!"
