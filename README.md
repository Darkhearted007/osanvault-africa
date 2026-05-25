# ÒsánVault Africa

**Institutional-grade African blockchain infrastructure for tokenized real-world assets (RWA)**

![Status](https://img.shields.io/badge/status-development-yellow)
![Network](https://img.shields.io/badge/network-Polygon%20%7C%20Arbitrum-purple)
![Smart Contracts](https://img.shields.io/badge/contracts-solidity%200.8.24-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🏗️ Overview

ÒsánVault is building a **production-grade Web3 platform** for tokenizing real-world assets across Africa, with institutional-grade security, governance transparency, and community participation frameworks.

### Core Capabilities
- **Tokenized Real Estate**: Fractionalized property ownership with legal compliance
- **Land Banking**: Transparent land reserve management with community participation
- **Mineral-backed Economics**: Transparent mineral project participation structures
- **Staking & Yield**: 4-tier staking system (Bronze 8% → Platinum 22% APR)
- **Treasury & Governance**: DAO-lite governance with institutional controls
- **Indigenous-Rights Aware**: Respect for customary ownership and local governance

### Network Deployment
- **Testnet**: Polygon Amoy
- **Mainnet**: Polygon (primary) + Arbitrum (expansion)
- **Future**: Multi-chain to African layer 2s

---

## 📋 Project Structure

```
Osanvault/
├── contracts/           # 7 Solidity smart contracts
│   ├── token/           # OSANVToken.sol (ERC20+Permit+Burnable+AccessControl)
│   ├── staking/         # StakingVault.sol (4-tier staking system)
│   ├── vesting/         # TeamVesting.sol + TreasuryVault.sol
│   ├── governance/      # Governance.sol (DAO-lite proposals)
│   ├── fees/            # FeeRouter.sol (20/30/40/10 distribution)
│   └── property/        # PropertyNFT.sol (ERC1155 properties)
├── tests/               # 104 comprehensive test cases
│   ├── OSANVToken.test.ts (11 tests)
│   ├── StakingVault.test.ts (20 tests)
│   ├── Governance.test.ts (16 tests)
│   └── ... (7 total test suites)
├── scripts/             # Deployment & initialization scripts
├── backend/             # NestJS API server
├── frontend/            # Next.js 15+ UI
├── infrastructure/      # Docker & CI/CD
└── docs/                # Architecture & compliance docs
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 22.0.0 (see `.nvmrc`)
- **npm** ≥ 10.0.0
- **Git** (for version control)
- **WSL2** or Linux (recommended for development)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Darkhearted007/osanvault-africa.git
cd osanvault-africa

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Compile smart contracts
npm run compile

# 5. Run tests
npm run test

# 6. Deploy to local network
npm run deploy:local

# 7. Deploy to Amoy testnet
npm run deploy:amoy
```

---

## 📦 Smart Contracts

### 1. OSANVToken (500M supply)
- **Standard**: ERC20 + ERC20Permit + ERC20Burnable + AccessControl + Pausable
- **Max Supply**: 500,000,000 OSANV
- **Burn Floor**: 250,000,000 OSANV (cannot burn below)
- **Roles**: PAUSER_ROLE, TREASURY_ROLE, BURNER_ROLE
- **Allocation**:
  - 25% Public Sale (125M)
  - 20% Ecosystem (100M)
  - 15% Team Vesting (75M)
  - 15% Treasury (75M)
  - 10% Liquidity (50M)
  - 15% Admin Reserve (75M)

### 2. StakingVault
- **4 Tiers**:
  - Bronze: 8% APR, 30 days lock
  - Silver: 12% APR, 90 days lock
  - Gold: 18% APR, 180 days lock
  - Platinum: 22% APR, 365 days lock
- **Security**: updateRewards modifier + rewardDebt anti-flash-loan protection
- **Features**: Configurable APR, early withdrawal penalties, governance-adjustable emissions

### 3. TreasuryVault
- **Daily Withdrawal Limits**: Configurable by governance
- **24-hour Auto-reset**: Daily limit resets after 24 hours
- **Safety**: SafeERC20 for token transfers
- **Emergency**: Treasury pause functionality

### 4. Governance
- **DAO-lite Model**: Proposal → Voting → Execution
- **State Machine**: Pending → Active → Succeeded → Queued → Executed
- **Quorum**: ≥4% of token supply
- **Timelock Support**: Ready for delayed execution

### 5. TeamVesting
- **Multi-beneficiary**: Separate vests for team members
- **Features**: Per-beneficiary cliff, linear vesting, safe removal
- **Mechanism**: Swap-and-pop removal to prevent O(n) operations

### 6. FeeRouter
- **Fee Distribution**: 20% burn | 30% treasury | 40% staking | 10% ecosystem
- **Burn Logic**: 5% minimum burn, governance-adjustable
- **Low-level calls**: Direct token burning mechanism

### 7. PropertyNFT
- **Standard**: ERC1155 (supports both fungible + semi-fungible)
- **Features**: Fractionalized property ownership, jurisdiction enforcement
- **Metadata**: IPFS integration ready, URI storage, batch minting
- **Supply Caps**: Per-property cap enforcement

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test file
npx hardhat test tests/OSANVToken.test.ts
```

**Test Coverage**: 104 tests across 7 contracts
- 11 OSANVToken tests
- 20 StakingVault tests
- 16 Governance tests
- 14 TreasuryVault tests
- 14 TeamVesting tests
- 12 FeeRouter tests
- 17 PropertyNFT tests

---

## 🔐 Security Architecture

### Ownership Separation
- Deployer ≠ Treasury Owner ≠ Governance Authority ≠ Emergency Controls
- Multisig-ready (Gnosis Safe compatible)
- Separate roles for PAUSER, TREASURY, BURNER

### Burn Floor Protection
- Minimum supply: 250M OSANV (hardcoded, immutable)
- Cannot burn below floor (enforced in quarterlyBurn)
- Governance cannot override burn floor

### Anti-Manipulation
- StakingVault: updateRewards modifier on all state changes
- rewardDebt tracking prevents flash-loan attacks
- Time-locked governance for critical changes

### Emergency Controls
- Pause/unpause for all token transfers
- Treasury emergency halt
- Governance pause for proposals

---

## 📊 Tokenomics

```
Total Supply: 500,000,000 OSANV
Burn Floor: 250,000,000 OSANV (50%)

Quarterly Burn Mechanism:
  - Treasury can burn up to 20% of protocol fees
  - Subject to burn floor enforcement
  - Governs inflation via on-chain governance

Staking Rewards:
  - Annual yields: 8% → 22% depending on tier
  - Funded by protocol treasury
  - Adjustable by governance (min 2% timelock)

Fee Distribution:
  - Burn: 20%
  - Treasury: 30%
  - Staking rewards: 40%
  - Ecosystem development: 10%
```

---

## 🌍 Land Rights & Compliance Framework

### Architectural Principles
✓ Respect indigenous land systems
✓ Support customary ownership structures
✓ Comply with African sovereign mineral laws
✓ Enable host community participation
✓ Support government regulatory workflows

### Initial Approach
**NOT** raw on-chain land ownership claims, but rather:
- Economic participation rights
- SPV-backed revenue rights
- Regulated custodial interests
- Title-verified properties with legal documentation

### Features Built
- Document verification system
- Survey/GIS integration ready
- Immutable audit trails
- Community participation support
- Host community reserve allocations
- Mineral licensing verification

---

## 🛠️ Development

### Local Development
```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Start backend (NestJS)
npm run backend:dev

# Terminal 4: Start frontend (Next.js)
npm run frontend:dev
```

### Compilation
```bash
npm run compile           # Standard compilation
npm run compile -- --force # Force recompilation
```

### Linting & Formatting
```bash
npm run lint              # Check code style
npm run format            # Auto-format code
```

---

## 🚀 Deployment

### Amoy Testnet (Primary Testing)
```bash
# 1. Configure .env with PRIVATE_KEY and AMOY_RPC_URL
# 2. Fund deployer with MATIC on Amoy faucet
# 3. Deploy
npm run deploy:amoy

# View on Polygonscan Amoy
# https://amoy.polygonscan.com/
```

### Polygon Mainnet (Production)
```bash
# 1. Review security audit results
# 2. Configure .env with mainnet credentials
# 3. Fund deployer with sufficient MATIC
# 4. Deploy
npm run deploy:polygon

# View on Polygonscan
# https://polygonscan.com/
```

### Arbitrum (Expansion)
- Deployment scripts ready
- Will activate after Polygon mainnet stability

---

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design, module overview, data flows
- **[TOKENOMICS.md](./docs/TOKENOMICS.md)** - Token economics, allocation, burn mechanics
- **[GOVERNANCE.md](./docs/GOVERNANCE.md)** - DAO-lite governance, proposal lifecycle
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Step-by-step mainnet deployment guide
- **[API.md](./docs/API.md)** - Backend REST API reference
- **[SECURITY.md](./docs/SECURITY.md)** - Security model, audit findings, risk assessment

---

## 🤝 Contributing

We welcome contributions from developers, security researchers, and community members.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes with professional messages (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request with detailed description

### Code Standards
- All code must be production-ready
- Strong typing everywhere (TypeScript/Solidity)
- Comprehensive tests required
- Security audit for smart contracts
- NatSpec comments on all public functions

---

## 📖 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 👥 Team

**Founder**: Olugbenga Ajayi
**Vision**: Build institutional-grade African blockchain infrastructure

---

## 📞 Contact

- **Website**: https://osanvault.africa
- **Email**: hello@osanvault.africa
- **Twitter**: @osanvault
- **GitHub**: https://github.com/osanvault

---

## ⚖️ Disclaimer

This project is in active development. Smart contracts are not yet audited. Do not use in production without proper security audit and legal review.

**African Compliance Notice**: This platform respects sovereign rights, indigenous land systems, and local governance structures. All implementations are designed with legal experts and community stakeholders.

---

**Last Updated**: 2026-05-25
**Status**: Smart Contracts Phase Complete • Backend in Development • Frontend in Development