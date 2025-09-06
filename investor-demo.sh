#!/bin/bash
# --------------------------------------
# ÒsánVault Africa Investor Demo Script
# --------------------------------------

PROJECT_DIR="$HOME/osanvault-africa"
PORT=8080

echo "🚀 Starting ÒsánVault Africa Demo..."

# Navigate to project
cd "$PROJECT_DIR" || { echo "❌ Folder not found!"; exit 1; }

# Start Python HTTP server
python3 -m http.server $PORT >/dev/null 2>&1 &
SERVER_PID=$!
echo "✅ Website running at http://localhost:$PORT"

# Open main pages automatically (requires termux-api)
if command -v termux-open >/dev/null; then
    termux-open "http://localhost:$PORT/index.html"
    sleep 1
    termux-open "http://localhost:$PORT/about.html"
    sleep 1
    termux-open "http://localhost:$PORT/properties.html"
fi

echo "🌐 Demo pages opened."

# Web3 / Mock Dashboard Simulation
echo "💰 Simulating NET token wallet..."
echo "NET Token Balance: 1,000.00 NET"
echo "Staked NET: 500.00 NET"
echo "Pending Rewards: 12.5 NET"

# Simulate property investments
echo "🏠 Mock Properties Owned:"
echo "1. Lekki Estate, Lagos - 10% Ownership"
echo "2. Ibadan Luxury Apartments - 5% Ownership"

# Optional: generate a quick investor report
echo "📊 Generating mock report..."
python3 - <<EOF
import datetime
print("\n--- ÒsánVault Africa Investor Report ---")
print("Date:", datetime.datetime.now())
print("Total NET Balance: 1000.00 NET")
print("Staked NET: 500.00 NET")
print("Pending Rewards: 12.5 NET")
print("Properties Owned:")
print(" - Lekki Estate, Lagos: 10%")
print(" - Ibadan Luxury Apartments: 5%")
print("--------------------------------------\n")
EOF

# Wait for user to exit
read -p "Press [Enter] to stop the demo..." dummy
kill $SERVER_PID
echo "🛑 Demo stopped."
