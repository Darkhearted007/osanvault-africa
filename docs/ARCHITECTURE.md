# System Architecture — OsanVault Africa

This document describes the technical architecture of the OsanVault platform. For developer setup instructions see `docs/DEVELOPMENT.md`. For an overview, see the root `README.md`.

---

## Service Topology

```
                        ┌─────────────────────────────────┐
                        │         Reverse Proxy            │
                        │   (Replit path-based routing)    │
                        └────────────┬────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                       │
              ▼                      ▼                       ▼
   ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────────┐
   │  osanvault (web)  │  │   api-server      │  │  osanvault-mobile    │
   │  React 18 + Vite  │  │  Express 5 + Pino │  │  Expo React Native   │
   │  PATH: /          │  │  PATH: /api       │  │  Expo Dev Domain     │
   └──────────┬────────┘  └────────┬──────────┘  └──────────────────────┘
              │                    │
              │   React Query      │   Drizzle ORM
              │   (generated)      │
              │                    ▼
              │           ┌──────────────────┐
              └──────────▶│   PostgreSQL DB   │
                          │  (Replit-managed) │
                          └──────────────────┘
```

All traffic enters through a shared reverse proxy. Services bind to the `PORT` environment variable assigned per workflow. Paths are not rewritten — services handle their full base path.

---

## Package Dependency Graph

```
artifacts/osanvault          artifacts/api-server
       │                            │
       ├── @workspace/api-client-react    ├── @workspace/db
       │         │                        ├── @workspace/api-zod
       │         └── @workspace/api-zod  └── @workspace/api-zod
       │
       └── @workspace/db (for direct Drizzle queries in SSR if needed)

lib/api-client-react
       └── [auto-generated from lib/api-spec]

lib/api-zod
       └── [auto-generated from lib/api-spec]

lib/db
       └── drizzle-orm + pg + zod
```

Shared library build order (enforced by TypeScript project references):
1. `lib/api-zod`
2. `lib/db`
3. `lib/api-client-react`

---

## API Design

### Contract-First

The OpenAPI 3.1 specification at `lib/api-spec/openapi.yaml` is the single source of truth for all API contracts. Client code is generated from it — never written by hand.

```
lib/api-spec/openapi.yaml
        │
        ▼ orval codegen
        ├── lib/api-client-react/src/   (React Query hooks)
        └── lib/api-zod/src/            (Zod validation schemas)
```

After any schema change, run `pnpm --filter @workspace/api-spec run codegen`.

### Route Structure

All routes are prefixed `/api`. The router is assembled in `artifacts/api-server/src/routes/index.ts`:

| Router | Base path | Auth |
| :--- | :--- | :--- |
| `health` | `/api/healthz` | None |
| `properties` | `/api/properties` | None |
| `carbon` | `/api/carbon` | None |
| `governance` | `/api/governance` | None |
| `activity` | `/api/activity` | None |
| `platform-stats` | `/api/stats` | None |
| `whitelist` | `/api/whitelist` | None (admin gate planned) |
| `leads` | `/api/leads` | `/count` public; rest admin-pending |

### Logging

All route handlers use `req.log` (Pino HTTP). Never use `console.log` in server code. Structured logs include `requestId`, `method`, `url`, `statusCode`, and `responseTime`.

---

## Database Schema

Seven tables in PostgreSQL, managed by Drizzle ORM. Schema source lives in `lib/db/src/schema/`.

| Table | Purpose |
| :--- | :--- |
| `properties` | Tokenized real estate SPV records |
| `carbon_projects` | Verified carbon offset projects |
| `governance_proposals` | DAO proposal records |
| `activity_events` | Platform-wide activity feed |
| `whitelist` | KYC/AML-verified wallet addresses |
| `leads` | Early investor registration captures |

Schema changes follow a push-based workflow: edit schema files, run `pnpm --filter @workspace/db run push`. There are no migration files — Drizzle Kit introspects and applies diffs directly (appropriate for a pre-launch project where schema volatility is high).

---

## Smart Contract Interaction Model

```
UI (wagmi hooks)
      │
      ├── IS_CONTRACT_DEPLOYED = true  ──▶  on-chain read/write via wagmi
      │
      └── IS_CONTRACT_DEPLOYED = false ──▶  mock data + "Testnet" toasts
```

The `IS_CONTRACT_DEPLOYED` flag in `artifacts/osanvault/src/lib/contract.ts` gates all wagmi contract reads. When `false` (current state — contracts deployed to Amoy but addresses not yet wired), the UI falls back gracefully to mock data from `lib/mock-data.ts`.

### Contract Address Management

All contract addresses live in `contract.ts`. After deploying to a network, update the address map:

```ts
export const CONTRACT_ADDRESSES = {
  PropertyNFT:    "0x...",
  LandRegistry:   "0x...",
  OsanCarbon:     "0x...",
  StakingVault:   "0x...",
  Governance:     "0x...",
  TreasuryVault:  "0x...",
  FeeRouter:      "0x...",
} as const;
```

---

## Frontend Architecture

### Routing

The web app uses Wouter with `base={import.meta.env.BASE_URL}` to support path-based proxy routing. All route definitions are in `App.tsx`.

### Data Fetching

Server state is managed by TanStack Query v5 via the generated hooks in `@workspace/api-client-react`. The base URL is derived from `import.meta.env.BASE_URL`:

```ts
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API  = `${BASE}/api`;
```

Never hardcode `/api` without the `BASE` prefix — it will fail in the proxied preview environment.

### Design System

- **Colors:** Forest Green (`#0d1f0f` → `#3a8042`) primary, Gold Amber (`#d4a017`) accent
- **Typography:** Display font for headings, system stack for body
- **Component library:** Radix UI primitives + Tailwind CSS v4 utility classes
- **Animations:** Framer Motion — `fadeUp` variant is the standard page entry animation
- **Notifications:** Sonner toasts, bottom-right position

---

## Mobile Architecture

`artifacts/osanvault-mobile/` is an Expo React Native app. It is served at the `$REPLIT_EXPO_DEV_DOMAIN` (bypasses the shared path proxy). It shares no source code with the web app directly but consumes the same REST API.

---

## Security Considerations

- **No secrets in source.** All sensitive values are injected at runtime via Replit Secrets.
- **KYC gate.** On-chain token minting is gated by the whitelist registry — only approved wallet addresses can receive property tokens.
- **Input validation.** All API inputs are validated with Zod schemas before reaching business logic.
- **Rate limiting.** Not yet implemented — required before public launch.
- **CORS.** Currently permissive for development. Restrict to production origin before mainnet.
- **Admin routes.** Whitelist and lead management routes currently have no authentication gate. Session-based admin auth is planned before mainnet.
