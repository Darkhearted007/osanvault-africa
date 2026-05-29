# ÒsánVault Africa

**Institutional-grade African blockchain infrastructure for tokenized real-world assets (RWA)**

![Status](https://img.shields.io/badge/status-development-yellow)
![Network](https://img.shields.io/badge/network-Polygon%20Amoy-purple)
![Smart Contracts](https://img.shields.io/badge/contracts-solidity%200.8.24-blue)
![License](https://img.shields.io/badge/license-BUSL--1.1-orange)

---

## Overview

ÒsánVault is building a production-grade Web3 platform for tokenizing real-world assets across Africa — carbon credits, real estate, and land — with institutional-grade security, governance transparency, and community participation frameworks.

**Current focus: EVM (Polygon) — carbon credit tokenization via OsanCarbon (ERC-1155).**

### Core Capabilities
- **Carbon Credits**: Tokenized, verifiable carbon credits from African climate projects (ERC-1155)
- **Staking & Yield**: 4-tier staking system (Bronze 8% → Silver 12% → Gold 17% → Platinum 22% APR)
- **Treasury & Governance**: DAO-lite governance with institutional controls and timelocked treasury
- **Fee Distribution**: Automated 30/20/40/10 fee routing (treasury / burn / staking / team)
- **Property NFTs**: ERC-1155 fractionalized real estate tokens (in development)
- **Team Vesting**: Linear vesting with configurable cliff periods

### Network Deployment
- **Testnet**: Polygon Amoy (chain ID 80002)
- **Mainnet**: Polygon (primary target)

---

## Project Structure

```
osanvault-africa/
├── contracts/
│   ├── OsanCarbon.sol          # ERC-1155 carbon credit tokenization
│   ├── staking/
│   │   └── StakingVault.sol    # 4-tier staking with APR and lock periods
│   ├── governance/
│   │   └── Governance.sol      # DAO-lite proposal + voting system
│   ├── treasury/
│   │   └── TreasuryVault.sol   # Timelocked treasury with daily limits
│   ├── fees/
│   │   └── FeeRouter.sol       # Automated fee distribution
│   ├── property/
│   │   ├── PropertyNFT.sol     # ERC-1155 property tokens
│   │   └── LandRegistry.sol    # Land registry
│   ├── vesting/
│   │   └── TeamVesting.sol     # Linear vesting with cliff
│   └── token/
│       └── OsanToken.sol       # OSANV ERC-20 governance token
├── tests/
│   └── OsanCarbon.test.ts      # OsanCarbon test suite
├── scripts/
│   └── deploy.ts               # Deployment script
├── apps/
│   ├── api/                    # Express 5 backend API
│   └── web/                    # React + Vite frontend
├── programs/                   # Solana/Anchor programs (frozen — EVM first)
├── bots/                       # Automation bots (DCA, dividend drip, LP manager)
├── infra/                      # Docker Compose, Kubernetes, Nginx
├── hardhat.config.ts
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- pnpm ≥ 8.0.0
- Git

### Installation

```bash
# Clone
git clone https://github.com/Darkhearted007/osanvault-africa.git
cd osanvault-africa

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in DEPLOYER_PRIVATE_KEY (required) and optional keys

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Amoy testnet
npm run deploy:amoy
```

---

## Smart Contracts

### OsanCarbon (ERC-1155) — Primary contract

Roles: `DEFAULT_ADMIN_ROLE`, `VERIFIER_ROLE`, `PAUSER_ROLE`

| Function | Role | Description |
|---|---|---|
| `createProject(...)` | VERIFIER | Creates a new carbon project |
| `verifyProject(id)` | VERIFIER (same) | Verifies a project for credit issuance |
| `issueCredits(id, amount, recipient)` | VERIFIER | Mints credits to a recipient |
| `retireCredits(id, amount, reason)` | Any holder | Burns credits (permanent retirement) |
| `retireCreditsFrom(holder, ...)` | Approved | Retires on behalf of another holder |
| `getProjectRemainingCap(id)` | View | Returns remaining issuance capacity |
| `getProject(id)` | View | Returns full project metadata |

**Project cap**: 10,000,000 credits per project (10M × 1e18 wei).

### StakingVault — 4-tier staking

| Tier | APR | Lock |
|---|---|---|
| Bronze | 8% | Configurable |
| Silver | 12% | Configurable |
| Gold | 17% | Configurable |
| Platinum | 22% | Configurable |

Early withdrawal penalties apply. Uses share-per-token accounting for accurate reward distribution.

### TreasuryVault — Timelocked treasury

Withdrawal requests require a timelock (1–14 days configurable) and are subject to daily limits. Guardian role can pause in emergencies.

### FeeRouter — Fee distribution

Default split: 30% treasury / 20% burn / 40% staking / 10% team. Configurable by `CONFIGURER_ROLE`. Hard cap of 20% on burn allocation.

### Governance — DAO-lite

Custom proposal + voting system. **Planned replacement with OpenZeppelin Governor before mainnet audit.**

---

## Environment Variables

```
DEPLOYER_PRIVATE_KEY=   # Required — wallet that pays deploy gas
ADMIN_WALLET=           # Optional — defaults to deployer
VERIFIER_WALLET=        # Optional — defaults to deployer
POLYGONSCAN_API_KEY=    # Optional — for contract verification on Amoy
AMOY_RPC_URL=           # Optional — defaults to public Polygon Amoy RPC
REPORT_GAS=true         # Optional — prints gas usage in tests
```

---

## Development Roadmap

- [x] ERC-1155 carbon credit contract (OsanCarbon)
- [x] Staking, governance, treasury, fee routing contracts
- [x] OsanCarbon test suite
- [x] React + Vite frontend (wagmi v2 + RainbowKit, Polygon Amoy)
- [ ] Test suites for StakingVault, Governance, TreasuryVault, FeeRouter
- [ ] Replace Governance.sol with OpenZeppelin Governor
- [ ] Full deployment & wiring script for all contracts
- [ ] Deploy to Polygon Amoy testnet
- [ ] External security audit
- [ ] Mainnet deployment (Polygon)

---

## License

Business Source License 1.1 (BUSL-1.1). See [LICENSE](LICENSE) for details.

The contracts use BUSL-1.1 to protect commercial use during the development phase.
