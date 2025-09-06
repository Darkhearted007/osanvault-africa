#!/bin/bash
# ÒsánVault Africa: Auto FTP Deploy + Duplicate Removal

FTP_HOST="ftp.osanvaultafrica.com"
FTP_USER="olugbenga@osanvaultafrica.com"
FTP_PASS="_OQH47+hOtZ=W=Qb"
LOCAL_DIR=~/osanvault-africa

# Validate local directory
[ ! -d "$LOCAL_DIR" ] && echo "❌ Local folder missing!" && exit 1

# Warn if files in subfolder
[ -d "$LOCAL_DIR/osanvault-africa" ] && echo "⚠️ Files inside subfolder. Move index.html and assets/ directly."

# Detect folder (default to root)
REMOTE_DIR=$(lftp -u $FTP_USER,$FTP_PASS $FTP_HOST -e "set ssl:verify-certificate no; cls -1; bye" | grep -i "public_html" | head -n1)
[ -z "$REMOTE_DIR" ] && REMOTE_DIR="/"

# Upload & mirror
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST <<EOF
set ssl:verify-certificate no
lcd $LOCAL_DIR
mirror --reverse --delete --verbose --exclude .git/ --exclude '*.zip' ./ $REMOTE_DIR
bye
EOF

echo "✅ Deployment complete! https://osanvaultafrica.com"
