# ÒsánVault Africa — Canonical Migration Review Gate

**Status:** Pre-migration review gate
**Scope:** Canonical PostgreSQL/Drizzle foundation
**Related:** PR #45 — canonical schema v1; PR #46 — CI validation

## Objective

Provide a mandatory review gate between canonical schema design and any database migration. The existing prototype schema and data remain authoritative until each migration phase is explicitly approved.

## Safety rules

1. Never run `drizzle-kit push --force` for canonical migrations.
2. Do not drop, rename, or rewrite existing prototype tables in Phase 1.
3. Do not alter `properties`, `carbon_projects`, `governance_proposals`, `activity_events`, `whitelist`, `leads`, or `device_push_tokens` as part of the first canonical migration.
4. Canonical tables are additive until a separate, approved legacy migration phase.
5. Every canonical migration must be reversible at the operational level, with a documented rollback procedure.
6. Production application traffic must not depend on a canonical table until the corresponding migration and integrity tests pass.
7. No UTLAM-specific schema or integration is permitted in the canonical core.
8. Blockchain/token references remain external identifiers/adapters.

## Phase 1 migration scope

### Platform

- jurisdictions
- tenants
- organizations
- persons
- legal_entities
- parties
- users

### Authorization

- roles
- permissions
- user_roles

### Asset Registry

- asset_types
- assets
- asset_identifiers
- asset_locations
- asset_relationships

### Asset Passport

- asset_passports

## Dependency ordering

```text
jurisdictions
    ↓
tenants / legal_entities / organizations / persons
    ↓
parties / users
    ↓
roles / permissions / user_roles
    ↓
asset_types
    ↓
assets
    ↓
asset_identifiers / asset_locations / asset_relationships
    ↓
asset_passports
```

## Pre-merge checks

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm --filter @workspace/db generate`
- [ ] `pnpm typecheck`
- [ ] Generated SQL reviewed by a human
- [ ] No destructive statements detected
- [ ] Foreign-key dependency order verified
- [ ] Unique constraints reviewed
- [ ] Indexes reviewed
- [ ] Tenant isolation columns reviewed
- [ ] Timestamp/effective-period fields reviewed
- [ ] Existing schema diff reviewed

## Isolated database checks

Apply the generated migration only to an isolated PostgreSQL database first.

Required checks:

1. Migration completes from an empty database.
2. Migration completes against a representative copy of the current prototype schema.
3. Existing prototype tables remain intact.
4. Existing prototype row counts are unchanged.
5. Canonical foreign keys are valid.
6. Canonical unique constraints reject duplicate business identifiers.
7. Transaction rollback works for a deliberately failed migration transaction where supported.
8. Application startup can load both legacy and canonical schema exports.
9. No production credentials are required by the migration test.

## Data migration policy

The first canonical migration creates structure only. It does not automatically convert legacy properties.

Legacy conversion begins only after:

```text
Schema migration approved
        ↓
Canonical seed/reference data approved
        ↓
Legacy mapping specification approved
        ↓
Dry-run conversion
        ↓
Reconciliation report
        ↓
Human approval
        ↓
Controlled production conversion
```

## Legacy mapping requirements

Every migrated legacy record must have a traceable mapping through the canonical legacy map:

- legacy entity type
- legacy identifier
- canonical entity type
- canonical identifier
- migration version
- migrated timestamp
- migration status
- reconciliation result

No legacy record may silently disappear.

## Production approval rule

A canonical migration is **not production-ready** merely because Drizzle generates SQL successfully.

Production approval requires:

```text
Schema compile
+ generated SQL review
+ isolated migration
+ integrity tests
+ legacy preservation test
+ rollback evidence
+ architecture approval
```

Only then may the migration be promoted.
