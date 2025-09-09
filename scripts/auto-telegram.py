import requests
import time

TOKEN = "7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHANNEL = "@OsanVaultAfrica"

messages = [
    "Welcome to ÒsánVault Africa! 🌍\nVisit: https://osanvaultafrica.com",
    "Learn about our roadmap: https://osanvaultafrica.com/roadmap.html",
    "Check NET tokenomics: https://osanvaultafrica.com/tokenomics.html",
]

def post_to_telegram(msg):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": CHANNEL, "text": msg}
    try:
        requests.post(url, data=payload)
    except Exception as e:
        print("Error sending message:", e)

while True:
    for msg in messages:
        post_to_telegram(msg)
        time.sleep(3600)  # 1 hour between messages
