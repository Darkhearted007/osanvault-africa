mkdir -p ~/osanvault-africa/ai ~/osanvault-africa/messages ~/osanvault-africa/logs && \
pkg install python -y && \
pip install --upgrade pip && \
pip install solana requests pandas dash plotly pyngrok tqdm && \
touch ~/osanvault-africa/ai/dashboard_bot.py ~/osanvault-africa/ai/dashboard_public.py ~/osanvault-africa/ai/oracle_post.py ~/osanvault-africa/osanvault-post.sh && \
nohup python3 ~/osanvault-africa/ai/dashboard_bot.py > ~/osanvault-africa/logs/dashboard_bot.log 2>&1 & \
nohup python3 ~/osanvault-africa/ai/dashboard_public.py > ~/osanvault-africa/logs/dashboard_public.log 2>&1 & \
nohup python3 ~/osanvault-africa/ai/oracle_post.py > ~/osanvault-africa/logs/oracle_post.log 2>&1 & \
nohup bash ~/osanvault-africa/osanvault-post.sh > ~/osanvault-africa/logs/properties.log 2>&1 & \
cd ~/osanvault-africa && nohup git pull origin main >> ~/osanvault-africa/logs/manual_sync.log 2>&1 & \
echo "🚀 ✅ ÒsánVault Africa full system deployed in background:
- Dashboard bot logs: ~/osanvault-africa/logs/dashboard_bot.log
- Public dashboard logs: ~/osanvault-africa/logs/dashboard_public.log
- GitHub sync logs: ~/osanvault-africa/logs/manual_sync.log
- Oracle/Telegram logs: ~/osanvault-africa/logs/oracle_post.log
- Property/NFT update logs: ~/osanvault-africa/logs/properties.log
- Investor posts logs: ~/osanvault-africa/logs/investor_posts.log
All systems auto-updating, posting, multi-chain ready, and esoterically enhanced!"
