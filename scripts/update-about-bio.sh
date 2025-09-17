#!/bin/bash
ABOUT_PAGE="about.html"

# Founder bio HTML block
FOUNDER_BIO="<section id=\"founder-bio\">
  <h2>About the Founder</h2>
  <p><strong>Olugbenga Ajayi</strong> is the visionary founder of <strong>ÒsánVault Africa</strong>, a pioneering Web3 platform transforming how Africans invest in real estate, minerals, and emerging assets. With a deep belief that blockchain can unlock wealth and inclusion for millions, he is leading the tokenization of land, properties, and natural resources through the <strong>NigeriaEstate Token (NET)</strong>.</p>
  <p>Driven by innovation and purpose, Olugbenga is building ÒsánVault Africa not just as a company, but as a <em>movement</em> — one that empowers everyday people to own fractional stakes in valuable assets, access real yield, and participate in Africa’s economic future. His mission is to bridge the gap between tradition and technology, merging trust, transparency, and cultural identity with cutting-edge blockchain solutions.</p>
  <p>Through ÒsánVault Africa, Olugbenga Ajayi is charting a bold path for financial freedom, community empowerment, and generational wealth across Africa and beyond.</p>
  <p>🌍 Connect with Olugbenga: 
    <a href=\"https://www.facebook.com/share/1EzQgpkfwn/\" target=\"_blank\">Facebook</a> | 
    <a href=\"https://medium.com/@OlugbengaAjayi\" target=\"_blank\">Medium (coming soon)</a>
  </p>
</section>"

# JSON-LD structured data block
JSON_LD="<script type=\"application/ld+json\">
{
  \"@context\": \"https://schema.org\",
  \"@type\": \"Person\",
  \"name\": \"Olugbenga Ajayi\",
  \"jobTitle\": \"Founder & CEO\",
  \"affiliation\": {
    \"@type\": \"Organization\",
    \"name\": \"ÒsánVault Africa\",
    \"url\": \"https://osanvaultafrica.com\"
  },
  \"url\": \"https://osanvaultafrica.com\",
  \"sameAs\": [
    \"https://www.facebook.com/share/1EzQgpkfwn/\",
    \"https://medium.com/@OlugbengaAjayi\"
  ],
  \"knowsAbout\": [\"Blockchain\", \"Real Estate\", \"Web3\", \"Tokenization\", \"African Development\"],
  \"nationality\": \"Nigerian\"
}
</script>"

# Insert Founder Bio before </body>
if grep -q "</body>" "$ABOUT_PAGE"; then
  sed -i "/<\/body>/i $FOUNDER_BIO" "$ABOUT_PAGE"
  sed -i "/<\/head>/i $JSON_LD" "$ABOUT_PAGE"
  echo "✅ Founder bio + JSON-LD structured data added to $ABOUT_PAGE"
else
  echo "⚠️ Could not find </body> or </head> tag in $ABOUT_PAGE"
fi
