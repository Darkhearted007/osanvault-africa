#!/data/data/com.termux/files/usr/bin/bash
# Ultimate Termux Deployment for ÒsánVault Africa

# --- CONFIG ---
DOMAIN="osanvaultafrica.com"
WWW_DOMAIN="www.osanvaultafrica.com"
EMAIL="olugbenga1000@gmail.com"
CLOUDFLARE_API_TOKEN="AQKE5UXR28KHVT0OR7S982JYGHFCNZK7"
SSL_DIR="$HOME/osanvault-africa/ssl"
LANDING_DIR="$HOME/osanvault-africa/landing"
BOT_DIR="$HOME/osanvault-africa"

# --- FUNCTIONS ---
echo "[🚀] Starting ÒsánVault Africa Ultimate Deployment..."

mkdir -p "$SSL_DIR" "$LANDING_DIR"

# --- INSTALL ACME.SH ---
if [ ! -f "$HOME/.acme.sh/acme.sh" ]; then
    echo "[1/6] Installing acme.sh..."
    curl https://get.acme.sh | sh
    source "$HOME/.bashrc"
fi

# --- REGISTER ACCOUNT ---
echo "[2/6] Registering ZeroSSL account..."
~/.acme.sh/acme.sh --register-account -m "$EMAIL" --server zerossl

# --- ISSUE SSL via Cloudflare DNS ---
echo "[3/6] Issuing SSL for $DOMAIN and $WWW_DOMAIN..."
export CF_Token="$CLOUDFLARE_API_TOKEN"
export CF_AccountEmail="$EMAIL"

~/.acme.sh/acme.sh --issue --dns dns_cf -d "$DOMAIN" -d "$WWW_DOMAIN" --force --debug

# --- INSTALL CERTS LOCALLY ---
echo "[4/6] Installing certificates..."
mkdir -p "$SSL_DIR"
~/.acme.sh/acme.sh --install-cert -d "$DOMAIN" \
    --key-file "$SSL_DIR/$DOMAIN.key" \
    --fullchain-file "$SSL_DIR/$DOMAIN.crt" \
    --reloadcmd "echo '[✅] SSL installed and ready.'"

# --- SERVE LANDING PAGE via HTTPS ---
echo "[5/6] Starting HTTPS Python server for landing page..."
nohup python3 -m http.server 443 --bind 0.0.0.0 --directory "$LANDING_DIR" \
    --ssl-keyfile "$SSL_DIR/$DOMAIN.key" \
    --ssl-certfile "$SSL_DIR/$DOMAIN.crt" &

# --- START BOT SCRIPTS ---
echo "[6/6] Starting all Python bots..."
for bot in "$BOT_DIR"/bots/*.py; do
    nohup python3 "$bot" &
done

# --- SETUP AUTO-RENEWAL ---
echo "[🔄] Installing acme.sh cron job for auto-renewal..."
~/.acme.sh/acme.sh --install-cronjob

echo "[🎯] Deployment complete! ÒsánVault Africa is live with HTTPS and bots running."
