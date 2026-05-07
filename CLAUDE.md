CLAUDE.md — Òsánvault Africa Project Context
This file is the persistent system context for all AI-assisted development on the Òsánvault Africa platform.
Place this file at the root of the monorepo. Claude Code will automatically load it on every session.
Last updated: April 2026
1. PROJECT OVERVIEW
Òsánvault Africa is a compliance-first, blockchain-based real estate tokenization and investment platform targeting pan-African markets — Nigeria, Ghana, Kenya, and South Africa — built primarily on Solana.
Mission: Enable fractional real estate investment from $10 equivalent, with on-chain dividend distribution and compliance-first architecture that respects African regulatory environments.
Core Differentiators:
Fractional investment entry from $10 equivalent
On-chain dividend distribution
Compliance-first architecture (Nigeria SEC ARIP Sandbox pathway)
African cultural identity embedded in UX and brand
Community wealth retention model
2. FOUNDER & LEADERSHIP
Founder & CEO: Olugbenga Ajayi
Background: Nigerian Navy (11 years of service), Advanced Diploma in Security & Safety Management
Focus: Community development + blockchain entrepreneurship
Jurisdiction: Nigeria (primary), pan-African expansion
3. OFFICIAL TOKEN
Attribute
Value
Token Name
OSANV
Blockchain
Solana (SPL Token)
Total Supply
500,000,000 (500M)
Status
✅ ACTIVE — sole official token
⚠️ CRITICAL: The NigeriaEstate Token (NET) is fully deprecated and retired.
Never reference NET in any contract, document, pitch deck, config, or code comment.
All references must use OSANV exclusively.
OSANV Six-Tranche Allocation
Tranche
Purpose
1
Public Sale
2
Ecosystem & Rewards
3
Team & Advisors
4
Treasury & Reserve
5
Strategic Partners
6
Liquidity
4. TECH STACK
Frontend
Framework: React + Vite + TypeScript
Styling: Dark African fintech aesthetic
Wallet Integration: Phantom, Backpack (Solana-native)
Monorepo: pnpm + Turborepo
Smart Contracts (9 total)
Solana-native: Rust + Anchor framework (primary)
EVM-compatible layer: Solidity + Vyper (hybrid split)
Use Anchor/Rust by default unless EVM is explicitly required
Security Architecture
Gnosis Safe 3-of-5 multisig treasury
ERC-1400 property security tokens
EMV cryptogram compliance protocol (TC/ARQC/AAC decision tree)
RBAC (Role-Based Access Control) across all contracts
Oracle strategy: Pyth Network (primary) + Switchboard (fallback)
Liquidation engine for ÒsánVault Lend vertical
Backend
Runtime: Node.js / TypeScript
Database: PostgreSQL + Redis
Containerization: Docker Compose (local dev) → Kubernetes-ready configs (production)
All services requiring containers must use Docker Compose locally
Tooling & Integrations
MCP Servers: GitHub MCP, Brave Search MCP
Local AI: Ollama
Pitch Deck System: pptxgenjs (living deck generator)
IDE Extension: Claude Code (terminal), Cursor (frontend)
5. PLATFORM VERTICALS (6)
#
Vertical
Description
1
Tokenized Real Estate
Core product — fractional property ownership on-chain
2
ÒsánVault Lend
DeFi lending with collateral monitoring + liquidation engine
3
REITs
On-chain real estate investment trusts
4
ÒsánVault Minerals
Tokenized mineral and natural resource assets
5
ÒsánCarbon
Carbon credit tokenization and trading
6
LandBank
Land banking and acquisition pooling
6. AUTOIVEST BOT SUITE (4 Bots)
Bot
Function
LP Manager
Automated liquidity pool management
DCA Bot
Dollar-cost averaging execution
Dividend DRIP
Automatic dividend reinvestment
Portfolio Rebalancer
On-chain portfolio rebalancing
7. REVENUE MODEL
Stream
Rate
Platform fees
1.5%
AUM fees
0.5%
Secondary market fees
0.3%
Property onboarding fees
Fixed per listing
8. KNOWN SECURITY GAPS (Must Be Resolved)
These 4 critical gaps were identified in the security audit. All new work must not worsen these, and all PRs should move toward resolving them:
Absent RBAC architecture → Implement role-based access control across all smart contracts
No oracle strategy → Integrate Pyth Network (primary) + Switchboard (fallback)
No liquidation engine → Build collateral monitoring + liquidation trigger for ÒsánVault Lend
Exposed VPS IP → Implement reverse proxy, firewall rules, fail2ban
9. REGULATORY STRATEGY
Primary pathway: Nigeria SEC ARIP Sandbox
Compliance Element
Status/Target
SCUML Registration
Required
DAOP Classification
Digital Asset Offering Platform
Fidelity Bond Compliance
Required
Phased Regulatory Engagement
Pre-sandbox → Sandbox entry → Post-sandbox
All code, architecture decisions, and data handling must be written with compliance-first principles. Regulatory narrative must be defensible to Nigerian SEC examiners.
10. INVESTOR & GROWTH STRATEGY
Grant Targets
Superteam Nigeria
Gitcoin
African Development Bank (AfDB)
Pre-Seed Targets
Ventures Platform
Future Africa
Colosseum
Outlier Ventures
Binance Labs
Token Launch
Jupiter LFG
Streamflow IDO
Key Conference
Korea Blockchain Week 2026 (KBW 2026)
Seoul, South Korea
September 29 – October 1, 2026
Target: Investor engagement + platform visibility
11. AI WORKFLOW (Asymmetric)
This project uses a structured multi-AI workflow. Do not deviate from this assignment of responsibilities.
AI
Responsibilities
Claude
Architecture decisions, security reviews, regulatory narrative, continuity, validation
Gemini
Contract scaffolding, bot implementation, DevOps configs, frontend boilerplate
Claude
Validates ALL Gemini output before merge
Claude is the source of truth for architectural decisions. Gemini output is treated as a draft that requires Claude review and sign-off.
12. MONOREPO STRUCTURE
osanvault-africa/
├── CLAUDE.md
├── apps/
│   ├── web/                   # React + Vite + TypeScript frontend
│   └── api/                   # Node.js / TypeScript backend
├── programs/                  # Anchor/Rust smart contracts (Solana)
│   ├── tokenized-real-estate/
│   ├── osanvault-lend/
│   ├── reits/
│   ├── minerals/
│   ├── carbon/
│   └── landbank/
├── contracts/                 # Solidity + Vyper (EVM layer)
├── bots/
│   ├── lp-manager/
│   ├── dca-bot/
│   ├── dividend-drip/
│   └── portfolio-rebalancer/
├── infra/
│   ├── docker-compose.yml
│   └── k8s/
├── decks/                     # pptxgenjs pitch deck system
└── packages/                  # Shared libraries
13. CODING STANDARDS & RULES
Default to Solana/Anchor — use Solidity/Vyper only when EVM is explicitly required
All containerized services must have a docker-compose.yml (local) and Kubernetes manifests (prod)
Never introduce NET or any reference to NigeriaEstate Token — use OSANV exclusively
Write production-grade, security-conscious code — assume regulatory audit is always possible
RBAC must be implemented on every contract that handles user funds or property data
Oracle calls must use Pyth as primary with Switchboard fallback — never use a single oracle source
All PRs must include a brief security consideration note in the PR description
Respect the monorepo structure — do not create files outside the defined directory tree without explicit instruction
Docker Compose first — never assume a service will be run bare-metal in production
Compliance-first — when in doubt, err on the side of auditability and access logging
14. QUICK REFERENCE COMMANDS
pnpm install                   # Install dependencies
pnpm --filter web dev          # Run frontend dev server
cd programs && anchor build    # Build Anchor programs
pnpm test                      # Run all tests
docker-compose up -d           # Docker local stack
node decks/generate.js         # Generate pitch deck
This file is maintained by Olugbenga Ajayi and updated in coordination with Claude (Anthropic).
For questions on architecture decisions, refer to session history or open a discussion in the repo.

