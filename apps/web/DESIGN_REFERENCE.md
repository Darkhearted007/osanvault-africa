# Òsánvault Africa — UI/UX Design Reference
**Last updated:** May 2026
**Maintained by:** Olugbenga Ajayi (Founder & CEO, Òsánvault Africa Ltd.)
**File purpose:** Persistent design reference for all AI-assisted frontend development.
Place this file at `apps/web/DESIGN_REFERENCE.md` in the monorepo root.

---

## 📁 Reference Images (place in `apps/web/public/design-refs/`)

| File | Description |
|------|-------------|
| `dashboard-mobile-mockup.png` | Three-screen mobile UI mockup showing Investor Dashboard, OSANV Staking, and SPV Explorer |
| `ecosystem-diagram-reference.png` | Ecosystem flow diagram (NOTE: diagram uses deprecated NET token — ignore token name, use OSANV) |

---

## ⚠️ CRITICAL TOKEN CORRECTION

The reference images were created before the token migration. They show "NET Token" and
"NigeriaEstate Token" — these are PERMANENTLY DEPRECATED. Any AI reading this file must:

- Replace ALL references to NET → OSANV
- Replace ALL references to NigeriaEstate Token → OSANV (Solana SPL)
- Replace ALL references to ELT, OLT, MLT tokens → use OSANV exclusively
- "Stake More NET" button → "Stake OSANV"
- "Buy ELT Tokens" button → "Buy OSANV"

OSANV is the one and only official token. 500M supply. Solana SPL.

---

## 🎨 Design System

### Color Palette

```css
/* Primary — Forest Green (brand anchor) */
--color-primary-900: #1a3d1f;
--color-primary-800: #1e4d24;
--color-primary-700: #2d6a35;
--color-primary-600: #3a8042;   /* Main brand green — headers, CTAs */
--color-primary-500: #4a9a54;
--color-primary-400: #68b36f;
--color-primary-100: #e8f5e9;   /* Light green tint — backgrounds */

/* Accent — Gold/Amber (wealth, premium tier) */
--color-gold-600: #b8860b;
--color-gold-500: #d4a017;
--color-gold-400: #e6b422;      /* Gold tier accent */
--color-gold-100: #fdf8e1;

/* Neutral */
--color-dark: #0d1f0f;          /* Deep dark green-black */
--color-surface: #ffffff;
--color-surface-alt: #f8faf8;
--color-border: #e0ece1;
--color-text-primary: #1a1a1a;
--color-text-secondary: #5a6b5c;
--color-text-muted: #8a9e8c;

/* Staking Tier Colors */
--tier-bronze: #a0522d;
--tier-silver: #94a3b8;
--tier-gold: #d4a017;
--tier-platinum: #7c3aed;

/* Semantic */
--color-success: #2e7d32;
--color-warning: #f59e0b;
--color-danger: #dc2626;
--color-info: #0284c7;
```

### Typography

```css
font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;

--text-xs: 11px;    --text-sm: 13px;   --text-base: 15px;
--text-lg: 17px;    --text-xl: 20px;   --text-2xl: 24px;
--text-3xl: 30px;   --text-4xl: 36px;

--font-regular: 400;  --font-medium: 500;
--font-semibold: 600; --font-bold: 700; --font-extrabold: 800;
```

### Spacing & Radius

```css
--radius-sm: 8px;   --radius-md: 12px;
--radius-lg: 16px;  --radius-xl: 20px;  --radius-full: 9999px;

--spacing-page: 16px;           /* Mobile page padding */
--spacing-page-desktop: 32px;   /* Desktop page padding */
--spacing-card: 16px;
--spacing-section: 24px;
```

---

## 📱 MOBILE LAYOUT (Primary Design Target)

Breakpoint: ≤ 768px
Navigation: Bottom tab bar (fixed, 4 tabs)
Header: Fixed top bar with logo + wallet connection

### Screen 1 — Investor Dashboard (Home Tab)

