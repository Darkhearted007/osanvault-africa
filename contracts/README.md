# OsanVault Africa — Smart Contracts

EVM-first contracts on **Polygon Amoy Testnet** (chainId 80002).

## Contracts

| Contract | Description |
|---|---|
| `OsanVToken` | OSANV ERC-20 governance & staking token (1B supply) |
| `LandRegistry` | Dual verification: government title hash + indigenous authority |
| `PropertyNFT` | ERC-1155 fractional property tokens (one ID per SPV) |
| `OsanCarbon` | ERC-1155 verified carbon credits linked to African climate projects |
| `StakingVault` | 4-tier OSANV staking: Bronze 8% / Silver 12% / Gold 18% / Platinum 22% APR |
| `TreasuryVault` | Timelocked treasury (2-day delay, 50K OSANV daily limit) |
| `FeeRouter` | Fee split: 30% treasury / 20% burn / 40% staking / 10% team |
| `Governance` | DAO voting: 100K OSANV threshold, 5M quorum, 7-day period, 2-day timelock |

## Prerequisites

1. **Node.js 20+** and **pnpm**
2. A deployer wallet with **test MATIC** on Polygon Amoy
   - Faucet: https://faucet.polygon.technology/
3. A **Polygonscan API key** (free): https://polygonscan.com/myapikey

## Setup

```bash
cd contracts
cp .env.example .env
# Edit .env — add DEPLOYER_PRIVATE_KEY and POLYGONSCAN_API_KEY
pnpm install
```

## Compile

```bash
pnpm compile
```

## Deploy to Polygon Amoy

```bash
pnpm deploy:amoy
```

This deploys all 8 contracts in dependency order and saves addresses to `deployed-addresses.json`.

## Verify on Polygonscan

```bash
pnpm verify:amoy
```

Reads `deployed-addresses.json` and verifies each contract on Amoy Polygonscan.

## After Deployment

Update `artifacts/osanvault/src/lib/contract.ts` with the deployed addresses from `deployed-addresses.json`:

```ts
export const OSANCARBON_ADDRESS:    Address = "0x...";
export const PROPERTY_NFT_ADDRESS:  Address = "0x...";
export const STAKING_VAULT_ADDRESS: Address = "0x...";
export const GOVERNANCE_ADDRESS:    Address = "0x...";
export const LAND_REGISTRY_ADDRESS: Address = "0x...";
export const OSANV_TOKEN_ADDRESS:   Address = "0x...";
export const TREASURY_VAULT_ADDRESS:Address = "0x...";
export const FEE_ROUTER_ADDRESS:    Address = "0x...";
```

`IS_CONTRACT_DEPLOYED` will flip to `true` automatically once `OSANCARBON_ADDRESS` is non-zero — this enables all wagmi reads/writes in the frontend.

## Fee Split (FeeRouter)

| Destination | Percentage |
|---|---|
| TreasuryVault | 30% |
| OSANV burn | 20% |
| StakingVault rewards | 40% |
| Team wallet | 10% |

## Network Details

| Field | Value |
|---|---|
| Network | Polygon Amoy |
| Chain ID | 80002 |
| RPC | https://rpc-amoy.polygon.technology |
| Explorer | https://amoy.polygonscan.com |
| Faucet | https://faucet.polygon.technology |
