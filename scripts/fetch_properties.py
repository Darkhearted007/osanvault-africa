#!/usr/bin/env python3
import requests, json

API_ENDPOINTS = [
    # Example real estate platforms
    "https://example-realestate1.com/api/properties",
    "https://example-realestate2.com/api/properties"
]

all_properties = []

for url in API_ENDPOINTS:
    try:
        r = requests.get(url)
        data = r.json()
        all_properties.extend(data.get("properties", []))
    except:
        pass

with open("/data/data/com.termux/files/home/www/osanvault-africa/frontend/properties.json", "w") as f:
    json.dump(all_properties, f, indent=2)

print(f"[INFO] Fetched {len(all_properties)} properties.")
