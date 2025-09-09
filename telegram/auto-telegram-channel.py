import time
import telegram

# ====== CONFIG ======
TOKEN = "7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL = "@OsanVaultAfrica"
POST_INTERVAL = 24 * 60 * 60  # 24 hours

# ====== PRE-WRITTEN POSTS ======
posts = [
    "🌍 Welcome to ÒsánVault Africa! Your gateway to fractionalized real estate and tokenized assets.",
    "📊 Learn about NET tokenomics and how you can stake, lend, and earn real on-chain yield!",
    "🏠 Explore tokenized properties and mineral resources across Africa.",
    "💡 Join our community programs and educational initiatives to maximize your investments.",
    "🌐 Future prospects: NFT loans, carbon credit tokenization, cross-chain adoption.",
    "🚀 Stay updated with our roadmap and upcoming projects on our website: https://osanvaultafrica.com"
]

# Initialize bot
bot = telegram.Bot(token=TOKEN)

def send_post(message):
    try:
        bot.send_message(chat_id=CHANNEL, text=message, parse_mode="HTML")
        print(f"✅ Posted to Telegram: {message[:30]}...")
    except Exception as e:
        print(f"❌ Failed to post: {e}")

# Loop through posts indefinitely
while True:
    for post in posts:
        send_post(post)
        time.sleep(POST_INTERVAL)
