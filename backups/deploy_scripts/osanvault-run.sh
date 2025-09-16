#!/bin/bash
# ÒsánVault Africa – One-command Termux Launcher

# Set paths
PROJECT_DIR=~/osanvault-africa
SCRIPTS_DIR=$PROJECT_DIR/scripts
LOG_FILE=$PROJECT_DIR/deploy.log

echo "🚀 Starting ÒsánVault Africa automated run..." | tee -a $LOG_FILE

# Step 1: Backup server
echo "🗂️ Backing up server files..." | tee -a $LOG_FILE
bash $SCRIPTS_DIR/backup-server.sh 2>&1 | tee -a $LOG_FILE

# Step 2: Deploy website
echo "🌐 Deploying website..." | tee -a $LOG_FILE
bash $SCRIPTS_DIR/deploy-truehost-auto.sh 2>&1 | tee -a $LOG_FILE

# Step 3: Send Telegram notification
echo "📣 Sending Telegram update..." | tee -a $LOG_FILE
python3 $SCRIPTS_DIR/telegram-notify.py 2>&1 | tee -a $LOG_FILE

echo "✅ ÒsánVault Africa run complete!" | tee -a $LOG_FILE
