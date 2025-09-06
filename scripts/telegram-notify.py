import requests

# ÒsánVault Africa Telegram Notification Script
TOKEN = "7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHAT_ID = "@OsanVaultAfrica"  # Channel username prefixed with '@'
message = "🚀 Update: ÒsánVault Africa has new changes live!"

url = f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={CHAT_ID}&text={message}"
response = requests.get(url)

if response.status_code == 200:
    print("✅ Telegram notification sent!")
else:
    print(f"❌ Failed to send notification: {response.status_code}")
