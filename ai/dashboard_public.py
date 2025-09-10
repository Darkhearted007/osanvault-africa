import time, pandas as pd, plotly.graph_objects as go
from pyngrok import ngrok
public_url = ngrok.connect(8050)
print("🚀 Public dashboard URL:", public_url)
while True:
    print("Updating public dashboard...")
    time.sleep(3600)
