#!/bin/bash
# -------------------------------
# ÒsánVault Africa: Incremental FTP Deploy Script
# -------------------------------

# CONFIGURATION
FTP_HOST="ftp.osanvaultafrica.com"
FTP_USER="olugbenga@osanvaultafrica.com"
FTP_PASS="_OQH47+hOtZ=W=Qb"
REMOTE_DIR="/"  # Truehost public_html root for your domain

LOCAL_DIR=~/osanvault-africa  # Local project folder

# -------------------------------
# Step 0: Validate local directory
# -------------------------------
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Local folder $LOCAL_DIR does not exist!"
    exit 1
fi

# -------------------------------
# Step 1: Warn if files are in a subfolder
# -------------------------------
if [ -d "$LOCAL_DIR/osanvault-africa" ]; then
    echo "⚠️  Warning: Your files are inside a subfolder 'osanvault-africa'."
    echo "Make sure index.html and assets/ are directly in $LOCAL_DIR"
fi

# -------------------------------
# Step 2: Upload files via FTP
# -------------------------------
echo "🚀 Uploading files to Truehost..."
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST <<EOF
set ssl:verify-certificate no
lcd $LOCAL_DIR
mirror --reverse --delete --verbose --exclude .git/ --exclude '*.zip' ./ $REMOTE_DIR
bye
EOF

# -------------------------------
# Step 3: Completion message
# -------------------------------
echo "✅ Deployment complete!"
echo "🌐 Your site should now be live at https://osanvaultafrica.com"
echo "📌 Note: All duplicate files on server not in local folder have been deleted (--delete)."
