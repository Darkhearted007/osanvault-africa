#!/data/data/com.termux/files/usr/bin/bash

# ===============================================================
# ÒsánVault Africa FullMoon SuperMoon AI Installer
# All-in-one automation for Termux
# ===============================================================

# Set paths
OSAN_PATH="$HOME/osanvault-africa"
BACKUP_REPO="git@github.com:Darkhearted007/osanvault-backup.git"
ORIGIN_REPO="https://github.com/Darkhearted007/osanvault-africa.git"
POST_LOG="$OSAN_PATH/post.log"
SYNC_LOG="$OSAN_PATH/auto-sync.log"
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"

echo "🚀 Starting ÒsánVault Africa FullMoon SuperMoon AI setup..."

# -------------------------
# 1️⃣ Update Termux & Install Dependencies
# -------------------------
pkg update -y && pkg upgrade -y
pkg install git curl python jq -y
pip install --upgrade pip
pip install openai pydantic tqdm distro annotated-types

# -------------------------
# 2️⃣ GitHub Repo Setup
# -------------------------
mkdir -p "$OSAN_PATH"
cd "$OSAN_PATH" || exit
git init
git remote add origin "$ORIGIN_REPO" 2>/dev/null
git remote add backup "$BACKUP_REPO" 2>/dev/null

echo "📂 Pulling latest code..."
git pull origin main || git fetch origin main
git push backup main || echo "⚠️ Backup push skipped (first run?)"

# -------------------------
# 3️⃣ Create Messages Directory & Sample Content
# -------------------------
mkdir -p "$OSAN_PATH/messages"
cat > "$OSAN_PATH/messages/index.txt" <<EOL
Welcome to ÒsánVault Africa!
Invest in tokenized real estate across Africa.
Daily Ifa wisdom: "Iwure guides the wise investor."
Maximize your ROI with our verified properties.
EOL

jq -n '[]' > "$OSAN_PATH/messages/updates.json"

# -------------------------
# 4️⃣ Telegram Bot Auto-Poster
# -------------------------
cat > "$OSAN_PATH/osanvault-post.sh" <<'EOL'
#!/data/data/com.termux/files/usr/bin/bash
OSAN_PATH="$HOME/osanvault-africa"
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNELS=(-1003061632141 -1003040317412) # Supergroup & Channel IDs

# Load messages
MSG_FILE="$OSAN_PATH/messages/index.txt"
MSG_COUNT=$(wc -l < "$MSG_FILE")
IDX_FILE="$OSAN_PATH/messages/index.txt.idx"
[ ! -f "$IDX_FILE" ] && echo 0 > "$IDX_FILE"
IDX=$(cat "$IDX_FILE")
MSG=$(sed -n "$((IDX+1))p" "$MSG_FILE")

for CHAT_ID in "${CHANNELS[@]}"; do
  curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
       -d "chat_id=$CHAT_ID&text=$MSG&parse_mode=Markdown"
done

# Update index
echo $(( (IDX + 1) % MSG_COUNT )) > "$IDX_FILE"
EOL
chmod +x "$OSAN_PATH/osanvault-post.sh"

# -------------------------
# 5️⃣ Cron Jobs Setup
# -------------------------
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 4 * * * cd $OSAN_PATH && git pull origin main && git push origin main && git push backup main >> $SYNC_LOG 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 */6 * * * bash $OSAN_PATH/osanvault-post.sh >> $POST_LOG 2>&1") | crontab -

# -------------------------
# 6️⃣ GitHub Pages Prep
# -------------------------
mkdir -p "$OSAN_PATH/site"
echo "<html><head><title>ÒsánVault Africa</title></head><body><h1>Welcome to ÒsánVault Africa</h1></body></html>" > "$OSAN_PATH/site/index.html"

# -------------------------
# 7️⃣ Finish
# -------------------------
echo "✅ Setup complete!"
echo "📄 Logs: $POST_LOG, $SYNC_LOG"
echo "🌌 Auto-posting every 6 hours & Git sync daily at 4AM"
echo "💾 GitHub Pages site ready in $OSAN_PATH/site"
echo "🚀 Run ~/osanvault-africa/osanvault-post.sh to test bot posts"
