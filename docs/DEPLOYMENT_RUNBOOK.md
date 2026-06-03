# Production Deployment Guide — OsanVault Africa

## 1. Smart Contracts

### Amoy Testnet Deployment

```bash
# Set environment
export DEPLOYER_PRIVATE_KEY=0x...
export ADMIN_WALLET=0x...
export AMOY_RPC_URL=https://rpc-amoy.polygon.technology
export POLYGONSCAN_API_KEY=...

# Compile
npm run compile

# Deploy to Amoy
npm run deploy:amoy

# Verify on Polygonscan
npm run verify -- --network amoy
```

**Deployment Outputs:** Saved to `deployments/amoy.json`
- Contains all 15 contract addresses (proxies + implementations)
- Share with frontend team

### Mainnet Deployment (Production)

```bash
# 1. Test on testnet first (above)
# 2. Update environment for mainnet
export DEPLOYER_PRIVATE_KEY=0x...  # Production key
export POLYGONSCAN_API_KEY=...      # Mainnet API key

# 3. Deploy
npm run deploy -- --network polygon

# 4. Verify all contracts
npm run verify -- --network polygon

# 5. Confirm in Polygonscan UI
# 6. Update frontend config with new addresses
```

---

## 2. Backend API Deployment

### Local Development

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### Production Deployment (Railway / Render)

#### Step 1: Prepare Environment

```bash
# backend/.env.production
RPC_URL=https://polygon-rpc.com  # or Infura/Alchemy
DATABASE_URL=postgresql://user:pass@host:5432/osanvault
PRIVATE_KEY=0x...  # For signing txs
JWT_SECRET=...
PORT=3001
```

#### Step 2: Deploy to Railway

```bash
# Install railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

Production URL: `https://osanvault-api.railway.app`

#### Step 3: Set Up Database

```sql
-- Create schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT UNIQUE NOT NULL,
  email TEXT,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id BIGINT,
  title TEXT,
  location TEXT,
  price DECIMAL(18,6),
  risk_score INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  amount DECIMAL(18,6),
  tx_hash TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  bought_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Frontend Deployment

### Environment Setup

```bash
cd frontend

# Create .env.local
NEXT_PUBLIC_API_URL=https://osanvault-api.railway.app
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_ROUTER_ADDRESS=0x...  # From deployments/polygon.json
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Production URL: `https://osanvault.vercel.app`

---

## 4. Event Listener & Indexing

### Deploy Indexer (Node.js Service)

```bash
# indexer/src/listener.ts
cd indexer
npm install
npm run build
npm start
```

This service:
- Listens to Marketplace.ListingSold events
- Updates `investments` table in real-time
- Syncs portfolio balances
- Calculates accrued yields

### Deploy via Railway/Docker

```bash
# Dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "start"]

# Build & push
docker build -t osanvault-indexer .
railway deploy
```

---

## 5. Monitoring & Alerts

### Sentry (Error Tracking)

```bash
# backend/src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### DataDog (APM)

```bash
# Environment
DD_SERVICE=osanvault-api
DD_ENV=production
DD_TRACE_ENABLED=true
```

---

## 6. Emergency Procedures

### Circuit Breaker (Pause Protocol)

```bash
# Emergency pause all contracts
cast send <ROUTER_ADDRESS> "pause()" \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url https://polygon-rpc.com
```

### Restore from Backup

```bash
# Database backup (automated daily)
pg_dump osanvault > backup.sql

# Restore
psql osanvault < backup.sql
```

### Rollback Contract (UUPS)

```bash
# If new contract has bugs
cast send <ROUTER_ADDRESS> "upgradeTo(<OLD_IMPL>)" \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url https://polygon-rpc.com
```

---

## 7. Pre-Launch Checklist

- [ ] All 15 contracts deployed & verified
- [ ] Backend API running on staging
- [ ] Database seeded with test data
- [ ] Frontend connected to staging API
- [ ] Wallet integration tested (MetaMask)
- [ ] Buy/sell flow E2E tested
- [ ] Event listener syncing trades
- [ ] Error handling verified
- [ ] Sentry + monitoring active
- [ ] Emergency pause documented & tested
- [ ] 24/7 on-call runbook created

---

## 8. Mainnet Launch Day

### T-24 Hours
- [ ] Final code review
- [ ] Backup database
- [ ] Notify stakeholders

### T-0 (Launch)
- [ ] Deploy contracts to mainnet
- [ ] Update frontend config
- [ ] Restart backend with new addresses
- [ ] Monitor Sentry/DataDog for errors
- [ ] Test buy/claim flows live
- [ ] Announce to community

### T+24 Hours
- [ ] Check database integrity
- [ ] Verify all trades indexed
- [ ] Monitor gas costs
- [ ] Adjust fees if needed

---

## Support

**Deployment Questions:** See `CLAUDE.md` for architecture context  
**Contract Issues:** `docs/CONTRACT_AUDIT.md`  
**Emergency:** Activate pause() and page on-call engineer
