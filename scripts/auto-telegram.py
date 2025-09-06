import requests
import schedule
import time
from telegram import Update, Bot
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# -------------------------
# CONFIGURATION
# -------------------------
BOT_TOKEN = "7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL_ID = "@OsanVaultAfrica"  # Your Telegram channel
bot = Bot(token=BOT_TOKEN)

# -------------------------
# HELPER FUNCTIONS
# -------------------------
def post_channel_message(message):
    try:
        bot.send_message(chat_id=CHANNEL_ID, text=message, parse_mode="HTML")
        print(f"✅ Posted: {message[:50]}...")
    except Exception as e:
        print(f"❌ Failed to post message: {e}")

# -------------------------
# AUTOMATED UPDATES
# -------------------------
def daily_update():
    message = "📢 Daily Update: Check new properties, roadmap updates, and token stats!\n🌐 Visit: https://osanvaultafrica.com"
    post_channel_message(message)

def token_update():
    # Replace with actual API or database call
    total_staked = 125000  # Example value
    message = f"📊 Token Update: {total_staked} NET tokens currently staked!"
    post_channel_message(message)

def welcome_message(user_name):
    message = f"👋 Welcome {user_name}! Learn about ÒsánVault Africa: https://osanvaultafrica.com/about.html"
    return message

# -------------------------
# COMMUNITY ENGAGEMENT HANDLERS
# -------------------------
def start(update: Update, context: CallbackContext):
    update.message.reply_text(
        f"👋 Welcome to ÒsánVault Africa!\nVisit: https://osanvaultafrica.com"
    )

def faq_handler(update: Update, context: CallbackContext):
    text = update.message.text.lower()
    if "token" in text:
        update.message.reply_text("NET Token: Your gateway to fractionalized real estate. https://osanvaultafrica.com/tokenomics.html")
    elif "roadmap" in text:
        update.message.reply_text("Roadmap: Check our milestones and future plans: https://osanvaultafrica.com/roadmap.html")
    elif "invest" in text:
        update.message.reply_text("Investing: Learn how to invest in tokenized assets: https://osanvaultafrica.com")
    else:
        update.message.reply_text("ℹ️ Learn more: https://osanvaultafrica.com")

# -------------------------
# SETUP BOT HANDLERS
# -------------------------
updater = Updater(BOT_TOKEN, use_context=True)
dp = updater.dispatcher

dp.add_handler(CommandHandler("start", start))
dp.add_handler(MessageHandler(Filters.text & ~Filters.command, faq_handler))

# -------------------------
# SCHEDULE AUTOMATIONS
# -------------------------
schedule.every().day.at("10:00").do(daily_update)
schedule.every().day.at("12:00").do(token_update)

# -------------------------
# RUN BOT IN BACKGROUND
# -------------------------
updater.start_polling()
print("🤖 ÒsánVault Africa Bot is running...")

while True:
    schedule.run_pending()
    time.sleep(60)
