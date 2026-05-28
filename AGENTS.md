# OsanVault Africa — Agent Guide

## Project structure

Root Hardhat + TypeScript project. One contract, one deploy script, under 200 lines each.

- `contracts/OsanCarbon.sol` — ERC-1155 carbon credit tokenization (OpenZeppelin 5.x)
- `scripts/deploy.ts` — deploy script (reads `.env`)
- `hardhat.config.ts` — canonical config (`.js` removed, don't recreate)
- `package-lock.json` — committed for deterministic installs

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

## Known issues / quirks

- **Stale git deletions pending**: previous commit accidentally tracked `contracts/node_modules/` and `contracts/package*` (remnants of a sub-project). Run `git commit` to finalize the deletion.
- **No tests written yet**: `./tests/` directory created empty; test suite will report "no test files found" until tests are added.
- **Duplicate storage in contract**: `projects[].verifier` field is written but never read; `projectVerifier[]` mapping holds the same data. Consider removing one to save gas.
- **`totalIssued` field has no public view**: `MAX_SUPPLY_PER_PROJECT (10M)` is enforced on mint but there's no on-chain function to query remaining project cap.
