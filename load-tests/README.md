# Load Testing — OsanVault Africa

## Quick Start

```bash
# Install k6
# macOS: brew install k6
# Linux: sudo apt install k6
# Windows: choco install k6

# Start backend API
cd backend && npm run dev

# Run stress test
cd load-tests
chmod +x run-stress-test.sh
./run-stress-test.sh http://localhost:3001

# View results
cat results/stress-test-*.json | jq
```

## Test Scenarios

**10,000 Investors** over **16 minutes** with **1,000 concurrent transactions**:
- Register user (100%)
- Fetch portfolio (100%)
- Browse properties (100%)
- View property details (100%)
- Buy property (20% of users)
- Claim yield (10% of users)

## Expected Results

| Metric | Target | Notes |
|--------|--------|-------|
| Avg Response Time | <500ms | Per endpoint |
| p95 Response Time | <1000ms | 95% of requests |
| p99 Response Time | <2000ms | 99% of requests |
| Error Rate | <1% | Failed requests |
| Throughput | >100 req/s | Requests per second |

## Bottlenecks to Watch

1. **Database queries** — N+1 problems on portfolio fetch
2. **Contract calls** — Gas costs on buy operations
3. **Event indexing** — Lag in trade event processing
4. **Memory** — Node.js process memory under 1GB requests/sec

## Post-Test Analysis

```bash
# Convert JSON to HTML report
k6 run stress-test.k6.js --out web

# Extract metrics
jq '.metrics | keys' results/stress-test-*.json
```

## Scaling Recommendations

- Use **database connection pooling** (PgBouncer)
- Implement **Redis caching** for property listings
- Add **API rate limiting** per wallet
- Deploy **multiple backend instances** (load balancer)
- Use **WebSocket** for real-time event streaming
