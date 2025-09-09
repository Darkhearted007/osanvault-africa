import requests, os
import json
from datetime import datetime
import matplotlib.pyplot as plt

CHARTS_DIR="assets/charts"
os.makedirs(CHARTS_DIR, exist_ok=True)
TOP_N=5

# NET price
try:
    net = requests.get("https://api.coingecko.com/api/v3/coins/nigeriaestate-token/market_chart?vs_currency=usd&days=7").json()
    prices = [p[1] for p in net.get("prices",[])]
    timestamps = [datetime.fromtimestamp(p[0]/1000) for p in net.get("prices",[])]
except:
    prices, timestamps = [0]*7, [datetime.now()]*7

plt.figure(figsize=(6,2))
plt.plot(timestamps, prices, marker='o', color='green')
plt.title("NET Price Trend (USD)")
plt.savefig(f"{CHARTS_DIR}/net_price.svg", format='svg', bbox_inches='tight')
plt.close()

# Top properties
try:
    props = requests.get("https://osanvaultafrica.com/api/properties").json()
except:
    props = []

top_props = sorted(props, key=lambda x:x.get("price",0), reverse=True)[:TOP_N]
names = [p.get("name","Unnamed") for p in top_props]
prices = [p.get("price",0) for p in top_props]

plt.figure(figsize=(6,2))
plt.barh(names, prices, color='orange')
plt.xlabel("USD Price")
plt.title("Top Properties")
plt.savefig(f"{CHARTS_DIR}/top_properties.svg", format='svg', bbox_inches='tight')
plt.close()
