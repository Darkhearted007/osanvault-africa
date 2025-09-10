#!/data/data/com.termux/files/usr/bin/bash
set -e

LOG=~/osanvault-africa/auto-sync.log
BOT_TOKEN="7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"

# Chat IDs
CHANNEL_ID="-1003040317412"   # @osanvault_updates
GROUP_ID="-1003061632141"     # @OsanVaultAfrica

notify_success() {
  MESSAGE="✅ ÒsánVault Africa Sync SUCCESS: $(date)"
  for CHAT in $CHANNEL_ID $GROUP_ID; do
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
         -d chat_id="$CHAT" -d text="$MESSAGE" > /dev/null
  done
}

notify_error() {
  MESSAGE="⚠️ ÒsánVault Africa Sync FAILED: $(date)\nError: $1"
  for CHAT in $CHANNEL_ID $GROUP_ID; do
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
         -d chat_id="$CHAT" -d text="$MESSAGE" > /dev/null
  done
}

{
  echo "🚀 Starting manual sync: $(date)"

  cd ~/osanvault-africa
  git pull origin main
  git push origin main
  git push backup main

  echo "✅ Manual sync finished: $(date)"
  notify_success

} >> "$LOG" 2>&1 || {
  ERROR_MSG=$(tail -n 5 "$LOG")
  notify_error "$ERROR_MSG"
  exit 1
}
