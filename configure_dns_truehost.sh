#!/bin/bash
# TrueHost DNS Auto Config for OsanVaultAfrica.com
# Requirements: curl, jq
# Usage: bash configure_dns_truehost.sh

API_KEY="AQKE5UXR28KHVT0OR7S982JYGHFCNZK7"
DOMAIN="osanvaultafrica.com"
IP="141.95.120.221"

echo "[*] Configuring DNS for $DOMAIN..."

# Function to create DNS record
create_dns() {
    TYPE=$1
    NAME=$2
    VALUE=$3

    curl -s -X POST "https://api.truehost.cloud/domains/dns/create" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
        \"domain\": \"$DOMAIN\",
        \"type\": \"$TYPE\",
        \"name\": \"$NAME\",
        \"value\": \"$VALUE\",
        \"ttl\": \"3600\"
    }" | jq
}

# Main records
create_dns "A" "@" "$IP"
create_dns "A" "www" "$IP"
create_dns "A" "ftp" "$IP"
create_dns "A" "cpanel" "$IP"
create_dns "CNAME" "mail" "@"

# Optional subdomains
SUBS=("autoconfig" "autodiscover" "cpcalendars" "cpcontacts" "webdisk" "webmail")
for sub in "${SUBS[@]}"; do
    create_dns "A" "$sub" "$IP"
done

# MX record
curl -s -X POST "https://api.truehost.cloud/domains/dns/create" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
    \"domain\": \"$DOMAIN\",
    \"type\": \"MX\",
    \"name\": \"@\",
    \"value\": \"$DOMAIN\",
    \"priority\": 10,
    \"ttl\": \"3600\"
}" | jq

echo "[✅] DNS configuration completed for $DOMAIN"