---

## SESSION PROGRESS - May 2, 2026

### Completed This Session

#### 1. Smart Contracts (7 total)
- osanvault_core - Platform, property, investment, OSANV mint, RBAC
- osanvault_lend - DeFi lending with liquidation engine (25% threshold)
- reits - Real estate investment trust (5% yield)
- minerals - Tokenized minerals (5% royalty)
- carbon - Carbon credit tokenization
- landbank - Land acquisition pooling (8% appreciation)
- oracle - Pyth + Switchboard price feeds

#### 2. Frontend Updates
- Dashboard connected to API (/api/dashboard/summary, /api/dashboard/properties-overview)
- New PortfolioCard component
- New BottomNavBar for mobile
- Fixed react-router imports

#### 3. Security & Compliance
- RBAC implemented in all contracts
- VPS hardening (fail2ban, UFW)
- 29 internal security tests
- Security audit docs: SECURITY-AUDIT.md, AUDIT-CHECKLIST.md, BUG-BOUNTY.md

#### 4. Email System
- Support contact API (/api/support)
- Contact form with auto-reply
- Issue reporting endpoint
- Support: Olugbenga1000@gmail.com, +2347065056103

#### 5. Communications Sent
- 4 Security audit requests (Certik, Hacken, OtterSec, Halborn) - use website forms
- 3 Grant applications (Superteam Nigeria via hello@superteam.fun, Gitcoin via support@gitcoin.co)
- Email fixes: grants@gitcoin.co failed, corrected to support@gitcoin.co

