#!/data/data/com.termux/files/usr/bin/python3
import os, json, requests
from bs4 import BeautifulSoup
import matplotlib.pyplot as plt

project_dir = os.path.join(os.path.dirname(__file__), "..")
site_dir = os.path.join(project_dir, "site")
data_dir = os.path.join(project_dir, "data")
os.makedirs(site_dir, exist_ok=True)
os.makedirs(data_dir, exist_ok=True)

# --- NET token live info ---
net_data = {"net_supply": "1,000,000,000 NET", "net_price": "₦50"}

# --- Fetch live Nigerian properties ---
properties = []
urls = [
    "https://www.privateproperty.com.ng/property-for-sale",
    "https://www.propertypro.ng/property-for-sale"
]

headers = {"User-Agent": "Mozilla/5.0"}

for url in urls:
    try:
        r = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        listings = soup.find_all("div", class_="listing-card")[:5]
        for l in listings:
            name = l.find("h2").get_text(strip=True) if l.find("h2") else "Unknown"
            location = l.find("div", class_="listing-location").get_text(strip=True) if l.find("div", class_="listing-location") else "Unknown"
            price = l.find("div", class_="listing-price").get_text(strip=True) if l.find("div", class_="listing-price") else "N/A"
            desc = l.find("p").get_text(strip=True) if l.find("p") else ""
            properties.append({"name": name, "location": location, "price": price, "description": desc})
    except Exception as e:
        print(f"⚠ Failed to fetch {url}: {e}")

# Save property JSON
with open(os.path.join(data_dir, "properties.json"), "w") as f:
    json.dump(properties, f, indent=2)

# --- Generate chart ---
prices = []
names = []
for p in properties:
    price = ''.join(c for c in p['price'] if c.isdigit())
    if price: prices.append(int(price)); names.append(p['name'])
if prices:
    plt.bar(names, prices)
    plt.xticks(rotation=45, ha='right')
    plt.ylabel("Price (₦)")
    plt.tight_layout()
    plt.savefig(os.path.join(site_dir, "chart.png"))
plt.close()

# --- Generate HTML ---
with open(os.path.join(project_dir, "templates/index-template.html")) as f:
    html = f.read()

props_html = ""
for p in properties:
    props_html += f"<div class='property'><h2>{p['name']}</h2><p>{p['location']} - {p['price']}</p><p>{p['description']}</p></div>"

charts_html = "<img src='chart.png' alt='Property Price Chart'>" if prices else ""

html = html.replace("{{net_supply}}", net_data["net_supply"])
html = html.replace("{{net_price}}", net_data["net_price"])
html = html.replace("{{properties}}", props_html)
html = html.replace("{{charts}}", charts_html)

with open(os.path.join(site_dir, "index.html"), "w") as f:
    f.write(html)

print("✅ Fullmoon site generated with live properties, charts, NET token metrics.")
