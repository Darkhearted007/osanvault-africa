#!/bin/bash
# load-tests/run-stress-test.sh

echo "🚀 OsanVault Stress Test - 10,000 Investors, 1,000 Concurrent Transactions"
echo "================================================================"

API_URL=${1:-"http://localhost:3001"}
DURATION=${2:-"16m"}

echo "Starting k6 stress test..."
echo "API: $API_URL"
echo "Duration: $DURATION"
echo ""

k6 run stress-test.k6.js \
  --vus 1000 \
  --duration $DURATION \
  -e API_URL=$API_URL \
  --out json=results/stress-test-$(date +%s).json

echo ""
echo "✅ Stress test complete. Results saved to results/"
