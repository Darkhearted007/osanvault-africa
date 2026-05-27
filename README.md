# ÒsánVault Africa — OSANV Ecosystem

**Tokenized African Real-World Assets. Institutional Grade.**

> “Own a piece of Africa, one piece at a time.”  
> — Olugbenga Ajayi, Founder

---

## Overview

ÒsánVault Africa is a production-grade blockchain infrastructure for tokenizing African real-world assets (RWAs). Built on **Polygon** (Amoy → Mainnet), the platform enables compliant tokenization of carbon credits, real estate, and mineral revenue participation systems with institutional security standards.

### Core Systems

| System | Contract | Description |
|--------|----------|-------------|
| **OSANVToken** | `contracts/token/OSANVToken.sol` | ERC-20 with permit, burn floor (250M), immutable 500M cap |
| **StakingVault** | `contracts/staking/StakingVault.sol` | 4-tier staking (Bronze 8% → Platinum 22% APR) |
| **TreasuryVault** | `contracts/treasury/TreasuryVault.sol` | Multisig-compatible, timelock (2d), daily limits |
| **Governance** | `contracts/governance/Governance.sol` | DAO-lite proposals, token-weighted voting, timelock execution |
| **TeamVesting** | `contracts/vesting/TeamVesting.sol` | Cliff + linear vesting, multi-wallet support |
| **FeeRouter** | `contracts/fees/FeeRouter.sol` | Fee distribution (treasury/burn/staking/team) |
| **PropertyNFT** | `contracts/nft/PropertyNFT.sol` | ERC-1155 fractional real estate ownership |
| **OsanCarbon** | `contracts/OsanCarbon.sol` | Carbon credit tokenization with retirement mechanism |

---

## Security Model

### Ownership Separation
```
Deployer ≠ Treasury ≠ Governance ≠ Emergency Admin
```

### Role Architecture
| Role | Privileges |
|------|-----------|
| `DEFAULT_ADMIN_ROLE` | Manage roles, upgrade parameters |
| `MINTER_ROLE` | Mint tokens (supply-capped) |
| `BURNER_ROLE` | Burn tokens (floor-protected) |
| `PAUSER_ROLE` | Emergency pause/unpause |
| `VERIFIER_ROLE` | Create/verify carbon projects |
| `GOVERNANCE_ROLE` | Configure staking parameters |
| `EXECUTOR_ROLE` | Execute treasury withdrawals |
| `GUARDIAN_ROLE` | Cancel withdrawals, update limits |
| `MANAGER_ROLE` | Manage vesting beneficiaries |
| `COLLECTOR_ROLE` | Distribute fees |
| `CONFIGURER_ROLE` | Update fee splits |

### Security Features
- **Timelock**: All sensitive actions delayed (2d minimum)
- **Multisig-ready**: Treasury built for Gnosis Safe
- **Burn floor**: OSANV cannot be burned below 250M supply
- **Immutable cap**: 500M max supply enforced in contract
- **Pausable**: Emergency stop for all critical functions

---

## Smart Contract Architecture

### OSANVToken
- ERC-20 + ERC-20 Permit (EIP-2612 gasless approvals)
- AccessControl with 4 roles (admin/minter/burner/pauser)
- Burn floor at 250M OSANV — prevents supply manipulation
- Pausable transfers for emergency scenarios

### StakingVault
| Tier | APR | Lock Period |
|------|-----|-------------|
| Bronze | 8% | 30 days |
| Silver | 12% | 90 days |
| Gold | 18% | 180 days |
| Platinum | 22% | 365 days |

- Configurable APR by governance
- Early withdrawal penalty (default 10%)
- Reward accrual via `accRewardPerShare` mechanism
- Treasury-backed reward funding

### TreasuryVault
- 2-step withdrawal: request → timelock → execute
- Daily withdrawal limits (default 50k OSANV)
- Guardian can cancel pending withdrawals
- Multi-token support

### Governance
- Token-weighted voting with OSANV
- 1d voting delay + 7d voting period + 2d timelock
- Quorum: 5M OSANV minimum
- Proposal threshold: 100k OSANV

### FeeRouter
- Default split: Treasury 30% / Burn 20% / Staking 40% / Team 10%
- Configurable by `CONFIGURER_ROLE`
- Burn cap: 20% maximum

### OsanCarbon
- ERC-1155 carbon credit NFTs
- Lifecycle: Create → Verify → Issue → Retire
- Integrated retirement fee in OSANV routed through FeeRouter
- `retireCreditsFrom` for delegated retirement

### PropertyNFT
- ERC-1155 fractional real estate shares
- Jurisdiction-aware metadata
- Verification workflow for legal compliance

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity ^0.8.24, OpenZeppelin v5 |
| Development | Hardhat, TypeScript, ethers v6 |
| Testing | Hardhat Chai Matchers, Network Helpers |
| Deployment | Polygon Amoy → Polygon Mainnet |
| Verification | Polygonscan API |
| Gas Analysis | hardhat-gas-reporter |
| Security | Role-based access, Timelocks, Pause |

---

## Getting Started

```bash
# Clone and install
git clone https://github.com/Darkhearted007/osanvault-africa.git
cd osanvault-africa
npm install

# Configure environment
cp .env.example .env
# Fill in DEPLOYER_PRIVATE_KEY, ADMIN_WALLET, etc.

# Compile
npm run compile

# Run tests (93 passing)
npm test

# Deploy to Amoy testnet
npm run deploy:amoy

# Verify on Polygonscan
npm run verify:amoy
```

---

## Tokenomics

| Parameter | Value |
|-----------|-------|
| **Total Supply** | 500,000,000 OSANV |
| **Burn Floor** | 250,000,000 OSANV |
| **Staking Tiers** | 8%–22% APR |
| **Early Penalty** | 10% (configurable) |
| **Vesting Cliff** | Configurable (min 30d) |
| **Governance Quorum** | 5,000,000 OSANV |

---

## Deployment

**Current target:** Polygon Amoy testnet → Polygon Mainnet

```bash
# Local Hardhat node
npm run deploy:local

# Polygon Amoy
npm run deploy:amoy
```

See `scripts/masterDeploy.ts` for the full deployment pipeline that deploys all contracts in order with role assignment and configuration.

---

## License & IP

**BUSL-1.1** — See [LICENSE](./LICENSE). Change Date: 2035-12-31.

This is a **protected commercial project**. Key terms:
- Non-commercial use permitted
- Commercial use requires license
- No competitive offerings allowed
- Trademarks reserved

**Trademarks:** ÒsánVault™, OSANV™, OsanCarbon™, and "Own a piece of Africa, one piece at a time." are trademarks of ÒsánVault Africa. All rights reserved.

---

## Legal Notice for African RWA Systems

This software facilitates tokenization of real-world assets. Implementers must:
- Comply with all applicable laws and regulations
- Obtain proper regulatory approvals
- Respect indigenous land rights and customary ownership
- Ensure community benefit-sharing arrangements
- Follow digital asset regulatory frameworks

---

*Built with purpose in Africa, for the world.*