```
┌─────────────────────────────────┐
│  🏛 ÒsánVault Africa    [Wallet]│  ← Fixed header, green bg
├─────────────────────────────────┤
│  Welcome back, [name]!          │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Portfolio Value       │   │  ← Green gradient card
│  │   ₦2,045,000            │   │
│  │   $6,300 USD  +29.46%   │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌──────────┐ ┌──────────────┐ │
│  │ OSANV    │ │ SPV Holdings │ │  ← Two stat cards
│  │ 12,500   │ │ 3 Active     │ │
│  │ $6,875   │ │ Investments  │ │
│  └──────────┘ └──────────────┘ │
│                                 │
│  [  Stake OSANV  ] [Buy OSANV] │  ← CTA buttons
│                                 │
│  ── Investment Opportunities ── │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🌳 Ekiti LandBank SPV  │   │
│  │ 50 hectares · Phase 1   │   │
│  │ ████████░░ 62.25%       │   │
│  │ ₦249,000 / ₦400,000     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☀️ Solar Energy SPV    │   │
│  │ 100MW · Lagos           │   │
│  │ ██████░░░░ 45.8%        │   │
│  └─────────────────────────┘   │
│                                 │
│  [ Explore All Opportunities ]  │
├─────────────────────────────────┤
│  🏠       🧭       🔔      👤  │  ← Bottom nav (fixed)
│ Dashboard Explore Notif  Gov   │
└─────────────────────────────────┘
```

