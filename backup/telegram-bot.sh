#!/bin/bash
source ~/osanvault-africa/telegram-config.sh

# Rotate messages
FOLDERS=(oracle investor inspiration ai)
for CHAT_ID in "${CHAT_IDS[@]}"; do
  FOLDER=${FOLDERS[$RANDOM % ${#FOLDERS[@]}]}
  FILE=~/osanvault-africa/messages/$FOLDER/index.txt
  if [ -f "$FILE" ]; then
    TEXT=$(cat "$FILE")
    curl -s -X POST https://api.telegram.org/bot$BOT_TOKEN/sendMessage -d chat_id=$CHAT_ID -d text="$TEXT"
  fi
done

# Auto-reply to new messages
UPDATES=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getUpdates?offset=-1")
MSG_ID=$(echo $UPDATES | jq '.result[-1].message.message_id')
CHAT=$(echo $UPDATES | jq '.result[-1].message.chat.id')
REPLY_TEXT=$(cat ~/osanvault-africa/messages/replies/index.txt)
if [ "$CHAT" != "null" ] && [ "$MSG_ID" != "null" ]; then
  curl -s -X POST https://api.telegram.org/bot$BOT_TOKEN/sendMessage -d chat_id=$CHAT -d text="$REPLY_TEXT" -d reply_to_message_id=$MSG_ID
fi
