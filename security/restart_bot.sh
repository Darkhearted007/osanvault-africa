#!/data/data/com.termux/files/usr/bin/bash
while true; do
  pkill -f dashboard_bot.py
  nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 &
  sleep 300
done
