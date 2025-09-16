#!/bin/bash
# ÒsánVault Africa: Ultimate AI + Telegram Oracle
# Author: Darkhearted007
# Description: Full automation with AI-generated posts, dynamic Ifá messages, and interactive Telegram bot

echo "🌌 Installing and configuring ÒsánVault Africa ultimate bot..."

# 1️⃣ Create all necessary folders
mkdir -p ~/osanvault-africa/messages/{oracle,investor,inspiration,ai,replies}
mkdir -p ~/osanvault-africa/backups
touch ~/osanvault-africa/messages/{oracle,index.txt,updates.json} \
      ~/osanvault-africa/messages/{investor,index.txt,updates.json} \
      ~/osanvault-africa/messages/{inspiration,index.txt,updates.json} \
      ~/osanvault-africa/messages/{ai,index.txt} \
      ~/osanvault-africa/messages/{replies,index.txt}

# 2️⃣ Sample prewritten messages
echo "🔮 Oracle: Today is favorable for investments. Trust your intuition. Iwure guidance active." > ~/osanvault-africa/messages/oracle/index.txt
echo "📂 Investor: Welcome to ÒsánVault Africa! Own a piece of Nigeria, one piece at a time." > ~/osanvault-africa/messages/investor/index.txt
echo "🌍 Inspiration: ÒsánVault Africa is live! Explore exclusive tokenized real estate investments." > ~/osanvault-africa/messages/inspiration/index.txt
echo "🤖 Reply: Thank you for reaching out. Your journey to tokenized real estate starts here." > ~/osanvault-africa/messages/replies/index.txt

# 3️⃣ Install dependencies
pkg update -y && pkg upgrade -y
pkg install curl jq python -y
pip install --upgrade pip
pip install openai tqdm pydantic distro annotated-types jiter typing_inspection

# 4️⃣ Configure GitHub auto-sync
echo "0 4 * * * cd ~/osanvault-africa && git pull origin main && git push origin main && git push backup main >> ~/osanvault-africa/auto-sync.log 2>&1" | crontab -

# 5️⃣ Telegram bot config
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHAT_IDS=(-1003061632141 -1003040317412 -1002729725102)
echo -e "BOT_TOKEN='$BOT_TOKEN'\nCHAT_IDS=(${CHAT_IDS[@]})" > ~/osanvault-africa/telegram-config.sh

# 6️⃣ AI post generator script
cat > ~/osanvault-africa/ai-generate.sh <<'EOL'
#!/bin/bash
source ~/osanvault-africa/telegram-config.sh
OPENAI_API_KEY="YOUR_OPENAI_KEY"

# Generate a fresh AI post blending Ifá wisdom
TEXT=$(python3 - <<END
import openai
openai.api_key = "$OPENAI_API_KEY"
prompt = "Write a 2-3 sentence engaging post for investors about tokenized real estate in Nigeria. Blend in Ifá esoteric guidance and inspirational messaging."
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role":"user","content":prompt}]
)
print(response.choices[0].message.content)
END
)

# Save to AI folder
echo "$TEXT" > ~/osanvault-africa/messages/ai/index.txt
EOL
chmod +x ~/osanvault-africa/ai-generate.sh

# 7️⃣ Telegram posting + auto-reply script
cat > ~/osanvault-africa/telegram-bot.sh <<'EOL'
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
EOL
chmod +x ~/osanvault-africa/telegram-bot.sh

# 8️⃣ Cron jobs: AI generation + Telegram posting every 3 hours
echo "0 */3 * * * bash ~/osanvault-africa/ai-generate.sh && bash ~/osanvault-africa/telegram-bot.sh >> ~/osanvault-africa/telegram.log 2>&1" | crontab -

echo "✅ ÒsánVault Africa Ultimate Bot setup complete!"
echo "📂 Messages folder: ~/osanvault-africa/messages"
echo "🕒 Cron jobs active for AI generation and auto-posting every 3 hours"
echo "🌍 Bot now dynamically blends Ifá wisdom, inspiration, and investor posts for global scaling!"
