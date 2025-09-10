#!/data/data/com.termux/files/usr/bin/bash

BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHAT_ID="-1003061632141"  # Supergroup @OsanVaultAfrica
MSG_FILE="$HOME/osanvault-africa/messages/updates.json"
INDEX_FILE="$HOME/osanvault-africa/messages/index.txt"

# Ensure index file exists
[ ! -f "$INDEX_FILE" ] && echo "0" > "$INDEX_FILE"

# Read current index
IDX=$(cat "$INDEX_FILE")
MSG_COUNT=$(jq length "$MSG_FILE")
MSG=$(jq -r ".[$IDX].message" "$MSG_FILE")

# Send message
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -d chat_id="$CHAT_ID" \
    -d text="$MSG" \
    -d parse_mode="HTML"

# Update index
IDX=$(( (IDX + 1) % MSG_COUNT ))
echo "$IDX" > "$INDEX_FILE"
