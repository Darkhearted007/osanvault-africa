#!/bin/bash
# ÒsánVault Africa Supermoon Installer 🌍🔥
# Auto-installs bot, messages, cronjob, Ifá + iwure infused posts

set -e

echo "🚀 Installing dependencies..."
pkg install -y curl jq

BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL_ID="-1003040317412"   # @osanvault_updates channel

# Prewritten messages file
cat > ~/osanvault-africa/messages.json <<'EOF'
{
  "messages": [
    "🌍 ÒsánVault Africa: Own a piece of Nigeria, one piece at a time.",
    "💡 Web3 + Real Estate + Ifá Wisdom = A global revolution. Join us.",
    "🕊️ Iwúrè: May your path be clear, may your wealth multiply like the sand by the ocean.",
    "📈 Investors worldwide are waking up. Be among the first to hold NigeriaEstate Token (NET).",
    "🔮 Ifá says: 'Ọ̀rúnmìlà guides those who prepare early.' — ÒsánVault Africa prepares you for generational wealth."
  ]
}
EOF

# Posting script
cat > ~/osanvault-africa/osanvault-post.sh <<'EOF'
#!/bin/bash
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL_ID="-1003040317412"
MSG=$(jq -r ".messages | .[ (now|floor) % ( . | length ) ]" ~/osanvault-africa/messages.json)
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
     -d "chat_id=$CHANNEL_ID" \
     -d "text=$MSG"
EOF
chmod +x ~/osanvault-africa/osanvault-post.sh

echo "✅ Supermoon bot installed. Run:"
echo "   ~/osanvault-africa/osanvault-post.sh"
# Add cronjob for automatic posts every 6 hours
(crontab -l 2>/dev/null; echo "0 */6 * * * ~/osanvault-africa/osanvault-post.sh >> ~/osanvault-africa/post.log 2>&1") | crontab -

echo "⏳ Auto-posting cronjob installed: every 6 hours"
echo "   Logs: ~/osanvault-africa/post.log"
