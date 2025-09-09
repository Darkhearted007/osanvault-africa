#!/bin/bash
# ÒsánVault Africa Automation Menu

while true; do
  clear
  echo "==============================="
  echo "   ÒsánVault Africa Automation "
  echo "==============================="
  echo "1. Deploy Website"
  echo "2. Post to Telegram Channel"
  echo "3. Send Email Newsletter"
  echo "4. Run Tokenomics Simulator"
  echo "5. Airdrop NET Tokens"
  echo "6. Community Growth Messages"
  echo "7. Backup Website & DB"
  echo "8. Monitor Site Health"
  echo "9. Exit"
  echo "==============================="
  read -p "Choose an option [1-9]: " choice

  case $choice in
    1)
      echo "🌍 Deploying website..."
      bash ~/osanvault-africa/scripts/deploy-website.sh
      read -p "Press Enter to continue..."
      ;;
    2)
      echo "📢 Posting to Telegram..."
      python3 ~/osanvault-africa/scripts/post-telegram.py
      read -p "Press Enter to continue..."
      ;;
    3)
      echo "📧 Sending Email Newsletter..."
      python3 ~/osanvault-africa/scripts/send-email.py
      read -p "Press Enter to continue..."
      ;;
    4)
      echo "📊 Running Tokenomics Simulator..."
      python3 ~/osanvault-africa/scripts/tokenomics.py
      read -p "Press Enter to continue..."
      ;;
    5)
      echo "🎁 Running NET Airdrop..."
      python3 ~/osanvault-africa/scripts/airdrop.py
      read -p "Press Enter to continue..."
      ;;
    6)
      echo "🚀 Posting Growth Messages..."
      bash ~/osanvault-africa/scripts/community-blast.sh
      read -p "Press Enter to continue..."
      ;;
    7)
      echo "💾 Running Backup..."
      bash ~/osanvault-africa/scripts/backup.sh
      read -p "Press Enter to continue..."
      ;;
    8)
      echo "📡 Monitoring Site Health..."
      bash ~/osanvault-africa/scripts/monitor.sh
      read -p "Press Enter to continue..."
      ;;
    9)
      echo "👋 Exiting... ÒsánVault Africa Automation Finished."
      exit 0
      ;;
    *)
      echo "❌ Invalid choice!"
      sleep 2
      ;;
  esac
done
