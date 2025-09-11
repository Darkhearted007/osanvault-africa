#!/data/data/com.termux/files/usr/bin/bash
# Fetch latest legal property listings
API_URL="https://api.example-realestate.ng/properties?status=legal"
DATA_FILE=/data/data/com.termux/files/home/www/osanvault-africa/frontend/data.json

# Fetch properties
curl -s "$API_URL" -H "Authorization: Bearer YOUR_REAL_ESTATE_API_KEY" -o "$DATA_FILE"

# Enrich descriptions with OpenAI
jq -c '.properties[]' "$DATA_FILE" | while read prop; do
    TITLE=$(echo $prop | jq -r '.title')
    DESC=$(echo $prop | jq -r '.description')
    ENRICHED_DESC=$(curl -s https://api.openai.com/v1/chat/completions         -H "Content-Type: application/json"         -H "Authorization: Bearer YOUR_OPENAI_API_KEY"         -d '{
            "model": "gpt-4-mini",
            "messages": [{"role": "user", "content": "Enhance this property description for SEO and readability: '"$DESC"'"}],
            "max_tokens": 150
        }' | jq -r '.choices[0].message.content')
    jq --arg d "$ENRICHED_DESC" '(.properties[] | select(.title=="'""'").description) |= $d' "$DATA_FILE" > "$DATA_FILE.tmp" && mv "$DATA_FILE.tmp" "$DATA_FILE"
done
