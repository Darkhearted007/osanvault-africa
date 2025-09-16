#!/bin/bash
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL_ID="-1003040317412"
MSG=$(jq -r ".messages | .[ (now|floor) % ( . | length ) ]" ~/osanvault-africa/messages.json)
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
     -d "chat_id=$CHANNEL_ID" \
     -d "text=$MSG"
