# ÒsánVault Africa

<div align="center">

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Stack](https://img.shields.io/badge/Stack-Solana%20%2B%20React%20%2B%20Node.js-000000)
![License](https://img.shields.io/badge/License-MIT-blue)

**Compliance-first, blockchain-based real estate tokenization for African markets.**

Enable fractional real estate investment from $10 equivalent, with on-chain dividend distribution and regulatory clarity for Nigeria, Ghana, Kenya, and South Africa.

[Website](https://osanvaultafrica.com) · [Documentation](https://docs.osanvaultafrica.com) · [API](https://api.osanvaultafrica.com)

</div>

---

## Platform Overview

| Attribute | Value |
|-----------|-------|
| **Token** | OSANV (500M supply) on Solana |
| **Minimum Investment** | $10 USD equivalent |
| **Target Markets** | Nigeria, Ghana, Kenya, South Africa |
| **Regulatory Pathway** | Nigeria SEC ARIP Sandbox |
| **Frontend Build** | ✅ Passing |
| **Backend Build** | ✅ Passing |
| **API Routes** | 16+ endpoints |
| **Smart Contracts** | 7 Anchor programs | |

---

## Project Structure

```
osanvault-africa/
├── apps/
│   ├── web/                   # React + Vite + TypeScript frontend
│   └── api/                   # Node.js + Express backend
├── programs/                  # Anchor/Rust smart contracts (Solana)
│   ├── osanvault_core/        # Platform, property, investment, OSANV mint, RBAC
│   ├── osanvault_lend/        # DeFi lending with liquidation engine
│   ├── reits/                 # Real estate investment trusts
│   ├── minerals/              # Tokenized minerals
│   ├── carbon/               # Carbon credit tokenization
│   ├── landbank/             # Land acquisition pooling
│   └── oracle/               # Pyth + Switchboard price feeds
├── bots/                      # AUTOIVEST Bot Suite
│   ├── dca-bot/              # Dollar-cost averaging
│   ├── dividend-drip/        # Automatic dividend reinvestment
│   ├── lp-manager/          # Automated liquidity pool management
│   ├── portfolio-rebalancer/ # On-chain portfolio rebalancing
│   └── property-scraper/     # Property data collection
├── infra/                    # Infrastructure configs
│   ├── docker-compose.yml    # Development stack
│   ├── docker-compose.prod.yml # Production stack
│   ├── nginx.prod.conf       # Production nginx
│   └── init.sql              # Database schema
├── scripts/                  # Deployment & utility scripts
├── docs/                     # Documentation
└── packages/                 # Shared libraries
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** 8+ (10+ recommended)
- **Docker** (for smart contract development)
- **PostgreSQL** 14+ (for local development)
- **Redis** 7+ (for queue processing)

### Installation

```bash
# Clone and install
git clone https://github.com/Darkhearted007/osanvault-africa.git
cd osanvault-africa
pnpm install
```

### Development

```bash
# Start all services with Docker
docker-compose -f infra/docker-compose.yml up -d

# Start frontend (http://localhost:5173)
pnpm --filter web dev

# Start API (http://localhost:3001)
pnpm --filter api dev

# Run tests
pnpm test

# Build all packages
pnpm build
```

### Environment Variables

Copy the example env file:

```bash
cp apps/api/.env.example apps/api/.env
```

See `.env.production.example` for production configuration.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite 6 + TypeScript |
| **Wallet** | @solana/wallet-adapter (Phantom, Solflare, Backpack, Ledger) |
| **Backend** | Node.js 24 + Express + TypeScript |
| **Database** | PostgreSQL 15 + Redis 7 |
| **Smart Contracts** | Anchor 0.30.1 + Rust (Solana) |
| **Oracles** | Pyth Network (primary) + Switchboard (fallback) |
| **Container** | Docker + Docker Compose |
| **Monorepo** | pnpm + Turborepo |
| **CI/CD** | GitHub Actions |

---

## Architecture

### Frontend (apps/web)
- **Framework:** React 19 + Vite 6 + TypeScript
- **Wallet:** Phantom, Solflare, Backpack, Ledger, Coinbase
- **Styling:** Custom CSS with dark African fintech theme
- **Auth:** JWT stored in localStorage, auto-refresh on wallet connect

### Backend (apps/api)
- **Runtime:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with direct `pg` pool (15 tables)
- **Cache/Queue:** Redis + BullMQ for async jobs
- **Security:** RBAC, rate limiting, circuit breaker, health checks
- **Auth:** Ed25519 wallet signature verification → JWT (24h expiry)

### Database Schema
- `users`, `properties`, `investments`, `dividends`
- `governance_proposals`, `governance_votes`
- `kyc_submissions`, `audit_log`, `lending_positions`
- `dca_plans`, `lp_positions`, `liquidation_events`
- Row-Level Security (RLS) on investments, dividends, audit_log

### Smart Contracts
- **Framework:** Anchor 0.30.1 + Rust
- **7 Programs:** osanvault_core, osanvault_lend, reits, minerals, carbon, landbank, oracle
- **Security:** RBAC, dual oracle (Pyth + Switchboard), multisig treasury

---

## Smart Contracts

| Contract | Program ID | Description |
|----------|------------|-------------|
| `osanvault_core` | `5bNkJDyJaE3rZ93ahWaA8MPTxQvCG6dC9jkTanLV2qRF` | Core platform, RBAC, OSANV mint |
| `osanvault_lend` | `3ZX5svRbpgvNVQXpwj7cQG2MZs97KVnV3azCkSiwU3CR` | DeFi lending, 25% liquidation |
| `reits` | `EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1` | 5% yield REITs |
| `minerals` | `6oNLPSirAwbmTohpfUtUk2UHSLfsVnvHguP9ZdwcGRzF` | 5% royalty minerals |
| `carbon` | `H2hzHypyQxJpDiGWgpYSDN56JdyLzpPkrHcAD2cxnZUb` | Carbon credit tokenization |
| `landbank` | `FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT` | 8% appreciation land banking |
| `oracle` | `9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55` | Dual-source price feeds |

---

## AUTOIVEST Bot Suite

| Bot | Purpose |
|-----|---------|
| **DCA Bot** | Dollar-cost averaging execution |
| **Dividend DRIP** | Automatic dividend reinvestment |
| **LP Manager** | Automated liquidity pool management |
| **Portfolio Rebalancer** | On-chain portfolio rebalancing |

---

## Revenue Model

| Stream | Rate |
|--------|------|
| Platform fees | 1.5% |
| AUM management | 0.5% |
| Secondary market | 0.3% |
| Property onboarding | Fixed per listing |

---

## Deployment

### Development (Local)

```bash
# Start infrastructure
docker-compose -f infra/docker-compose.yml up -d

# Start API
pnpm --filter api dev

# Start Web
pnpm --filter web dev
```

### Production (Docker)

```bash
# Build and start production stack
docker-compose -f infra/docker-compose.prod.yml up -d --build
```

### Production (Manual)

```bash
# 1. Build all packages
pnpm build

# 2. Set environment variables
cp .env.production.example .env
# Edit .env with production values

# 3. Start services with PM2
pm2 start ecosystem.config.js --env production
```

### Production (Nginx + PM2)

```bash
# 1. Configure nginx
sudo cp infra/nginx.prod.conf /etc/nginx/sites-available/osanvault
sudo nginx -t && sudo systemctl reload nginx

# 2. Start API with PM2
pm2 start ecosystem.config.js

# 3. Start frontend
cd apps/web && npx serve dist -l 5173 -s &
```

---

## Security

### Implemented
- ✅ Wallet-based JWT authentication (Ed25519 signature verification)
- ✅ RBAC on all smart contracts and API endpoints
- ✅ Dual oracle: Pyth Network (primary) + Switchboard (fallback)
- ✅ Gnosis Safe 3-of-5 multisig treasury
- ✅ 29 internal security tests
- ✅ Rate limiting on all API endpoints
- ✅ Input validation and sanitization (Zod)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Redis nonce storage (5min expiry, single-use)
- ✅ Audit logging on all state-changing operations

### In Progress
- 🔄 Security audit (CertiK contacted, awaiting quote)
- 🔄 VPS hardening (fail2ban, UFW)

### NPM Audit
- ✅ 0 vulnerabilities (Vite 6.4.2, express-rate-limit 8.5.0)

---

## Regulatory

- **Primary:** Nigeria SEC ARIP Sandbox pathway
- **Required:** SCUML Registration, DAOP Classification
- **Compliance:** Fidelity Bond Compliance

---

## Testing

```bash
# Run all tests
pnpm test

# Run API tests only
pnpm --filter @osanvault/api test

# Run with coverage
pnpm --filter @osanvault/api test --coverage
```

**Test Results:** 48 tests passing (19 integration + 29 security)

---

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/nonce` | POST | Generate cryptographic nonce |
| `/api/auth/verify` | POST | Verify wallet signature & get JWT |
| `/api/auth/wallet/:address` | GET | Get wallet user info |

### Dashboard
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/summary` | GET | Portfolio summary & stats |
| `/api/dashboard/ledger` | GET | Transaction history (last 20) |
| `/api/dashboard/properties-overview` | GET | Property milestones & progress |

### Properties
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/properties` | GET | List all properties |
| `/api/properties/:id` | GET | Property details |
| `/api/properties/:id/milestones` | GET | Construction milestones |

### Governance
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/governance/proposals` | GET | List proposals |
| `/api/governance/proposals` | POST | Create proposal |
| `/api/governance/vote` | POST | Cast vote |
| `/api/governance/votes/:id` | GET | Proposal votes |

### KYC & Compliance
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kyc/submit` | POST | Submit KYC documents |
| `/api/kyc/status/:wallet` | GET | KYC status |

### Additional
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/tokens/osanv` | GET | OSANV token info |
| `/api/tokens/staking-status` | GET | Staking info |
| `/api/oracle/:asset` | GET | Pyth/Switchboard price feed |
| `/api/support` | POST | Contact support |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/deploy-token.ts` | Deploy OSANV token |
| `scripts/deploy-all.sh` | Deploy all contracts |
| `scripts/dev-start.sh` | Start dev environment |
| `scripts/dev-stop.sh` | Stop dev environment |

---

## Team

**Founder & CEO:** Olugbenga Ajayi
- Nigerian Navy (11 years service)
- Advanced Diploma in Security & Safety Management
- Focus: Community development + blockchain entrepreneurship

---

## KBW 2026

**Korea Blockchain Week 2026** — Seoul, South Korea | September 29–October 1, 2026

Target: Investor engagement, platform visibility, partnerships

---

## Contact

- **Email:** Olugbenga1000@gmail.com
- **Phone:** +2347065056103
- **Website:** osanvaultafrica.com
- **Support:** Olugbenga1000@gmail.com

---

## License

MIT License - See LICENSE file for details

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

**Note:** All PRs must include a security consideration note in the description.