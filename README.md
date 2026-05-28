# OsanCarbon — Carbon Credit Tokenization

OsanCarbon is an ERC-1155 smart contract for tokenizing verified carbon credits from African climate projects. Built on Polygon Amoy and Polygon mainnet.

## Overview

- Each token ID represents a unique carbon credit project batch
- Verifiers register projects and mint credits after verification
- Credits are fungible within a project batch
- Holders can retire credits (permanent burn) with a reason string
- Metadata stored via ERC1155URIStorage for each project batch

## Contract Architecture

| Role | Privileges |
|------|-----------|
| `DEFAULT_ADMIN_ROLE` | Manage roles, pause/unpause |
| `VERIFIER_ROLE` | Create projects, verify, issue credits, update metadata |
| `PAUSER_ROLE` | Emergency pause/unpause |

**Key Functions:**
- `createProject()` — Register a new carbon project
- `verifyProject()` — Mark a project as verified
- `issueCredits()` — Mint carbon credits for a verified project
- `retireCredits()` — Permanently retire credits with a reason

## Deploy

```bash
cp .env.example .env
# fill in DEPLOYER_PRIVATE_KEY, ADMIN_WALLET, etc.

npm run compile
npm run deploy:amoy
```

## License

BUSL-1.1 — See [LICENSE](./LICENSE). Change Date: 2030-12-31.
