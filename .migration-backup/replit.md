# OsanVault Africa

A real estate tokenization and carbon credit platform on Polygon (EVM-first). Fractional property ownership is the core product; carbon credits, staking, and governance are upper layers.

## Run & Operate

- `pnpm --filter @workspace/osanvault run dev` — run the frontend (Vite, port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- GitHub repo: `https://github.com/Darkhearted007/osanvault-africa` (PAT stored as `GITHUB_PAT` secret)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, wagmi v2, RainbowKit, Wouter, Framer Motion, Recharts, Tailwind CSS, Sonner
- Chain: Polygon Amoy Testnet (EVM-first)
- Token: OSANV (Solana SPL, but EVM-first for now — treated as ERC-20 reference)

## Where things live

```
artifacts/osanvault/src/
  App.tsx                    — router (/, /properties, /properties/:id, /staking, /governance, /carbon, /portfolio)
  lib/mock-data.ts           — all mock data: MOCK_PROPERTIES, MOCK_CARBON_PROJECTS, STAKING_TIERS, MOCK_PROPOSALS
  lib/contract.ts            — contract addresses (zero placeholder), ABIs, helper utils
  lib/abi.ts                 — OsanCarbon ABI (ERC-1155)
  lib/wagmi.ts               — wagmi config + Polygon Amoy chain
  pages/home.tsx             — hero + stats + live properties + activity feed
  pages/properties.tsx       — SPV browser with search + type/status filters
  pages/property-detail.tsx  — property SPV detail + buy fractions form
  pages/staking.tsx          — OSANV staking tiers (Bronze/Silver/Gold/Platinum)
  pages/governance.tsx       — proposals + voting (for/against bars)
  pages/carbon.tsx           — carbon projects + retire wizard
  pages/portfolio.tsx        — tabbed holdings view (properties / carbon / staking / history)
  components/layout/Header.tsx — nav with Building2 logo icon
  components/layout/Footer.tsx — footer
```

GitHub contracts (in `contracts/`):
- `PropertyNFT.sol` — ERC-1155 fractional property tokens (CORE)
- `LandRegistry.sol` — dual verification (government + indigenous authority)
- `OsanCarbon.sol` — ERC-1155 carbon credits linked to climate projects
- `StakingVault.sol` — OSANV staking with 4 tiers
- `Governance.sol` — DAO voting (100K OSANV threshold, 5M quorum, 7-day period, 2-day timelock)
- `TreasuryVault.sol` — timelocked treasury (2-day, 50K daily limit)
- `FeeRouter.sol` — 30% treasury / 20% burn / 40% staking / 10% team

## Architecture decisions

- **Property-first hierarchy**: UI leads with real estate tokenization as the core product. Carbon is Layer 5, staking is Layer 3, governance is Layer 4. The home hero says "Africa's Real Estate, Tokenized."
- **NGN primary currency**: All property values displayed in Nigerian Naira (₦) first, not USD. `formatNgn()` in mock-data.ts handles B/M/K formatting.
- **Mock-first until mainnet**: All contract addresses are zero address (`IS_CONTRACT_DEPLOYED = false`). Pages degrade gracefully with mock data and toast messages explaining the testnet status.
- **Staking tier APRs from contract**: Bronze 8% (800 bps), Silver 12% (1200 bps), Gold 18% (1800 bps), Platinum 22% (2200 bps) — taken from `StakingVault.sol` constants, NOT the DESIGN_REFERENCE APY values which differ slightly.
- **Dual land verification on-chain**: `LandRegistry.sol` stores both `governmentTitleHash` and `indigenousAuthority` before PropertyNFT can mint — this is surfaced in the property detail page under Legal & Compliance.

## Product

Users can:
1. Browse 6 tokenized African real estate SPVs (Nigeria, Ghana, Kenya) and buy fractional tokens from ₦1,000
2. View per-property funding progress, yield APY, carbon offset, and legal compliance info
3. Stake OSANV tokens in 4 tiers (8–22% APR, 30–365 day lock) to earn rewards and governance weight
4. Vote on governance proposals using staked OSANV balance
5. View and retire verified carbon credits from 5 African climate projects (some linked to properties)
6. Track portfolio: property holdings, carbon credits, OSANV stake, and transaction history

## User preferences

- Real estate tokenization is THE CORE product — not carbon credits. Always lead with properties.
- Currency is NGN (₦) primary, USD secondary.
- African luxury fintech aesthetic: Forest Green (#0d1f0f → #3a8042) + Gold Amber (#d4a017) accent.
- Trust signals to always include: SEC ARIP Sandbox, Polygon Network, Dual Land Verification.
- Do not push GitHub directly from bash — use the Node.js HTTPS API with the `GITHUB_PAT` secret.

## Gotchas

- `IS_CONTRACT_DEPLOYED` is `false` (all addresses are zero). This gates wagmi contract reads and shows "simulation" toasts.
- `formatNgn()` and `formatOsanv()` are in `mock-data.ts`; `formatCredits()` and `shortenAddress()` are in both files — prefer `mock-data.ts` for display and `contract.ts` for on-chain related utils.
- Carbon projects 2 and 4 have `linkedPropertyId` set — these surface a "Linked to Property" chip in the Carbon page and a carbon section in the Property Detail page.
- Old pages (`projects.tsx`, `project-detail.tsx`, `retire.tsx`) have been deleted — they are superseded by `properties.tsx`, `property-detail.tsx`, and `carbon.tsx`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- DESIGN_REFERENCE.md (in GitHub repo at `/apps/web/DESIGN_REFERENCE.md`) is the canonical UI/UX spec
- CLAUDE.md (repo root) is the canonical platform architecture and tokenomics reference
