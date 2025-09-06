#!/bin/bash
# Backup current server files to local Termux storage

FTP_HOST="ftp.osanvaultafrica.com"
FTP_USER="olugbenga@osanvaultafrica.com"
FTP_PASS="_OQH47+hOtZ=W=Qb"
BACKUP_DIR=~/osanvault-backup

mkdir -p $BACKUP_DIR

echo "🚀 Downloading current server files..."
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST <<EOF
set ssl:verify-certificate no
mirror --verbose ./ $BACKUP_DIR
bye
EOF

echo "✅ Backup complete! Files saved in $BACKUP_DIR"
