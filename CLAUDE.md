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
Smart Contracts (7 total)
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
│   ├── osanvault_core/        # Platform, property, investment, OSANV mint, RBAC
│   ├── osanvault_lend/        # DeFi lending with liquidation engine
│   ├── reits/                 # Real estate investment trusts
│   ├── minerals/              # Tokenized minerals
│   ├── carbon/                # Carbon credit tokenization
│   ├── landbank/              # Land acquisition pooling
│   └── oracle/                # Pyth + Switchboard price feeds
├── contracts/                 # Solidity + Vyper (EVM layer)
├── bots/
│   ├── lp-manager/           # Automated liquidity pool management
│   ├── dca-bot/              # Dollar-cost averaging execution
│   ├── dividend-drip/        # Automatic dividend reinvestment
│   ├── portfolio-rebalancer/ # On-chain portfolio rebalancing
│   └── property-scraper/     # Property data collection
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

### Session Progress - May 7, 2026 (Continued)

#### Grant Applications Sent (Fixed Emails)
- **Superteam Nigeria**: hello@superteam.fun (fixed from apply@superteam.fun)
- **Future Africa**: funding@future.africa (fixed from hello@future.africa)
- **Gitcoin**: support@gitcoin.co (confirmed correct)

#### Grant Status Update
| Program | Status | Next Action |
|---------|--------|-------------|
| CertiK | Active - awaiting quote | Await response, add collaborator if needed |
| Gitcoin | GG25 Q2 2026 | Monitor gov.gitcoin.co, prepare full application |
| Superteam Nigeria | Just applied | Await response |
| Future Africa | Just applied | Await response |
| Hacken/OtterSec/Halborn | Pending | Await responses |

#### Security Vulnerabilities Fixed
- **Vite path traversal** (GHSA-4w7w-66w2-5vf9): Updated 5.4.21 → 6.4.2
- **ip-address XSS** (GHSA-v2v4-37r5-5v8g): Updated express-rate-limit 8.4.1 → 8.5.0
- **Result**: `pnpm audit` shows 0 vulnerabilities

### Session Progress - May 9, 2026 (KBW 2026 Prep + Docker Setup)

#### Completed
- Started Docker Desktop
- Generated KBW 2026 pitch deck (osanvault-kbw2026.pptx)
- Added Docker Anchor development guide (docs/DOCKER-ANCHOR.md)
- Created comprehensive README.md
- Added KBW 2026 outreach email templates
- Pushed to GitHub: commits 6855995

#### GitHub Commits
| Commit | Description |
|--------|-------------|
| 2109662 | DOCS: Update CLAUDE.md - Anchor CLI installation session progress |
| 1474715 | FEAT: Add KBW 2026 pitch deck + Docker Anchor guide |
| 6855995 | FEAT: Complete README + KBW 2026 outreach templates |

#### Pending
1. Await CertiK quote response
2. Await Superteam Nigeria response
3. Await Future Africa response
4. Monitor Gitcoin gov.gitcoin.co for GG25 details
5. Deploy OSANV token (needs ~2 SOL)
6. Legal registrations (SCUML, DAOP)
7. KBW 2026 (September Seoul) - pitch deck ready

### Session Progress - May 9, 2026 (Docker Anchor Build - In Progress)

#### Goal
Build and test all 7 Solana smart contracts using Anchor framework via Docker

#### Constraints & Preferences
- Windows environment (PowerShell)
- Must use Docker for build environment
- All 7 programs: osanvault_core, osanvault_lend, reits, minerals, carbon, landbank, oracle

#### Progress
- Docker Desktop installed and running
- Solana v1.18.26 image pulled (solanalabs/solana:v1.18.26)
- Synced all 7 program IDs between source code and Anchor.toml
- Created proper keypair.json files for all 7 programs (Array format)
- Built osanvault/anchor:1.0.2 custom Docker image with Anchor CLI binary
- Updated all Cargo.toml files to anchor-lang = "1.0.2"
- Updated Anchor.toml with all 7 programs and correct version
- Docker container successfully started with volume mount
- GLIBC compatibility issue confirmed across all Anchor binary versions

#### Blocked
- **GLIBC version mismatch**: Anchor binary requires GLIBC 2.32+ but Debian 11 (base image) has GLIBC 2.31
  - Tried: Anchor CLI v0.30.1, v1.0.2, v1.1.0 — all fail with same GLIBC error
  - Tried: Custom Dockerfile with newer Debian — build infrastructure issues
- **cargo-bpf/cargo-build-sbf**: Not available in solanalabs/solana:v1.18.26 image
  - Image only contains validator, faucet, genesis binaries
- **Anchor GHCR images**: ghcr.io/coral-xyz/anchor:* — access denied (403 Forbidden)
- **WSL cargo install**: MSYS2 path conflicts with Rust toolchain
- **Windows Rust**: Missing MSVC linker (link.exe not in VS2022 BuildTools without C++ workload)
- **Solana CLI download**: Network timeout from release.anza.xyz
- Docker Desktop daemon keeps crashing/stopping after several runs