Dashboard Card Specs:
- Portfolio card: border-radius 20px, green gradient (#2d6a35 to #1a3d1f), shadow-lg
- Stat cards: white bg, border 1px solid #e0ece1
- CTA buttons: height 48px, border-radius 12px, full width on mobile
- Property cards: white bg, emoji icon (40x40), progress bar below
- Progress bar: green fill (#3a8042), grey track, % label right-aligned

---

### Screen 2 — OSANV Staking

```
┌─────────────────────────────────┐
│  ← OSANV Staking          ⚙️   │
├─────────────────────────────────┤
│  🔵 OSANV  755,000              │
│  Solana SPL Token               │
│  [652 OSANV Staked]  badge      │
│                                 │
│  Tier: Bronze → Silver → GOLD → Platinum
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⭐ GOLD TIER  APY: 18%  │   │  ← Gold gradient header
│  │─────────────────────────│   │
│  │ OSANV Staked: 200,000   │   │
│  │ Value: $24,000 USD      │   │
│  │ Progress: 62.35%        │   │
│  │─────────────────────────│   │
│  │ Bonus Rate: 650 OSANV   │   │
│  │─────────────────────────│   │
│  │ ✓ Priority deal access  │   │
│  │ ✓ Discounted fees 0.1%  │   │
│  │ ✓ Staking rewards       │   │
│  └─────────────────────────┘   │
│                                 │
│  [ ── Stake More OSANV ── ]    │
└─────────────────────────────────┘
```

Staking Tiers:
| Tier     | Min OSANV | APY   | Fee      |
|----------|-----------|-------|----------|
| Bronze   | 50,000    | 8.5%  | 0.5%     |
| Silver   | 100,000   | 12.5% | 0.3%     |
| Gold     | 200,000   | 18.0% | 0.1%     |
| Platinum | 500,000   | 25.0% | 0% (free)|

---

### Screen 3 — SPV Explorer

```
┌─────────────────────────────────┐
│  ← SPV Explorer            ⚙️  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │  [Property Image/Map]   │   │  ← ~180px tall hero image
│  │  Ekiti LandBank Phase 1 │   │
│  └─────────────────────────┘   │
│                                 │
│  50 Hectares — Phase 1          │
│  📍 Ekiti Growth Corridor       │
│  850 slots available            │
│                                 │
│  Target:  ₦400,000 MGN          │
│  Raised:  ₦249,000              │
│  ████████████░░░  62.25% Funded │
│                                 │
│  ✅ Details & More  >           │
│  ✓ Priority access to deals     │
│  ✓ Discounted transaction fees  │
│  ✓ Earn staking rewards         │
│                                 │
│  ┌──────────┐  ┌─────────────┐ │
│  │Buy OSANV │  │  Vote Yes   │ │
│  │ (green)  │  │ (dark red)  │ │
│  └──────────┘  └─────────────┘ │
└─────────────────────────────────┘
```

---

## 🖥️ DESKTOP/MAC LAYOUT

Breakpoint: ≥ 1024px
Navigation: Left sidebar (fixed, 240px expanded / 64px collapsed)
Layout: Sidebar + main content (2-col → 3-col on ultra-wide)

```
┌──────────────────────────────────────────────────────────────┐
│  🏛 ÒsánVault Africa                    [Connect Wallet] [👤] │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                  │
│  Dashboard  │  ┌──────────────┐ ┌──────────┐ ┌──────────┐  │
│  Explore    │  │ Portfolio    │ │ OSANV    │ │ Yield    │  │
│  Staking    │  │ ₦2,045,000   │ │ 12,500   │ │ 18% APY  │  │
│  Lend       │  └──────────────┘ └──────────┘ └──────────┘  │
│  Governance │                                                  │
│  Settings   │  ── Investment Opportunities ──────────────    │
│             │                                                  │
│  ─────────  │  ┌──────────────────┐  ┌──────────────────┐  │
│  Solana     │  │ Ekiti LandBank   │  │ Solar Energy SPV │  │
│  Mainnet    │  │ 50 ha · Phase 1  │  │ 100MW · Lagos    │  │
│             │  │ ██████░░ 62.25%  │  │ █████░░░ 45.8%   │  │
│  OSANV:     │  │ ₦249k / ₦400k    │  │ ₦252k / ₦550k    │  │
│  $0.0138    │  └──────────────────┘  └──────────────────┘  │
│             │                                                  │
│ [Disconnect]│  ── Ledger Activity ───────────────────────    │
│             │  CREDIT +5,000 OSANV  Staking reward  14:23   │
│             │  DEBIT  -200 OSANV    Platform fee    11:01   │
└─────────────┴────────────────────────────────────────────────┘
```

Desktop Sidebar Specs:
- Background: #1a3d1f (dark forest green)
- Active item: #3a8042 left border (4px) + lighter bg
- Text: white (active) / rgba(255,255,255,0.65) (inactive)
- Bottom: wallet status chip, network indicator, OSANV price live

Desktop Grid:
- Stats row: 3 columns, gap 20px
- Property cards: 2 cols (1024px), 3 cols (1440px+)
- Content max-width: 1280px centered

---

## 🧩 Component Inventory

1. WalletConnectButton — Disconnected (green outline) / Connected (address + balance)
2. PortfolioCard — Total NGN, USD equivalent, daily % change, arc gauge
3. OSANVBalanceCard — OSANV amount, USD value, staking tier badge
4. PropertyCard — Name, location, emoji icon, funded %, raised/target, status badge
5. StakingTierCard — Tier name, min OSANV, APY, benefits, CTA
6. LedgerRow — CREDIT (green border) / DEBIT (red border), amount, reason, timestamp
7. BottomNavBar — Mobile only, 4 tabs, height 64px + safe area
8. Sidebar — Desktop only, collapsible, wallet status at bottom

---

## 🔌 API Endpoints

| Component       | Endpoint                    | Auth     |
|-----------------|-----------------------------|----------|
| Portfolio       | GET /api/dashboard          | Required |
| OSANV balance   | GET /api/tokens             | Required |
| Properties list | GET /api/properties         | Public   |
| Property detail | GET /api/properties/:id     | Public   |
| Staking info    | GET /api/tokens/staking     | Required |
| Ledger history  | GET /api/dashboard/ledger   | Required |
| Lending         | GET /api/lend               | Required |
| Milestones      | GET /api/milestones         | Public   |

Auth: Solana wallet signature (wallet address = user identity)
Base URL dev:  http://localhost:3000
Base URL prod: https://api.osanvault.africa

---

## 📐 Responsive Breakpoints

sm: 640px   — Large mobile
md: 768px   — Tablet, partial sidebar
lg: 1024px  — Desktop, full sidebar, multi-column
xl: 1280px  — Wide desktop
2xl: 1536px — Ultra-wide

---

## ✅ Design Principles

1. African luxury fintech — Premium, not generic crypto. Cowrywise + Binance + African warmth.
2. Trust signals everywhere — SEC ARIP badge, compliance references, audit mentions.
3. Green = wealth, growth, Africa — Intentional cultural palette.
4. Mobile first, desktop enhanced — Most African investors use mobile.
5. OSANV prominence — Token holding, tier, rewards always visible.
6. No clutter — Clean cards, generous whitespace, one primary CTA per screen.
7. Progress bars — Every SPV shows funding progress (drives trust + FOMO).
8. Wallet-first identity — No email/password. Phantom/Backpack = identity layer.

---

## 🚫 Design Anti-Patterns (Never Do)

- NEVER show "NET Token", "NigeriaEstate Token", "ELT", "OLT", "MLT" — all deprecated
- NEVER use red as primary color — signals loss/danger
- NEVER use white text on light green — fails WCAG contrast
- NEVER show wallet private key or seed phrase anywhere
- NEVER use generic dark-mode-only neon crypto UI
- NEVER show unconfirmed transaction data as confirmed
- NEVER skip loading/skeleton states — API calls have latency

---

This document is the single source of truth for all UI/UX decisions on the Osanvault Africa platform.
Any AI working on apps/web/ MUST load this file before writing any frontend code.
