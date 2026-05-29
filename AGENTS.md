# OsanVault Africa — Agent Guide

## Project structure

Root Hardhat + TypeScript project. **EVM-first** — Solana/Anchor programs exist but are frozen pending EVM mainnet launch.

- `contracts/OsanCarbon.sol` — ERC-1155 carbon credit tokenization (OpenZeppelin 5.x)
- `contracts/staking/StakingVault.sol` — 4-tier staking (Bronze→Platinum, 8–22% APR)
- `contracts/governance/Governance.sol` — DAO-lite governance (custom, see notes below)
- `contracts/treasury/TreasuryVault.sol` — Treasury with timelock and daily withdrawal limit
- `contracts/fees/FeeRouter.sol` — 30/20/40/10 fee distribution
- `contracts/property/PropertyNFT.sol` — ERC-1155 property tokens
- `contracts/vesting/TeamVesting.sol` — Linear vesting with cliff
- `scripts/deploy.ts` — deploy script (reads `.env`)
- `hardhat.config.ts` — canonical config (`.js` removed, don't recreate)
- `tests/OsanCarbon.test.ts` — OsanCarbon test suite

## Commands

```bash
npm run compile        # hardhat compile --force
npm test               # hardhat test (tests in ./tests/)
npm run deploy:amoy    # hardhat run scripts/deploy.ts --network amoy
npm run deploy:local   # hardhat run scripts/deploy.ts --network localhost
```

## Networks

| Name       | Chain ID | Notes                        |
|------------|----------|------------------------------|
| `hardhat`  | 31337    | In-process node, local tests |
| `localhost`| 1337     | External node at :8545       |
| `amoy`     | 80002    | Polygon Amoy testnet         |

Verification configured for Amoy via Polygonscan.

## Contract (OsanCarbon)

Roles: `DEFAULT_ADMIN_ROLE` (admin), `VERIFIER_ROLE` (creates/verifies projects, issues credits, sets metadata), `PAUSER_ROLE` (pause/unpause).

Flow: createProject → verifyProject (same verifier only) → issueCredits → retireCredits (any holder). Project cap: 10M * 1e18 per project.

Solidity 0.8.24, Cancun EVM, viaIR enabled, optimizer at 200 runs.

## Environment

Copy `.env.example` to `.env`. Required: `DEPLOYER_PRIVATE_KEY`. Optional: `ADMIN_WALLET`, `VERIFIER_WALLET`, `POLYGONSCAN_API_KEY`, `REPORT_GAS=true`.

## Architecture decisions

- **EVM-first**: Shipping on Polygon Amoy testnet → Polygon mainnet. Solana programs frozen.
- **`projectVerifier` mapping is the single source of truth** for verifier access control on `verifyProject` and `setMetadata`. The `Project` struct no longer stores a `verifier` field — duplicate storage has been removed to save gas and avoid stale-read bugs.
- **`getProjectRemainingCap(id)`** view function added — returns `MAX_SUPPLY_PER_PROJECT - totalIssued` so frontends and bots can query remaining issuance capacity without indexing events.
- **Governance is custom**: Replacement with OpenZeppelin `Governor` + `GovernorTimelockControl` is planned before mainnet — custom governance code is high-risk in DeFi.

## Known issues / remaining work

- **Governance.sol**: Replace with OZ Governor before mainnet audit.
- **No tests yet for**: StakingVault, Governance, TreasuryVault, FeeRouter, PropertyNFT, TeamVesting.
- **No full deployment script**: `scripts/deploy.ts` deploys OsanCarbon only. A wiring script connecting FeeRouter → OsanCarbon, StakingVault → FeeRouter etc. is needed.
- **Frontend contract address**: `artifacts/osanvault/src/lib/contract.ts` has a zero address placeholder — update after Amoy deploy.
