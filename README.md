# Òsánvault Africa

**Compliance-first, blockchain-based real estate tokenization for African markets.**

Enable fractional real estate investment from $10 equivalent, with on-chain dividend distribution and regulatory clarity for Nigeria, Ghana, Kenya, and South Africa.

## 🎯 Platform Overview

| Attribute | Value |
|-----------|-------|
| **Token** | OSANV (500M supply) on Solana |
| **Minimum Investment** | $10 USD equivalent |
| **Target Markets** | Nigeria, Ghana, Kenya, South Africa |
| **Regulatory Pathway** | Nigeria SEC ARIP Sandbox |

## 📁 Project Structure

```
hsanvault-africa/
├── apps/
│   ├── web/              # React + Vite + TypeScript frontend
│   └── api/              # Node.js / TypeScript backend
├── programs/             # Anchor/Rust smart contracts (Solana)
│   ├── osanvault_core/   # Platform, property, investment, OSANV mint, RBAC
│   ├── osanvault_lend/   # DeFi lending with liquidation engine
│   ├── reits/            # Real estate investment trusts
│   ├── minerals/          # Tokenized minerals
│   ├── carbon/           # Carbon credit tokenization
│   ├── landbank/         # Land acquisition pooling
│   └── oracle/           # Pyth + Switchboard price feeds
├── contracts/             # Solidity + Vyper (EVM layer)
├── bots/                  # AUTOIVEST Bot Suite
│   ├── lp-manager/       # Automated liquidity pool management
│   ├── dca-bot/          # Dollar-cost averaging
│   ├── dividend-drip/    # Automatic dividend reinvestment
│   └── portfolio-rebalancer/  # Portfolio rebalancing
├── infra/
│   ├── docker-compose.yml
│   └── k8s/              # Kubernetes configs
├── decks/                # Pitch deck generator (pptxgenjs)
├── docs/                 # Documentation
└── packages/             # Shared libraries
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for smart contract development)
- Solana CLI (optional, for local testing)

### Frontend

```bash
pnpm install
pnpm --filter web dev
```

### Backend

```bash
pnpm --filter api dev
```

### Smart Contracts (with Docker)

```bash
docker run -it --rm \
  -v "$(pwd):/workspace" \
  ghcr.io/coral-xyz/anchor:latest

# Inside container:
anchor build
anchor test
```

See [docs/DOCKER-ANCHOR.md](docs/DOCKER-ANCHOR.md) for detailed setup.

## 📜 Smart Contracts

7 Anchor/Rust programs deployed on Solana:

| Contract | Description | Status |
|----------|-------------|--------|
| `osanvault_core` | Core platform, RBAC, OSANV mint | Active |
| `osanvault_lend` | DeFi lending, 25% liquidation threshold | Active |
| `reits` | 5% yield REITs | Active |
| `minerals` | 5% royalty minerals | Active |
| `carbon` | Carbon credit tokenization | Active |
| `landbank` | 8% appreciation land banking | Active |
| `oracle` | Dual-source price feeds | Active |

**Security:** RBAC on all contracts, dual oracle (Pyth + Switchboard), Gnosis Safe 3-of-5 multisig treasury.

## 🤖 AUTOIVEST Bot Suite

- **LP Manager** — Automated liquidity pool management
- **DCA Bot** — Dollar-cost averaging execution
- **Dividend DRIP** — Automatic dividend reinvestment
- **Portfolio Rebalancer** — On-chain portfolio rebalancing

## 💰 Revenue Model

| Stream | Rate |
|--------|------|
| Platform fees | 1.5% |
| AUM management | 0.5% |
| Secondary market | 0.3% |
| Property onboarding | Fixed per listing |

## 🔐 Security

- RBAC implemented across all contracts
- Dual oracle: Pyth Network (primary) + Switchboard (fallback)
- Gnosis Safe 3-of-5 multisig treasury
- 29 internal security tests
- Security audit in progress (CertiK, Hacken, OtterSec, Halborn)

See [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) and [docs/AUDIT-CHECKLIST.md](docs/AUDIT-CHECKLIST.md).

## 📋 Regulatory

- **Primary:** Nigeria SEC ARIP Sandbox pathway
- **Required:** SCUML Registration, DAOP Classification
- **Compliance:** Fidelity Bond Compliance

## 🎤 Conferences

**Korea Blockchain Week 2026** — Seoul, South Korea | September 29–October 1, 2026

## 👥 Team

**Founder & CEO:** Olugbenga Ajayi
- Nigerian Navy (11 years)
- Advanced Diploma in Security & Safety Management
- Focus: Community development + blockchain entrepreneurship

## 📞 Contact

- **Email:** Olugbenga1000@gmail.com
- **Phone:** +2347065056103
- **Website:** osanvault.africa

## 📄 License

MIT