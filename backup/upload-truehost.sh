#!/bin/bash
# -------------------------------
# ÒsánVault Africa: FTP Upload Script (Ignore SSL cert errors)
# -------------------------------

# FTP credentials
FTP_HOST="ftp.osanvaultafrica.com"
FTP_USER="olugbenga@osanvaultafrica.com"
FTP_PASS="_OQH47+hOtZ=W=Qb"
REMOTE_DIR="/public_html"       # Upload directory

# Local ZIP file
ZIP_FILE="osanvault-africa.zip"

# Step 1: Zip project
echo "📦 Zipping project..."
zip -r $ZIP_FILE ./*

# Step 2: Upload via FTP (ignore SSL cert verification)
echo "🚀 Uploading ZIP to Truehost..."
lftp -u $FTP_USER,$FTP_PASS -e "set ssl:verify-certificate no; cd $REMOTE_DIR; put $ZIP_FILE; bye" $FTP_HOST

# Step 3: Completion message
echo "✅ Upload complete! Now log in to Truehost cPanel → File Manager → public_html → extract $ZIP_FILE."
echo "🌐 Your site should be live at https://osanvaultafrica.com after extraction."
