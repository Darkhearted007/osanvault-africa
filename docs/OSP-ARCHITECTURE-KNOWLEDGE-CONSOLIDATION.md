# OSP Architecture Knowledge Consolidation

## Purpose

Consolidate reusable architectural decisions developed during earlier ÒsánVault work into the canonical `osanvault-africa` repository without importing competing application architecture.

The canonical repository remains authoritative for implementation. Earlier repositories and backup documents are reference material only.

## Decision hierarchy

1. Current `osanvault-africa/main` code and database contracts are authoritative for existing behavior.
2. Current OpenAPI/Zod/Express/Drizzle architecture is authoritative for API and persistence implementation.
3. Reusable architectural decisions from earlier ÒsánVault work may be incorporated when they do not contradict the canonical implementation.
4. Backup-specific APIs, database schemas, deployment layouts and migration scripts are not imported.
5. Any conflicting design is resolved by an explicit ADR before implementation.

## Reusable decisions to retain

### Asset-first model

ÒsánVault should treat real-world assets and their legally relevant rights as primary domain objects. Applications such as property, land, carbon and future mineral/resource products should specialize the asset model rather than create unrelated product databases.

### Verification before investment

The intended lifecycle is:

```text
Asset registration
  -> document collection
  -> verification
  -> compliance decision
  -> offering
  -> investment
  -> ownership/entitlement
  -> settlement
```

An asset must not become an investment product merely because it exists in the registry.

### Ownership versus token balance

Legal ownership, contractual entitlement, internal accounting and blockchain balances are separate concepts. They must not be collapsed into one field or table.

### Treasury as a ledger domain

Financial truth should derive from immutable, auditable ledger entries. Wallet balances and token balances may support settlement or reconciliation but are not, by themselves, the enterprise accounting source of truth.

### Auditability

Sensitive state changes should have attributable audit events with actor, action, resource, timestamp and correlation information. Audit history must be append-oriented and protected from ordinary application mutation.

### Country-neutral core

Pan-African functionality belongs in a shared core with country adapters for jurisdiction-specific identity, asset registries, regulatory rules, currencies, payment rails, tax configuration, investment restrictions, localization and data residency.

### Governance and separation of duties

Privileged operations should have explicit authorization boundaries and, where appropriate, maker/checker approval rather than relying on frontend controls.

### AI as a controlled capability

Future AI agents should operate through explicit tools, permissions, audit events and policy boundaries. Agents must not receive unrestricted authority over treasury, ownership, investment approval or privileged administration.

## Decisions deliberately NOT imported

The following remain outside the canonical repository unless separately approved:

- backup-specific `services/api` architecture
- backup-specific PostgreSQL schema
- backup compatibility adapters
- duplicate frontend architecture
- legacy deployment layouts
- unverified smart-contract implementations
- automatic token launch/staking assumptions
- assumptions that OSANV represents ownership of every asset

## Canonical mapping

| Earlier concept | Canonical destination |
|---|---|
| Property / asset model | `lib/db` existing schema + future asset-domain extensions |
| API contracts | `lib/api-spec` + `lib/api-zod` + API server |
| Shared web API access | `lib/api-client-react` |
| Verification lifecycle | canonical API/domain layer; future verification service boundary |
| Investment / ownership | canonical domain and database extensions |
| Treasury / ledger | canonical database and service boundary, after domain design |
| Audit | canonical activity/audit domain with stronger immutable controls where required |
| Country adapters | future country configuration/integration layer |
| Tokenization | optional blockchain adapter |
| OSANV | deferred decision gate |

## Consolidation rule

Before adding a new package, service or database entity, answer:

1. Does the canonical repository already provide this capability?
2. Can the existing capability be extended instead of duplicated?
3. Does the proposed change preserve existing API and database behavior?
4. Is the change country-neutral?
5. Does it introduce a legal, financial, security or custody assumption requiring a separate decision?

If the answer is unclear, create an ADR before implementation.

## Result

Earlier ÒsánVault work is retained as architectural knowledge while `osanvault-africa` remains the single canonical implementation. This prevents architectural drift and avoids rebuilding working foundations merely to match a backup repository.