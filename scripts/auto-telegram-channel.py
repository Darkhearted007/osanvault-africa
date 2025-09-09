#!/usr/bin/env python3
import time
import requests

# === Telegram Bot Config ===
TOKEN = "7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL = "@OsanVaultAfrica"

# === Post Interval in seconds ===
POST_INTERVAL = 24 * 60 * 60  # daily posts; adjust as needed

# === 30-Day Pre-Written Content ===
posts = [
    "🌍 Welcome to ÒsánVault Africa! Your gateway to fractionalized real estate and tokenized assets. Visit: https://osanvaultafrica.com",
    "💡 Learn how NET Token powers real estate investments, staking, and governance. Contact: info@osanvaultafrica.com",
    "🏠 Explore tokenized properties across Nigeria and Africa. Start investing safely today! https://osanvaultafrica.com",
    "📊 Your NET tokens can earn real on-chain yield through staking and lending. More info: info@osanvaultafrica.com",
    "🌐 Our platform bridges crypto and fiat for accessibility to all investors. Check us out: https://osanvaultafrica.com",
    "🛡️ Compliance matters! ÒsánVault partners with governments and institutions. Email: info@osanvaultafrica.com",
    "📣 Join our Telegram community to discuss, learn, and share investment ideas! https://t.me/OsanVaultAfrica",
    "🔹 What is NET Token? NET is your key to fractional ownership of assets. Visit: https://osanvaultafrica.com",
    "🔹 How to stake NET tokens and earn passive income on-chain. Questions? info@osanvaultafrica.com",
    "🔹 Lending with NET: Lend your tokens for additional yield. Learn more: https://osanvaultafrica.com",
    "🔹 Governance: Vote on platform decisions using NET tokens. Contact: info@osanvaultafrica.com",
    "🔹 Tokenomics: Total supply, allocation, and distribution explained. Details: https://osanvaultafrica.com",
    "🔹 How NET integrates with future features like NFT loans and cross-chain assets. info@osanvaultafrica.com",
    "🔹 Quick tip: Track your NET token holdings via your dashboard: https://osanvaultafrica.com",
    "🏢 Tokenized Real Estate: Invest in high-potential properties fractionally. info@osanvaultafrica.com",
    "⛏️ Tokenized Mineral Resources: Own a piece of Nigeria’s mineral wealth. https://osanvaultafrica.com",
    "🌱 Carbon Credits & Sustainability: Participate in environmental projects via tokens. info@osanvaultafrica.com",
    "💎 High ROI opportunities: Learn which properties and resources yield more. Visit: https://osanvaultafrica.com",
    "📈 Market trends: Why Africa’s tokenized assets are booming. info@osanvaultafrica.com",
    "💼 Partner Spotlight: Collaborations with governments and private institutions. https://osanvaultafrica.com",
    "🏦 Platform Safety: Learn how your investments are secured on-chain. info@osanvaultafrica.com",
    "🎯 Community Highlight: Meet top investors and success stories. https://t.me/OsanVaultAfrica",
    "🗓️ Upcoming Features: NFT loans, cross-chain integration, and carbon credits. info@osanvaultafrica.com",
    "📚 Education Series: How to read your dashboard & understand returns. Visit: https://osanvaultafrica.com",
    "🏆 Referral Program: Invite friends and earn NET tokens. info@osanvaultafrica.com",
    "🤝 Partnerships: How ÒsánVault works with local governments for compliance. https://osanvaultafrica.com",
    "🛠️ Platform Updates: New tools and dashboard features explained. info@osanvaultafrica.com",
    "💬 Community Poll: Vote for next features to be added to ÒsánVault. https://t.me/OsanVaultAfrica",
    "📢 Weekly Summary: Highlights, top investors, and key metrics. info@osanvaultafrica.com",
    "🎉 Celebrate Month 1! Recap, thank the community, and outline next month’s roadmap. https://osanvaultafrica.com"
]

# === Telegram Send Function ===
def send_post(message):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {
        "chat_id": CHANNEL,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, data=payload)
        if response.status_code == 200:
            print(f"✅ Post sent: {message[:40]}...")
        else:
            print(f"⚠️ Failed to send post: {response.text}")
    except Exception as e:
        print(f"⚠️ Exception: {e}")

# === Run Automation ===
if __name__ == "__main__":
    print("🚀 ÒsánVault Africa Telegram Auto-Poster started!")
    while True:
        for post in posts:
            send_post(post)
            time.sleep(POST_INTERVAL)
