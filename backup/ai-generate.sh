#!/bin/bash
source ~/osanvault-africa/telegram-config.sh
OPENAI_API_KEY="YOUR_OPENAI_KEY"

# Generate a fresh AI post blending Ifá wisdom
TEXT=$(python3 - <<END
import openai
openai.api_key = "$OPENAI_API_KEY"
prompt = "Write a 2-3 sentence engaging post for investors about tokenized real estate in Nigeria. Blend in Ifá esoteric guidance and inspirational messaging."
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role":"user","content":prompt}]
)
print(response.choices[0].message.content)
END
)

# Save to AI folder
echo "$TEXT" > ~/osanvault-africa/messages/ai/index.txt
