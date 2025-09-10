#!/bin/bash
source ~/osanvault-africa/telegram-config.sh

# Folders to rotate
FOLDERS=(oracle investor inspiration ai)

for CHAT_ID in "${CHAT_IDS[@]}"; do
  # Rotate randomly
  FOLDER=${FOLDERS[$RANDOM % ${#FOLDERS[@]}]}
  FILE=~/osanvault-africa/messages/$FOLDER/index.txt
  if [ -f "$FILE" ]; then
    TEXT=$(cat "$FILE")
    curl -s -X POST https://api.telegram.org/bot$BOT_TOKEN/sendMessage -d chat_id=$CHAT_ID -d text="$TEXT"
  fi
done