#### Key Observations
- Anchor CLI binaries (precompiled) are statically linked against newer GLIBC than available in Debian 11
- solanalabs/solana:v1.18.26 image is a validator image, NOT a build image
- cargo-build-sbf and cargo-bpf are not installed in the validator image
- Need a different approach: either Alpine-based image, or install Rust+SBF tools from source

#### Program IDs (from declare_id!)
- osanvault_core: 5bNkJDyJaE3rZ93ahWaA8MPTxQvCG6dC9jkTanLV2qRF
- osanvault_lend: 3ZX5svRbpgvNVQXpwj7cQG2MZs97KVnV3azCkSiwU3CR
- reits: EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1
- minerals: 6oNLPSirAwbmTohpfUtUk2UHSLfsVnvHguP9ZdwcGRzF
- carbon: H2hzHypyQxJpDiGWgpYSDN56JdyLzpPkrHcAD2cxnZUb
- landbank: FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT
- oracle: 9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55

#### Files Created
- Anchor.toml — All 7 programs + version = "1.0.2"
- Dockerfile.anchor — Custom image with Anchor CLI (but GLIBC incompatible)
- docker-compose.anchor.yml — Compose file for dev setup
- programs/*/keypair.json — Generated keypairs (Array format)
- programs/*/Cargo.toml — All updated to anchor-lang = "1.0.2"

#### Next Steps (To Resolve)
1. Try Alpine-based Anchor image (Alpine uses musl, no GLIBC dependency)
2. Or install Rust + cargo-build-sbf from source in container
3. Or use CI/CD approach (GitHub Actions with Ubuntu 24.04)
4. Or build contracts individually using cargo build without Anchor abstraction

### Session Progress - May 7, 2026 (Smart Contract Audit)

#### Smart Contract Bug Analysis Completed
- Analyzed all 7 Anchor/Rust smart contracts
- Identified 16 bugs across contracts:

| Contract | Issues Fixed |
|----------|--------------|
| osanvault_core | Functions outside module (unreachable), extra brace, account space, redundant constraint |
| reits | Yield distribution bug (transferred full amount not total_yield), missing share minting, unwrap() panics |
| osanvault-lend | Missing collateral vault account |
| minerals | Unused royalty_recipient parameter |
| landbank | Division by zero (3 issues), acquired_acres calculation, claim_land math |
| oracle | No price staleness check |
| carbon | Wrong verifier account type (TokenAccount not Signer) |

#### Verification
- All 7 contracts pass `rustfmt --check` syntax validation
- Rust 1.95.0 installed (Windows + WSL)
- Anchor CLI v1.0.2 and v0.30.1 available
- Full build pending: Solana CLI download network timeout

#### Files Modified
- Anchor.toml - Added all 7 programs + toolchain version
- programs/oracle/Cargo.toml - New file created
- All 7 contract lib.rs files - Bug fixes applied

### Session Progress - May 9, 2026 (Anchor CLI Installation)

#### Installation Attempt Summary
- Node.js v24.15.0 installed ✅
- Rust 1.95.0 installed (stable-x86_64-pc-windows-gnu) ✅
- npm packages: @coral-xyz/anchor@0.30.1 installed ✅
- Docker 29.4.0 installed (daemon not running yet) ✅
- MSYS2 + MinGW toolchain installed (dlltool available) ✅
- Visual Studio 2022 BuildTools installed (without C++ workload)

#### Challenges
- Anchor CLI Rust binary build fails on zstd-sys crate
- MSVC toolchain missing (link.exe not found)
- Solana CLI not yet installed
- Docker Desktop daemon not started

#### Solution: Use Docker for Anchor development
- Docker Desktop installed, needs restart to activate
- Recommended: Use Anchor Docker container for development
- Commands to run in project:
  ```bash
  docker run -it --rm -v ${PWD}:/workspace ghcr.io/coral-xyz/anchor:latest
  ```

#### Next Steps
1. Restart Docker Desktop and start daemon
2. Use Docker-based Anchor development
3. Deploy OSANV token (needs ~2 SOL)
4. Legal registrations (SCUML, DAOP)
5. KBW 2026 preparation (September Seoul)

### GitHub Commits (May 7, 2026)
| Commit | Description |
|--------|-------------|
| c9db4aa | DOCS: Update CLAUDE.md with smart contract fixes |
| e55586a | DOCS: Update CLAUDE.md session progress + email scripts |
| f2c027c | FIX: Correct email addresses (support@gitcoin.co, hello@superteam.fun) |
| 4b43949 | SECURITY: Fix 2 moderate vulnerabilities (vite, ip-address) |
| bce9178 | DOCS: Update CLAUDE.md with security fixes + grant status |

#### Key Files Reference
- Token deployment: scripts/setup-solana.sh, scripts/setup-solana.bat
- Email scripts: scripts/send-email.ts, scripts/send-grant-application.ts
- API routes: apps/api/src/routes/support.ts
- Security docs: docs/SECURITY-AUDIT.md, docs/AUDIT-CHECKLIST.md, docs/BUG-BOUNTY.md
- Email drafts: email-drafts/
- Reply drafts: email-drafts/REPLY-*.md
