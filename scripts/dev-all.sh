#!/bin/bash

echo "🚀 Starting ÒsánVault System..."

echo "🧠 Starting API..."
cd apps/api
npx tsx src/index.ts &
API_PID=$!

echo "🌐 Starting Web..."
cd ../web
npm run dev &
WEB_PID=$!

echo "✅ ÒsánVault is running"
echo "API PID: $API_PID"
echo "WEB PID: $WEB_PID"

wait $API_PID $WEB_PID
