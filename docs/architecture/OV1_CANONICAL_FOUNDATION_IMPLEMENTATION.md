# ÒsánVault Africa — OV1 Canonical Foundation Implementation

**Status:** Execution baseline
**Branch:** `feat/canonical-foundation-v1`
**Principle:** implement the canonical enterprise architecture additively and preserve the working prototype until controlled migration is certified.

## Objectives

1. Preserve the current prototype application and schema.
2. Establish the canonical PostgreSQL/Drizzle domain model as the source of truth for new business capabilities.
3. Introduce provider-neutral identity and authorization primitives without assuming a wallet is an identity.
4. Create a controlled legacy compatibility/mapping layer.
5. Migrate the application progressively: Asset Registry → Evidence → Verification → Asset Passport → Projects → Valuation/Risk → Capital.
6. Keep blockchain/tokenization as optional adapters rather than canonical dependencies.

## Non-negotiable migration rules

- No destructive changes to existing prototype tables in OV1.
- No production data backfill until staging migration and regression checks pass.
- No route is switched to canonical data until its read/write path has a compatibility test.
- Legacy records receive a deterministic mapping record; no silent data mutation.
- Public asset identifiers are stable and separate from database primary keys.
- Legal ownership is represented as rights/relationships, not a mutable owner field.
- Evidence and verification remain separate domains.
- Financial commitments, subscriptions, settlements, ledger entries and positions remain separate concepts.
- Token/blockchain references remain external adapters.

## OV1 gates

### OV1.1 — Canonical schema

Validate the architecture baseline in `docs/architecture/CANONICAL_SCHEMA_V1.md` and implement it through additive Drizzle schema/migrations.

### OV1.2 — Identity foundation

Validate provider-neutral principals, identities, organizations, memberships, roles, permissions and sessions. Do not select an authentication vendor in the domain schema.

### OV1.3 — Legacy compatibility

Create explicit mappings from existing prototype entities (`properties`, leads, whitelist and other relevant records) into canonical entities. Preserve original IDs and source metadata.

### OV1.4 — Asset Registry API

Introduce canonical asset reads/writes behind new routes without removing existing `/api/properties` behavior.

### OV1.5 — Evidence + Verification

Expose document/evidence capture and verification workflows with append-only actions and explicit decisions.

### OV1.6 — Asset Passport

Create a consolidated, read-only asset view combining identity, location, rights, evidence, verification, valuation and risk status.

### OV1.7 — Progressive UI migration

Add canonical Asset Registry/Passport screens while preserving existing property screens. Existing property URLs remain functional during migration.

### OV1.8 — Certification

Before merging or production migration: generate migrations, inspect SQL, run staging PostgreSQL, run workspace typechecks, run API regression tests, verify legacy tables unchanged, and document rollback/recovery.

## First real business loop

The first canonical workflow is:

`Asset capture → evidence → verification → approval → Asset Passport → project opportunity`

This loop is deliberately independent of token issuance, staking, governance tokens or blockchain settlement.

## Success criteria

- Existing prototype continues to build and serve.
- Canonical schema can be migrated additively on disposable/staging PostgreSQL.
- A real asset can be represented without token fields being required.
- Verification decisions can be audited and linked to evidence.
- Existing property records can be mapped without destructive changes.
- Canonical Asset Passport can be served through the API.
- No production database is changed by this branch.
