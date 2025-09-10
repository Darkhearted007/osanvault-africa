#!/bin/bash
# ÒsánVault Africa: Dynamic AI + Telegram Auto-Poster
# Author: Darkhearted007
# Description: Full automation with AI-generated investor posts and rotating Oracle/Inspiration messages

echo "🚀 Starting ÒsánVault Africa dynamic AI automation..."

# 1️⃣ Create folders
mkdir -p ~/osanvault-africa/messages/{oracle,investor,inspiration,ai}
mkdir -p ~/osanvault-africa/backups
touch ~/osanvault-africa/messages/{oracle,index.txt,updates.json} \
      ~/osanvault-africa/messages/{investor,index.txt,updates.json} \
      ~/osanvault-africa/messages/{inspiration,index.txt,updates.json} \
      ~/osanvault-africa/messages/ai/index.txt

# 2️⃣ Sample prewritten messages
echo "🔮 Oracle: Today is favorable for investments. Trust intuition. Iwure guidance active." > ~/osanvault-africa/messages/oracle/index.txt
echo "📂 Investor: Welcome to ÒsánVault Africa! Own a piece of Nigeria, one piece at a time." > ~/osanvault-africa/messages/investor/index.txt
echo "🌍 Inspiration: ÒsánVault Africa is live! Explore exclusive tokenized real estate investments." > ~/osanvault-africa/messages/inspiration/index.txt

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

# 6️⃣ AI generator script for investor posts
cat > ~/osanvault-africa/ai-generate.sh <<'EOL'
#!/bin/bash
source ~/osanvault-africa/telegram-config.sh
OPENAI_API_KEY="YOUR_OPENAI_KEY"

# Generate a fresh investor post
TEXT=$(python3 - <<END
import openai
openai.api_key = "$OPENAI_API_KEY"
prompt = "Write a 2-3 sentence engaging post for investors about tokenized real estate in Nigeria with Ifá esoteric wisdom blended in."
response = openai.ChatCompletion.create(model="gpt-4", messages=[{"role":"user","content":prompt}])
print(response.choices[0].message.content)
END
)

# Save to AI folder
echo "$TEXT" > ~/osanvault-africa/messages/ai/index.txt
EOL
chmod +x ~/osanvault-africa/ai-generate.sh

# 7️⃣ Telegram auto-post script (rotates messages)
cat > ~/osanvault-africa/telegram-post.sh <<'EOL'
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
EOL
chmod +x ~/osanvault-africa/telegram-post.sh

# 8️⃣ Cron jobs
# Auto-post every 3 hours
echo "0 */3 * * * bash ~/osanvault-africa/ai-generate.sh && bash ~/osanvault-africa/telegram-post.sh >> ~/osanvault-africa/telegram.log 2>&1" | crontab -

echo "✅ Dynamic AI + Telegram setup complete!"
echo "📂 Messages folder ready at ~/osanvault-africa/messages"
echo "🕒 Cron jobs active for AI generation and posting every 3 hours"
echo "🌌 Ready to scale ÒsánVault Africa globally!"
