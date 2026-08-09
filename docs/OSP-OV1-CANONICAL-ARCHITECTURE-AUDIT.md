# OSP-OV1 — ÒsánVault Africa Canonical Architecture Audit

**Repository:** `Darkhearted007/osanvault-africa`
**Baseline:** `main` at audit start
**Scope:** ÒsánVault Africa only
**Purpose:** establish the canonical architecture before any integration with other ÒsánVault repositories.

## 1. Executive finding

The repository already contains the correct foundation for the ÒsánVault product and should **not** be replaced with the architecture previously prepared in `osanvault-backup`.

The current repository is a pnpm TypeScript workspace containing:

- `artifacts/api-server` — Express 5 API
- `artifacts/osanvault` — React/Vite web application
- `artifacts/osanvault-mobile` — Expo/React Native mobile application
- `artifacts/mockup-sandbox` — isolated design/component sandbox
- `lib/db` — Drizzle/PostgreSQL data layer
- `lib/api-spec` — OpenAPI 3.1 contract
- `lib/api-zod` — generated Zod validation layer
- `lib/api-client-react` — generated React Query client
- `scripts` — operational tooling

The workspace is already governed by pnpm workspaces and a shared dependency catalog. A package minimum-release-age policy is also present as a supply-chain defense.

## 2. Canonical runtime architecture

```text
                         ÒSÁNVAULT AFRICA
                                |
               +----------------+----------------+
               |                |                |
               v                v                v
             WEB             MOBILE             API
          React/Vite        Expo/RN          Express 5
               |                |                |
               +----------------+----------------+
                                |
                         OpenAPI contract
                                |
                  +-------------+-------------+
                  |                           |
                  v                           v
          Generated clients              Zod schemas
                  |                           |
                  +-------------+-------------+
                                |
                                v
                         Drizzle ORM
                                |
                                v
                           PostgreSQL
```

The API is mounted below `/api` and routes currently include health, properties, carbon, governance, activity, platform statistics, whitelist, leads and device push tokens.

## 3. Current domain surface

### Existing database domain modules

The canonical database schema currently exports:

- properties
- carbon projects
- governance proposals
- activity events
- whitelist
- leads
- device push tokens

This is a usable foundation, but it is not yet a complete institutional asset platform model.

### Existing API domain surface

The API currently exposes read and operational endpoints for:

- properties
- property funding updates
- carbon projects
- governance proposals
- activity
- platform statistics
- investor whitelist
- leads
- device push tokens
- health

## 4. API contract finding

`lib/api-spec/openapi.yaml` is intended to be the source of truth and currently describes the core public read API.

There is contract drift that must be resolved before declaring API certification complete: the Express implementation contains additional operational endpoints (for example property funding and whitelist mutations) that are not represented comprehensively in the current OpenAPI document.

**Rule:** do not hand-edit generated clients to compensate for this. The OpenAPI contract must be brought into alignment, then code generation must be run.

## 5. Security findings

The API already applies useful baseline security headers and structured request logging.

However, the audit found a critical architectural gap: the current API middleware does not establish authentication or authorization before mounting all routes. This is especially important because whitelist endpoints include create, update and delete operations.

This does **not** mean authentication should be rewritten immediately. It means authentication/authorization must become a mandatory certification gate before any production financial, investor, KYC/AML or administrative workflows are exposed.

## 6. Data integrity findings

The current property API directly reads and writes the Drizzle model, which is appropriate for the existing architecture.

The property funding mutation currently updates `raised` directly and emits a push notification when the target is crossed. Before production investment workflows are enabled, this must be extended into an auditable financial transaction model rather than treating a funding total as the financial ledger itself.

## 7. Web3 finding

The current canonical tree does not establish a production smart-contract source directory at the root. Smart-contract architecture found during audit is located in `.migration-backup` material and therefore must be treated as historical/reference material until independently certified.

Do **not** migrate those contracts into the current production tree merely because they are documented in the backup.

The blockchain layer should be certified as a separate workstream after the off-chain asset, verification, compliance and financial models are stable.

## 8. Migration-backup finding

`.migration-backup` contains substantial prior application, API, contract and documentation material. It is valuable as a recovery/reference source but must not be treated as the active architecture.

Future work should explicitly label any reused component as:

- canonical/current
- reusable/reference
- obsolete/superseded
- requires security review

