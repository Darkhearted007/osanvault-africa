import time, logging, requests, random, json, threading, pandas as pd, plotly.graph_objects as go
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
from pyngrok import ngrok
from solana.rpc.api import Client
from telegram import Bot

# Logging
logging.basicConfig(filename='/data/data/com.termux/files/home/osanvault-africa/logs/dashboard_bot.log',
                    level=logging.INFO, format='%(asctime)s %(message)s')

# Telegram Bot
TELEGRAM_TOKEN = "7624236697:AAH_WELRZ1sL9f7iGaMNwM4DfLKgFhH3rSI"
CHAT_IDS = [-1003061632141, -1003040317412]  # Supergroup & channel
bot = Bot(token=TELEGRAM_TOKEN)

# Solana client
solana_client = Client("https://api.mainnet-beta.solana.com")
NET_ADDRESS = "7rDzXgyZhNEZT9KFoNowL7fo8cbdryg8RnVUhuN2MjXd"

# Prewritten messages
with open('/data/data/com.termux/files/home/osanvault-africa/messages/index.txt') as f:
    messages = [line.strip() for line in f if line.strip()]

# Investor analytics storage
INVESTOR_FILE = '/data/data/com.termux/files/home/osanvault-africa/analytics/investors.json'

def get_net_balance(address):
    try:
        balance = solana_client.get_balance(address)['result']['value']
        return balance / 10**9
    except:
        return 0

def get_net_price():
    try:
        price = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=nigeriaestate-token&vs_currencies=usd").json()
        return price.get("nigeriaestate-token", {}).get("usd", 0)
    except:
        return 0

def post_to_telegram(text):
    for chat_id in CHAT_IDS:
        try:
            bot.send_message(chat_id=chat_id, text=text)
        except Exception as e:
            logging.error(f"Telegram error: {e}")

def update_investor_data(wallet_address):
    try:
        balance = get_net_balance(wallet_address)
        with open(INVESTOR_FILE, 'r+') as f:
            data = json.load(f)
            found = False
            for inv in data:
                if inv['wallet'] == wallet_address:
                    inv['balance'] = balance
                    found = True
            if not found:
                data.append({"wallet": wallet_address, "balance": balance})
            f.seek(0)
            json.dump(data, f, indent=2)
            f.truncate()
        logging.info(f"Investor data updated for {wallet_address}")
    except Exception as e:
        logging.error(f"Investor analytics error: {e}")

# Dash web dashboard
app = Dash(__name__)
df_price = pd.DataFrame(columns=["Time", "Price"])

app.layout = html.Div([
    html.H1("ÒsánVault Africa Dashboard ✨"),
    dcc.Graph(id="net-price-graph"),
    dcc.Interval(id="interval-component", interval=60000, n_intervals=0),
])

@app.callback(Output("net-price-graph", "figure"), [Input("interval-component", "n_intervals")])
def update_graph(n):
    global df_price
    price = get_net_price()
    df_price = pd.concat([df_price, pd.DataFrame({"Time":[n],"Price":[price]})], ignore_index=True)
    fig = go.Figure([go.Scatter(x=df_price["Time"], y=df_price["Price"], mode="lines+markers")])
    return fig

# Public URL via ngrok
public_url = ngrok.connect(8050)
print("🚀 Public dashboard URL:", public_url)

# Bot & analytics loop
def bot_loop():
    idx = 0
    while True:
        try:
            balance = get_net_balance(NET_ADDRESS)
            message = f"{messages[idx % len(messages)]}\n💎 NET Wallet Balance: {balance} SOL\n💰 NET Price: ${get_net_price()}"
            post_to_telegram(message)
            update_investor_data(NET_ADDRESS)
            logging.info(message)
            idx += 1
        except Exception as e:
            logging.error(f"Bot loop error: {e}")
        time.sleep(3600)

threading.Thread(target=bot_loop, daemon=True).start()

if __name__ == "__main__":
    app.run_server(host="0.0.0.0", port=8050)
