# ÒsánVault Africa — Deployment Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Access to deployer wallet with MATIC for gas

## Setup

```bash
git clone <repo>
cd osanvault-africa
npm install
cp .env.example .env
# Edit .env with your private key
```

## Local Testing

```bash
npx hardhat compile
npm test
npm run deploy:local
```

## Testnet Deployment (Amoy)

```bash
npm run deploy:amoy
```

This deploys all 14 contracts in dependency order and saves addresses to deployments/amoy.json.

## Verification

After deployment, verify on Polygonscan:

```bash
npx hardhat verify --network amoy <PROXY_ADDRESS> <INITIALIZER_ARGS>
```

## Upgrade

```bash
# Deploy new implementation
npx hardhat run scripts/upgrade.ts --network amoy
```

## Deployed Contract Addresses

After deployment, check deployments/amoy.json

## Environment Variables

See .env.example for all required variables.
