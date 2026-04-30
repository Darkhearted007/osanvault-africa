# ÒsánVault Africa on Puter — Serverless Deployment

## What is Puter?

Puter is a free, serverless cloud platform with Workers (serverless functions) and KV store.
- No servers, no billing, no API keys needed
- Workers run JavaScript serverlessly
- KV store for caching and state
- "User Pays" model — infrastructure is free for developers

## Deploy the Worker

### Option 1: CLI
```bash
npx puterjs@latest workers create osanvault-api --file apps/web/src/worker.js
```

### Option 2: Dashboard
1. Go to https://puter.com
2. Create account
3. Upload `apps/web/src/worker.js`
4. Deploy as "osanvault-api" worker

## Environment Variables

```env
VITE_USE_PUTER=true
VITE_PUTER_WORKER_URL=https://your-worker.puter.app
VITE_API_URL=https://localhost:3001  # fallback
```

## Routes Available

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/tokens/osanv | OSANV token metadata |
| GET | /api/properties | Property listings |
| GET | /api/properties/:id | Single property |
| POST | /api/auth/nonce | Wallet nonce generation |
| POST | /api/auth/verify | Wallet signature verification |
| GET | /api/oracle/:asset | Price oracle (BTC/ETH/SOL/OSANV) |
| GET | /api/dashboard | Dashboard stats |

## Using Puter KV Store

```javascript
// Cache oracle prices
await puter.kv.set("price:SOL", { price: 178, ts: Date.now() }, 30) // 30s TTL

// Read cached
const cached = await puter.kv.get("price:SOL")
```

## Using Puter DB

```javascript
// Store user
await puter.db.create("users", { wallet_address, role: "investor" })

// Query users
const users = await puter.db.read("users", { role: "investor" })
```

## Worker Architecture

```
┌─────────────────────┐
│   Frontend (React)   │────── Puter.js SDK
└─────────────────────┘
       │
       ▼
┌───────────���─────────┐
│  Puter Worker        │────── KV Store (nonce cache)
│  (serverless JS)     │────── KV Store (oracle cache)
└─────────────────────┘
       │
       ▼ (for full data)
┌─────────────────────┐
│  Self-hosted API     │────── PostgreSQL
│  (localhost:3001)   │────── Redis
└─────────────────────┘
```

## When to Use Puter vs Self-Hosted

| Use Case | Recommendation |
|---------|--------------|
| Development / Demo | Puter (free, instant) |
| Authentication | Self-hosted API (needs DB) |
| Property ingest | Self-hosted API (needs admin auth) |
| Oracle prices | Puter (KV cache) → Self-hosted (live prices) |
| Dashboard | Self-hosted API (needs DB) |
| Token info | Puter worker (static data) |
| Health checks | Either |

## Limitations

- Nonce store is per-worker-instance (resets on cold start)
- No persistent storage in free tier worker (use Puter KV)
- Complex queries need self-hosted API with PostgreSQL

## Security Notes

- All wallet signatures still validated server-side
- HMAC verification for bot requests
- Rate limiting handled by Puter's infrastructure
- Audit logging goes to self-hosted DB for compliance