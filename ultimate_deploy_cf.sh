#!/data/data/com.termux/files/usr/bin/bash

# Cloudflare API Token (replace with yours)
CF_API_TOKEN="SMH3U0A56e63j5eGJabJGoIlR-UI6cMRvGPC4UOI"
DOMAIN="osanvaultafrica.com"
WWW_DOMAIN="www.osanvaultafrica.com"

# Install acme.sh if not installed
if [ ! -d "$HOME/.acme.sh" ]; then
    curl https://get.acme.sh | sh
fi

# Register Cloudflare API token
export CF_Token="$CF_API_TOKEN"
export CF_Account_ID=""  # optional if needed

# Issue SSL certificate via Cloudflare DNS
~/.acme.sh/acme.sh --issue --dns dns_cf -d $DOMAIN -d $WWW_DOMAIN

# Install certificates to ~/osanvault-africa/ssl
mkdir -p ~/osanvault-africa/ssl
~/.acme.sh/acme.sh --install-cert -d $DOMAIN \
--key-file ~/osanvault-africa/ssl/$DOMAIN.key \
--fullchain-file ~/osanvault-africa/ssl/$DOMAIN.crt

echo "[✅] SSL certificate installed in ~/osanvault-africa/ssl/"