## 9. Target ÒsánVault domain model

Before integrating any other product repositories, the canonical ÒsánVault model should converge toward:

```text
Identity
  |
  +-- Organization
  +-- Individual / Investor
  +-- Roles / Permissions

Asset
  |
  +-- Property
  +-- Land / Title
  +-- Verification evidence
  +-- Legal documents

Investment
  |
  +-- Offering
  +-- Subscription
  +-- Investment
  +-- Ownership / allocation

Financial
  |
  +-- Orders / payments
  +-- Ledger entries
  +-- Settlement
  +-- Treasury

Tokenization
  |
  +-- Asset token definition
  +-- Blockchain record
  +-- Token allocation
  +-- On-chain transaction

Trust
  |
  +-- KYC/AML status
  +-- Property verification
  +-- Audit events
  +-- Compliance decisions

Impact / Governance
  |
  +-- Carbon projects
  +-- Governance proposals
  +-- Voting
```

This is a target domain model, not a request to replace the existing schema in one migration.

## 10. Certification status

| Area | Status | Finding |
|---|---|---|
| Repository identity | PASS | Correct canonical repository identified |
| Workspace | PASS | pnpm TypeScript workspace exists |
| Web application | PASS | React/Vite application exists |
| Mobile application | PASS | Expo application exists |
| API | PASS | Express 5 API exists |
| Database layer | PASS | Drizzle/PostgreSQL package exists |
| API contract | PARTIAL | OpenAPI exists but does not cover all implemented routes |
| Generated clients | PASS | React client/Zod generation architecture exists |
| Security headers/logging | PASS | Baseline middleware exists |
| Authentication | BLOCKED | No route-level auth boundary identified in current API middleware |
| Authorization | BLOCKED | Administrative mutations require explicit policy enforcement |
| Financial ledger | NOT READY | Funding total is not sufficient as institutional ledger |
| KYC/AML workflow | PARTIAL | Whitelist model exists; complete compliance workflow not certified |
| Smart contracts | NOT CERTIFIED | Current contracts require independent certification; backup is reference only |
| Production readiness | NOT CERTIFIED | Security, financial controls and contract certification remain |

## 11. Recommended implementation order

### OV1.1 — Contract alignment

Bring OpenAPI into exact alignment with the implemented API and regenerate clients.

### OV1.2 — Security boundary

Introduce a compatibility-preserving authentication/authorization boundary before protected mutations. Do not change existing authentication behavior without first documenting the current behavior and migration path.

### OV1.3 — Domain completion

Extend the existing Drizzle model incrementally for identity, verification, documents, offerings, investments, ownership and financial ledger concepts.

### OV1.4 — Audit/event integrity

Formalize immutable audit events and domain events for high-value state changes.

### OV1.5 — Financial integrity

Separate display/funding aggregates from the canonical transaction ledger. Introduce idempotency and reconciliation before real-money investment operations.

### OV1.6 — Verification lifecycle

Define property registration → evidence → verification → approval → offering eligibility.

### OV1.7 — Tokenization boundary

Define an explicit off-chain asset state machine and blockchain adapter boundary before adding or reviving contracts.

### OV1.8 — Production certification

Run full typecheck, build, API tests, database migration tests, security tests and deployment verification.

### OV1.9 — Only then integrate external ÒsánVault repositories

After ÒsánVault itself is certified, selectively extract reusable capabilities from `Osanvault-Verify`, `osanv-treasury-agent`, `agency-agents`, `infrastructure-stack`, `quicktask` and other repositories.

## 12. Non-negotiable architecture rules

1. `osanvault-africa` is the canonical ÒsánVault source repository.
2. `osanvault-backup` is reference/legacy only.
3. No parallel database architecture.
4. No second API architecture.
5. OpenAPI remains the API contract source of truth.
6. Generated clients are never hand-edited.
7. Financial state is never represented solely by a mutable aggregate field.
8. Blockchain state is not treated as authoritative until the asset/compliance lifecycle is certified.
9. Administrative and financial mutations require explicit authorization.
10. No integration with other products until OSP-OV1 is certified.

## 13. Audit conclusion

The correct strategy is **evolution, not reconstruction**.

ÒsánVault already has a coherent technical spine. The next work should harden the boundaries between API contract, security, domain data, financial state, verification and blockchain rather than moving the project into a new monorepo shape.
