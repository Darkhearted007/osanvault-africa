#!/usr/bin/env python3
import requests, json, os
API_ENDPOINTS = [
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
import openai
openai.api_key = os.getenv("OPENAI_KEY")
for prop in all_properties:
    desc = prop.get("description","")
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role":"user","content":f"Enhance this property description for marketing: {desc}"}]
        )
        prop["ai_description"] = completion.choices[0].message.content
    except:
        prop["ai_description"] = desc
with open("/data/data/com.termux/files/home/www/osanvault-africa/frontend/properties.json", "w") as f:
    json.dump(all_properties, f, indent=2)
print(f"[INFO] Fetched {len(all_properties)} properties with AI descriptions.")
