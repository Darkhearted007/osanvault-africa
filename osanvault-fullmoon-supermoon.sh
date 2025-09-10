#!/bin/bash
# ÒsánVault Africa: Full Automation Installer
# Author: Darkhearted007
# Description: Installs bots, messages, GitHub sync, Telegram posting, Super-Moon & Oracle automation

echo "🚀 Starting ÒsánVault Africa full automation setup..."

# 1️⃣ Create necessary folders
mkdir -p ~/osanvault-africa/messages/{oracle,investor,inspiration}
mkdir -p ~/osanvault-africa/backups
touch ~/osanvault-africa/messages/index.txt \
      ~/osanvault-africa/messages/updates.json \
      ~/osanvault-africa/messages/investor/index.txt \
      ~/osanvault-africa/messages/investor/updates.json \
      ~/osanvault-africa/messages/inspiration/index.txt \
      ~/osanvault-africa/messages/inspiration/updates.json

# 2️⃣ Add sample prewritten messages
echo -e "🔮 Oracle Message: Today is favorable for investments and growth. Trust your intuition. Iwure guidance active." > ~/osanvault-africa/messages/oracle/index.txt
echo -e "📂 Investors: Welcome to ÒsánVault Africa! Own a piece of Nigeria, one piece at a time.\nYour journey to real-yield assets starts now." > ~/osanvault-africa/messages/investor/index.txt
echo -e "🌍 Inspiration: ÒsánVault Africa is live! Explore exclusive tokenized real estate investments.\nInvest today, build wealth tomorrow." > ~/osanvault-africa/messages/inspiration/index.txt

# 3️⃣ Install Termux dependencies
pkg update -y && pkg upgrade -y
pkg install curl jq python -y
pip install --upgrade pip
pip install openai tqdm pydantic distro annotated-types jiter typing_inspection

# 4️⃣ Run Super-Moon bot installer
if [ -f ~/osanvault-africa/osanvault-supermoon.sh ]; then
    bash ~/osanvault-africa/osanvault-supermoon.sh
else
    echo "⚠️ Supermoon script not found, skipping..."
fi

# 5️⃣ Run Oracle script
if [ -f ~/osanvault-africa/osanvault-oracle.sh ]; then
    bash ~/osanvault-africa/osanvault-oracle.sh
else
    echo "⚠️ Oracle script not found, skipping..."
fi

# 6️⃣ Setup GitHub auto-sync cron
echo "0 4 * * * cd ~/osanvault-africa && git pull origin main && git push origin main && git push backup main >> ~/osanvault-africa/auto-sync.log 2>&1" | crontab -

# 7️⃣ Setup Telegram bot config
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHAT_IDS=(-1003061632141 -1003040317412 -1002729725102)
echo -e "BOT_TOKEN='$BOT_TOKEN'\nCHAT_IDS=(${CHAT_IDS[@]})" > ~/osanvault-africa/telegram-config.sh

# 8️⃣ Telegram auto-post script
cat > ~/osanvault-africa/telegram-post.sh <<EOL
#!/bin/bash
source ~/osanvault-africa/telegram-config.sh
for CHAT_ID in "\${CHAT_IDS[@]}"; do
    TEXT=\$(cat ~/osanvault-africa/messages/oracle/index.txt)
    curl -s -X POST https://api.telegram.org/bot\$BOT_TOKEN/sendMessage -d chat_id=\$CHAT_ID -d text="\$TEXT"
done
EOL
chmod +x ~/osanvault-africa/telegram-post.sh

# 9️⃣ Telegram cron (auto-post every 3 hours)
echo "0 */3 * * * bash ~/osanvault-africa/telegram-post.sh >> ~/osanvault-africa/telegram.log 2>&1" | crontab -

# 1️⃣0️⃣ Final message
echo "✅ ÒsánVault Africa full automation setup complete!"
echo "📂 Messages ready in ~/osanvault-africa/messages"
echo "📄 Cron jobs active: auto-sync, Super-Moon & Oracle every 6 hours, Telegram auto-post every 3 hours"
echo "🌌 Ready to scale ÒsánVault Africa globally!"