### Contact Information (Updated)
- Support Email: Olugbenga1000@gmail.com
- Support Phone: +2347065056103
- Website: osanvaultafrica.com

### GitHub Commits This Session
- 5bcd097 - ADD: Token deployment scripts
- 4f5df27 - FEATURE: 6 new Anchor contracts + Oracle
- 95b0709 - FEATURE: RBAC, OSANV token mint
- b6fc043 - FEATURE: Email system + Support contact
- 66a54b8 - DOCS: Security audit prep docs
- 4ae4994 - DOCS: Email drafts saved
- 29fa460 - DOCS: Session progress for continuation
- 31d19d8 - DOCS: Follow-up instructions - use website forms not email
- 02d08b3 - FIX: Correct email addresses (support@gitcoin.co, hello@superteam.fun)
- a7c3d91 - DOCS: Reply to Certik + Gitcoin email responses

### Session Progress - May 7, 2026

#### Email Responses Received & Replied

**1. CertiK (Security Audit)**
- Response: Danni Liu + Jason Jiang asked for repo access
- Action: Sent GitHub link + full scope (7 contracts) + offered CertiK4Audit collaborator access
- Message ID: 5275a350-fe70-6c55-8c9e-5a107c8ebb0d@gmail.com

**2. Gitcoin (Grant)**
- Response: Ivan from Gitcoin - GG25 expected Q2 2026, visit gov.gitcoin.co
- Action: Sent reply expressing interest, highlighted traction (7 contracts, 29 tests, CertiK audit)
- Message ID: d5c9b167-45ab-dfdf-f075-22c321ab1955@gmail.com

#### Grant Status Update
| Program | Status | Next Action |
|---------|--------|-------------|
| CertiK | Active - awaiting quote | Await response, add collaborator if needed |
| Gitcoin | GG25 Q2 2026 | Monitor gov.gitcoin.co, prepare full application |
| Superteam Nigeria | Pending | Await response |
| Future Africa | Pending | Await response |
| Hacken/OtterSec/Halborn | Pending | Await responses |

#### Next Steps (When Continuing)
1. Await CertiK quote response
2. Await Superteam Nigeria response
3. Await Future Africa response
4. Monitor Gitcoin gov.gitcoin.co for GG25 details
5. Deploy OSANV token (needs ~2 SOL)
6. Legal registrations (SCUML, DAOP)
7. KBW 2026 preparation (September Seoul)

#### Key Files Reference
- Token deployment: scripts/setup-solana.sh, scripts/setup-solana.bat
- Email scripts: scripts/send-email.ts, scripts/send-grant-application.ts
- API routes: apps/api/src/routes/support.ts
- Security docs: docs/SECURITY-AUDIT.md, docs/AUDIT-CHECKLIST.md, docs/BUG-BOUNTY.md
- Email drafts: email-drafts/
- Reply drafts: email-drafts/REPLY-*.md
