#!/bin/bash
BUILD_DIR=~/osanvault-africa
WEB_ROOT=/var/www/osanvaultafrica
mkdir -p $WEB_ROOT
cp -r $BUILD_DIR/* $WEB_ROOT/
chown -R www-data:www-data $WEB_ROOT
chmod -R 755 $WEB_ROOT
echo "✅ Website deployed!"
