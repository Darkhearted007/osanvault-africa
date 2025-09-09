#!/data/data/com.termux/files/usr/bin/bash
# Deploy website to Truehost

# Config
FTP_HOST="ftp.osanvaultafrica.com"
FTP_USER="olugbenga@osanvaultafrica.com"
FTP_PASS="_OQH47+hOtZ=W=Qb"
LOCAL_WEBSITE_DIR=~/osanvault-africa/website
ZIP_FILE=website.zip

# Zip website
cd $LOCAL_WEBSITE_DIR
zip -r $ZIP_FILE ./*

# Upload via FTP
curl -T $ZIP_FILE ftp://$FTP_HOST/ --user $FTP_USER:$FTP_PASS --ssl --insecure

# Optional: log deployment
echo "$(date): Website deployed" >> ~/osanvault-africa/logs/deploy.log
