# Developer Setup — OsanVault Africa

This guide gets a new developer from zero to a running local environment.

---

## System Requirements

| Tool | Minimum | Recommended |
| :--- | :--- | :--- |
| Node.js | 22 | 24 LTS (see `.nvmrc`) |
| pnpm | 10 | latest |
| PostgreSQL | 14 | Replit-managed (no local install needed) |
| Git | 2.x | any recent |

Install the correct Node version using nvm:

```bash
nvm install   # reads .nvmrc automatically
nvm use
```

Install pnpm:

```bash
npm install -g pnpm@latest
```

---

## Environment Variables

Copy the required secrets into your environment before running anything.

| Variable | Where to get it |
| :--- | :--- |
| `DATABASE_URL` | Replit Secrets (auto-injected in workspace) |
| `SESSION_SECRET` | Generate: `openssl rand -base64 32` |
| `GITHUB_PAT` | GitHub → Settings → Developer settings → Fine-grained PAT |
| `POLYGON_RPC_URL` | Alchemy or Infura — Polygon Amoy endpoint |
| `PRIVATE_KEY` | Testnet deployer wallet — never use a funded mainnet key |
| `POLYGONSCAN_API_KEY` | polygonscan.com API dashboard |

In the Replit environment, `DATABASE_URL` and `SESSION_SECRET` are already injected. The GitHub PAT is stored as a Replit Secret.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Darkhearted007/osanvault-africa.git
cd osanvault-africa

# Install all workspace dependencies (runs preinstall guard)
pnpm install
```

The `preinstall` script blocks `npm install` and `yarn` — only pnpm is supported.

---

## Running Services

### API Server

```bash
pnpm --filter @workspace/api-server run dev
```

Compiles TypeScript with esbuild, then starts the Express server. Binds to `$PORT` (default 5000). Logs are structured JSON via Pino; pipe through `pino-pretty` for development readability:

```bash
pnpm --filter @workspace/api-server run dev | pnpm exec pino-pretty
```

### Web Frontend

```bash
pnpm --filter @workspace/osanvault run dev
```

Starts the Vite dev server. Binds to `$PORT`. Hot module replacement is enabled. The wallet connection UI (RainbowKit) works in the browser without a wallet extension installed.

### Mobile App

```bash
pnpm --filter @workspace/osanvault-mobile run dev
```

Starts the Expo development server. Access via `$REPLIT_EXPO_DEV_DOMAIN`. QR code scanning into Expo Go works for physical device testing.

---

## Database

### Initial setup

The database schema is managed by Drizzle Kit. To create or update tables:

```bash
pnpm --filter @workspace/db run push
```

This is safe to run multiple times — Drizzle Kit only applies the diff.

### Seed data

```bash
pnpm --filter @workspace/scripts run seed
```

Populates the database with the 6 demo properties, 5 carbon projects, governance proposals, and activity events.

---

## Code Generation

The API client and validation types are generated from the OpenAPI spec. Run codegen after any schema change:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Generated output locations:
- `lib/api-client-react/src/` — React Query hooks
- `lib/api-zod/src/` — Zod validation schemas

Then rebuild the composite libs:

```bash
pnpm run typecheck:libs
```

---

## Type Checking

```bash
# Full workspace (canonical — always use this in CI)
pnpm run typecheck

# Composite libs only (faster, use after lib changes)
pnpm run typecheck:libs

# Single artifact (fastest, use during active development)
pnpm --filter @workspace/osanvault run typecheck
pnpm --filter @workspace/api-server run typecheck
```

Do not rely on IDE / LSP diagnostics alone — always verify with `pnpm run typecheck` before pushing.

---

## Smart Contracts

```bash
# Compile all contracts
pnpm --filter @workspace/contracts run compile

# Run test suite
pnpm --filter @workspace/contracts run test

# Deploy to Polygon Amoy (requires POLYGON_RPC_URL + PRIVATE_KEY)
pnpm --filter @workspace/contracts run deploy:amoy

# Verify on Polygonscan (requires POLYGONSCAN_API_KEY)
pnpm --filter @workspace/contracts run verify:amoy
```

After deployment, update the contract addresses in:
```
artifacts/osanvault/src/lib/contract.ts
```

and set `IS_CONTRACT_DEPLOYED = true`.

---

## Code Style

Formatting is handled by Prettier. Configuration is in `prettier.config.js` at the workspace root.

```bash
# Format all files
pnpm run format

# Check without writing (suitable for CI)
pnpm run format:check
```

Editor integration: install the **Prettier - Code formatter** VS Code extension (`.vscode/extensions.json` will prompt you). It is configured to format on save via `.vscode/settings.json`.

---

## GitHub Sync

This workspace uses the GitHub Data API to push changes instead of `git push`:

```bash
pnpm --filter @workspace/scripts run github-sync
```

The script (`scripts/src/github-api-push.mjs`) detects new, modified, and untracked files, creates blobs, assembles a tree diff, and creates a merge commit — all over HTTPS using the `GITHUB_PAT` secret. It handles rate limiting automatically.

---

## Troubleshooting

**`pnpm install` fails with peer dependency errors**

The workspace uses `autoInstallPeers: false`. This is intentional. If you see peer errors for packages not explicitly listed in `pnpm-workspace.yaml`, add them to the relevant `package.json` manually.

**Type errors after `pnpm install`**

Run `pnpm run typecheck:libs` to rebuild the composite library declarations before checking artifact packages.

**Vite preview shows wrong app**

The proxy routes by path prefix. Ensure the artifact's `previewPath` in `.replit-artifact/artifact.toml` matches the Vite `base` config.

**Wallet connect shows wrong network**

The wagmi config in `artifacts/osanvault/src/lib/wagmi.ts` targets Polygon Amoy (chain ID 80002). Switch MetaMask to the Amoy testnet and ensure your wallet has test MATIC from the [Polygon Faucet](https://faucet.polygon.technology/).
