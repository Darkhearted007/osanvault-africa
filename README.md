# OsanVault Africa

Africa's institutional real estate tokenization platform — fractional property ownership on Polygon, ERC-1155 SPVs, dual land verification, and on-chain governance.

**Status:** Testnet · Pre-launch · Early investor registrations open

---

## Overview

OsanVault tokenizes premium African real estate into fractional ERC-1155 tokens (SPVs) accessible from ₦1,000. The protocol layers carbon credit issuance, OSANV token staking, and on-chain governance over property-first infrastructure.

---

## Workspace Layout

```
osanvault-africa/
├── artifacts/
│   ├── api-server/          Express 5 REST API (Drizzle ORM · Zod · Pino)
│   ├── osanvault/           React 18 web app (Vite · wagmi · RainbowKit · Tailwind v4)
│   ├── osanvault-mobile/    Expo React Native companion app
│   └── mockup-sandbox/      Isolated component preview server (design tooling)
├── contracts/               Hardhat · 8 Solidity contracts on Polygon Amoy
├── lib/
│   ├── db/                  Drizzle ORM schema, migrations, typed query helpers
│   ├── api-spec/            OpenAPI 3.1 specification + Orval codegen
│   ├── api-client-react/    Auto-generated React Query hooks
│   └── api-zod/             Auto-generated Zod validation schemas
└── scripts/                 Database seed utilities · GitHub API sync
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Runtime | Node.js 24, TypeScript 5.9 |
| Frontend | React 18, Vite 7, Tailwind CSS v4, Framer Motion, Recharts |
| Web3 | wagmi v2, RainbowKit, Polygon Amoy Testnet (EVM) |
| Backend | Express 5, Pino structured logging, Drizzle ORM |
| Database | PostgreSQL (Replit-managed) |
| Smart Contracts | Hardhat, Solidity 0.8.x, OpenZeppelin v5 |
| Codegen | Orval (OpenAPI spec → React Query hooks + Zod schemas) |
| Package management | pnpm 10 workspaces with shared version catalog |

---

## Prerequisites

- **Node.js** ≥ 22 (24 LTS recommended — see `.nvmrc`)
- **pnpm** ≥ 10 (`npm install -g pnpm@latest`)
- **PostgreSQL** connection string available as `DATABASE_URL`

---

## Getting Started

```bash
# Install all workspace dependencies
pnpm install

# Type-check the entire workspace
pnpm run typecheck

# Start the API server (binds to PORT env var, defaults to 5000)
pnpm --filter @workspace/api-server run dev

# Start the web frontend (binds to PORT env var set by workflow)
pnpm --filter @workspace/osanvault run dev
```

See `docs/DEVELOPMENT.md` for the full developer setup guide.

---

## Development Workflows

### Regenerating API types

After modifying `lib/api-spec/openapi.yaml`, regenerate all client types:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This writes updated React Query hooks to `lib/api-client-react/src/` and Zod schemas to `lib/api-zod/src/`. Never edit generated files by hand.

### Database schema changes

Edit schemas under `lib/db/src/schema/`, then push to the running Postgres instance:

```bash
pnpm --filter @workspace/db run push
```

### Type checking

```bash
# Full workspace check (libs first, then leaf packages)
pnpm run typecheck

# Libraries only (composite build)
pnpm run typecheck:libs

# Single package
pnpm --filter @workspace/api-server run typecheck
```

### Code formatting

```bash
# Format all files in-place
pnpm run format

# Check formatting without writing (CI-safe)
pnpm run format:check
```

### Syncing to GitHub

Changes are pushed to GitHub via the Git Data API (no local `git push` needed):

```bash
pnpm --filter @workspace/scripts run github-sync
```

---

## Smart Contracts

Eight Solidity contracts under `contracts/` targeting Polygon Amoy:

| Contract | Purpose |
| :--- | :--- |
| `OsanVToken.sol` | ERC-20 OSANV governance and staking token |
| `PropertyNFT.sol` | ERC-1155 fractional property SPV tokens |
| `LandRegistry.sol` | Dual on-chain verification — government title hash + indigenous authority |
| `OsanCarbon.sol` | ERC-1155 carbon credit tokens linked to verified climate projects |
| `StakingVault.sol` | OSANV staking — 4 tiers (8–22% APR, 30–365 day lock periods) |
| `Governance.sol` | DAO voting — 100K OSANV to propose, 5M quorum, 7-day window, 2-day timelock |
| `TreasuryVault.sol` | Timelocked treasury — 2-day delay, ₦50K daily withdrawal limit |
| `FeeRouter.sol` | Fee distribution — 30% treasury / 20% burn / 40% staking rewards / 10% ops |

```bash
# Compile all contracts
pnpm --filter @workspace/contracts run compile

# Deploy to Polygon Amoy testnet
pnpm --filter @workspace/contracts run deploy:amoy

# Verify source on Polygonscan
pnpm --filter @workspace/contracts run verify:amoy
```

Contract addresses are recorded in `artifacts/osanvault/src/lib/contract.ts`. Until mainnet deployment, `IS_CONTRACT_DEPLOYED = false` and all addresses are the zero address.

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Express session signing key (minimum 32 characters) |
| `GITHUB_PAT` | Dev | GitHub Personal Access Token for the repo sync script |
| `POLYGON_RPC_URL` | Contracts | Alchemy or Infura Polygon Amoy RPC endpoint |
| `PRIVATE_KEY` | Contracts | Deployer wallet private key (testnet only — never commit) |
| `POLYGONSCAN_API_KEY` | Contracts | API key for Polygonscan contract verification |

Never commit secrets. Use Replit Secrets for runtime injection.

---

## Architecture Notes

- **Property-first** — The UI hierarchy leads with real estate. Carbon credits (Layer 5), staking (Layer 3), and governance (Layer 4) are upper layers built on the property core.
- **NGN primary** — All property values are displayed in Nigerian Naira. `formatNgn()` in `lib/mock-data.ts` handles B / M / K abbreviations.
- **Contract-first API** — `lib/api-spec/openapi.yaml` is the source of truth. Client hooks and validation schemas are generated, never hand-written.
- **Mock-first until mainnet** — `IS_CONTRACT_DEPLOYED = false` in `contract.ts` gates all wagmi contract reads. Pages degrade gracefully with mock data and testnet status toasts.
- **Dual land verification** — `LandRegistry.sol` requires both a government title hash and an indigenous authority address before `PropertyNFT` can mint. This is surfaced in the Property Details page.

See `docs/ARCHITECTURE.md` for the full system design document.

---

## Regulatory

OsanVault Africa operates under the **SEC Nigeria ARIP Sandbox**. All on-chain token issuance is gated by KYC/AML whitelisting via the investor whitelist registry (`/whitelist`). Full compliance documentation is available under `docs/REGULATORY.md`.

---

## License

Proprietary Software License · Copyright 2025–2026 ÒsánVault Africa

All rights reserved. This software contains confidential and proprietary information. No license, right, title, or interest in or to the software is granted. Unauthorized use, copying, or distribution is strictly prohibited and may result in legal action.

See the [LICENSE](./LICENSE) file for complete terms.
