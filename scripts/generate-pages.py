import json
import os
from datetime import datetime

# Ensure output folder exists
os.makedirs("../site", exist_ok=True)

# ------------------------------
# Load NET token data
# ------------------------------
with open("../data/net-data.json") as f:
    net = json.load(f)

# ------------------------------
# Load properties data
# ------------------------------
with open("../data/properties.json") as f:
    props = json.load(f)

# ------------------------------
# Generate index.html
# ------------------------------
with open("../templates/index-template.html") as f:
    index_template = f.read()

index_html = index_template.replace("{{TIMESTAMP}}", datetime.now().strftime("%B %d, %Y %H:%M %Z"))
for key in ["total_investors", "total_tokenized_properties", "last_property_added"]:
    index_html = index_html.replace(f"{{{{{key}}}}}", str(net.get(key, "N/A")))

with open("../site/index.html", "w") as f:
    f.write(index_html)

# ------------------------------
# Generate net.html
# ------------------------------
with open("../templates/net-template.html") as f:
    net_template = f.read()

for key, value in net.items():
    net_template = net_template.replace(f"{{{{{key}}}}}", str(value))

with open("../site/net.html", "w") as f:
    f.write(net_template)

# ------------------------------
# Generate properties.html
# ------------------------------
with open("../templates/properties-template.html") as f:
    prop_template = f.read()

prop_html = ""
snippet = """<div class="property">
<img src="assets/images/{image}" alt="{name}">
<h2>{name}</h2>
<p>Location: {location}</p>
<p>Price: {price}</p>
<p>Tokenized: {tokenized}</p>
</div>"""

for p in props:
    prop_html += snippet.format(**p)

prop_template = prop_template.replace("{{PROPERTIES_LIST}}", prop_html)

with open("../site/properties.html", "w") as f:
    f.write(prop_template)

# ------------------------------
# Copy static pages
# ------------------------------
for page in ["about.html", "roadmap.html", "tokenomics.html", "contact.html", "../styles.css"]:
    src = f"../{page}"
    dst = f"../site/{os.path.basename(page)}"
    if os.path.exists(src):
        with open(src) as fsrc, open(dst, "w") as fdst:
            fdst.write(fsrc.read())
