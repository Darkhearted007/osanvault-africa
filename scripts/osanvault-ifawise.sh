#!/data/data/com.termux/files/usr/bin/bash
# ÒsánVault Africa: Ifá Wise Oracle Bot Installer

# Create messages folder
mkdir -p ~/osanvault-africa/messages/ifawise

# Install dependencies
pkg update -y
pkg install python -y
pip install --upgrade pip
pip install openai jq requests python-telegram-bot

# Create index file for message rotation
echo "0" > ~/osanvault-africa/messages/ifawise/index.txt

# Sample first mystical message
echo '🔮 ÒsánVault Oracle:
“Today, opportunities in tokenized real estate will open for those who act with foresight. Trust your inner guidance. Iwure protection is with you.”' > ~/osanvault-africa/messages/ifawise/message1.txt

# Telegram Bot Token (replace with yours)
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHAT_ID="-1003061632141" # Supergroup chat ID

# Function to post daily Ifá message
post_ifawise() {
    IDX=$(cat ~/osanvault-africa/messages/ifawise/index.txt)
    MSG_FILE=~/osanvault-africa/messages/ifawise/message$((IDX+1)).txt
    if [ ! -f "$MSG_FILE" ]; then
        IDX=0
        MSG_FILE=~/osanvault-africa/messages/ifawise/message1.txt
    fi
    MSG=$(cat "$MSG_FILE")
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" -d chat_id=$CHAT_ID -d text="$MSG"
    # update index
    MSG_COUNT=$(ls ~/osanvault-africa/messages/ifawise | grep message | wc -l)
    echo $(((IDX + 1) % MSG_COUNT)) > ~/osanvault-africa/messages/ifawise/index.txt
}

# Post immediately
post_ifawise

echo "✅ ÒsánVault Ifá Oracle Bot setup complete!"
