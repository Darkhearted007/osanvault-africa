# ÒsánVault Africa — Canonical PostgreSQL / Drizzle Schema v1.0

**Status:** Architecture-approved design baseline
**Scope:** Canonical enterprise data foundation. This document does not alter or drop existing prototype tables.

## 1. Objective

Establish a durable relational foundation for the enterprise architecture while preserving the existing prototype schema during migration.

Canonical spine:

`Tenant → Organization/Party → Asset → Rights/Evidence/Verification → Legal/Project → Valuation/Risk → Capital/Treasury → Governance/Institutional Memory`.

The model is independent of any particular blockchain, token, financial partner, cloud provider, or external registry.

## 2. Non-negotiable design rules

1. PostgreSQL is the canonical transactional store for core business state.
2. UUIDs are used for internal primary keys.
3. Public identifiers such as `OSAN-AFR-ASSET-...` are separate from database primary keys.
4. Material business records use `created_at`, `updated_at`, and where applicable `effective_from` / `effective_to`.
5. Historical business events are append-only.
6. Security audit events are separate from business events.
7. Tenant context is explicit for tenant-owned records.
8. Legal ownership is a relationship, never a single mutable `owner_id` on an asset.
9. Evidence and verification are separate concepts.
10. Commitment, subscription, settlement, ledger entry, allocation and position are separate concepts.
11. Token/blockchain references are adapters or external identifiers, not canonical asset identity.
12. No external capital partner is embedded in the core model.
13. Sensitive identity data is isolated from ordinary business records.
14. Existing prototype tables remain during migration and are not dropped by the first canonical migration.

## 3. PostgreSQL conventions

- `uuid` primary keys.
- `timestamptz` for timestamps.
- `numeric` for financial/quantity values requiring precision.
- `jsonb` only for genuinely extensible metadata, snapshots, provider payloads and policy configuration.
- Typed relational columns remain authoritative for core facts.
- Explicit foreign keys and indexes on high-value lookup paths.
- Business uniqueness is represented by explicit unique constraints.

## 4. Platform Core

### `tenants`

- `id uuid pk`
- `code text unique not null`
- `name text not null`
- `tenant_type text not null`
- `jurisdiction_id uuid nullable`
- `status text not null`
- `metadata jsonb`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

### `organizations`

- `id uuid pk`
- `tenant_id uuid nullable fk tenants.id`
- `legal_entity_id uuid nullable`
- `name text not null`
- `organization_type text not null`
- `registration_identifier text nullable`
- `jurisdiction_id uuid nullable`
- `status text not null`
- timestamps

### `persons`

- `id uuid pk`
- `tenant_id uuid nullable`
- `display_name text nullable`
- `status text not null`
- timestamps

Sensitive identity attributes must not be duplicated throughout business tables.

### `parties`

- `id uuid pk`
- `tenant_id uuid nullable`
- `party_type text not null`
- `person_id uuid nullable fk persons.id`
- `organization_id uuid nullable fk organizations.id`
- `legal_entity_id uuid nullable`
- `status text not null`
- timestamps

A party represents the universal participant abstraction. A person, organization or legal entity may play multiple business roles without creating duplicate identity models.

### `users`

- `id uuid pk`
- `party_id uuid fk parties.id`
- `tenant_id uuid nullable fk tenants.id`
- `external_subject_id text nullable`
- `status text not null`
- timestamps

`User` is a digital access identity, not an asset owner by implication.

### `roles`, `permissions`, `user_roles`

`roles`: id, tenant_id, code, name, description, system_role, timestamps.

`permissions`: id, code unique, description.

`user_roles`: user_id, role_id, tenant_id, timestamps; composite primary key `(user_id, role_id)`.

## 5. Jurisdiction

### `jurisdictions`

- `id uuid pk`
- `parent_id uuid nullable fk jurisdictions.id`
- `code text`
- `name text`
- `jurisdiction_type text`
- `country_code text nullable`
- `currency_code text nullable`
- `status text`

This prevents Nigeria-specific assumptions from becoming structural constraints as ÒsánVault expands across Africa.

## 6. Asset Registry

### `asset_types`

- `id uuid pk`
- `parent_id uuid nullable fk asset_types.id`
- `code text unique`
- `name text`
- `asset_class text`
- `description text`
- `active boolean`

### `assets`

- `id uuid pk`
- `tenant_id uuid nullable`
- `asset_identifier text unique not null`
- `asset_type_id uuid fk asset_types.id`
- `name text not null`
- `description text nullable`
- `status text not null`
- `jurisdiction_id uuid nullable`
- `current_state jsonb nullable`
- timestamps

The internal UUID is never exposed as the sole business identity. `asset_identifier` is the durable platform identifier.

### `asset_identifiers`

- `id uuid pk`
- `asset_id uuid fk assets.id`
- `identifier_type text`
- `identifier_value text`
- `issuer text nullable`
- `jurisdiction_id uuid nullable`
- `valid_from timestamptz nullable`
- `valid_to timestamptz nullable`
- `evidence_id uuid nullable`
- timestamps

Unique path: `(identifier_type, identifier_value, issuer)` where applicable.

### `asset_locations`

- `id uuid pk`
- `asset_id uuid fk assets.id`
- `jurisdiction_id uuid nullable`
- `address text nullable`
- `latitude numeric nullable`
- `longitude numeric nullable`
- geospatial geometry when PostGIS is introduced
- `is_primary boolean`
- timestamps

### `asset_relationships`

- `id uuid pk`
- `source_asset_id uuid fk assets.id`
- `target_asset_id uuid fk assets.id`
- `relationship_type text`
- `effective_from timestamptz nullable`
- `effective_to timestamptz nullable`
- `evidence_id uuid nullable`
- timestamps

## 7. Legal and Rights

### `legal_entities`

- `id uuid pk`
- `tenant_id uuid nullable`
- `jurisdiction_id uuid`
- `legal_name text`
- `entity_type text`
- `registration_identifier text nullable`
- `status text`
- `formation_date date nullable`
- timestamps

### `spvs`

- `id uuid pk`
- `legal_entity_id uuid unique fk legal_entities.id`
- `purpose text`
- `status text`
- timestamps

### `asset_rights`

- `id uuid pk`
- `asset_id uuid fk assets.id`
- `holder_party_id uuid fk parties.id`
- `right_type text`
- `interest_percentage numeric nullable`
- `priority integer nullable`
- `effective_from timestamptz`
- `effective_to timestamptz nullable`
- `status text`
- `basis_document_id uuid nullable`
- `created_at timestamptz`

Historical ownership and rights are retained by closing effective intervals and creating new records; they are not overwritten.

### `encumbrances`

- `id uuid pk`
- `asset_id uuid fk assets.id`
- `holder_party_id uuid nullable fk parties.id`
- `encumbrance_type text`
- `amount numeric nullable`
- `currency_code text nullable`
- `effective_from timestamptz`
- `effective_to timestamptz nullable`
- `status text`
- `evidence_id uuid nullable`

## 8. Evidence and Documents

### `documents`

- `id uuid pk`
- `tenant_id uuid nullable`
- `document_type text`
- `title text`
- `classification text`
- `storage_uri text`
- `content_hash text`
- `mime_type text`
- `retention_policy text nullable`
- `legal_hold boolean not null default false`
- `status text`
- timestamps

### `document_versions`

- `id uuid pk`
- `document_id uuid fk documents.id`
- `version_number integer`
- `content_hash text`
- `storage_uri text`
- `created_by uuid nullable fk users.id`
- `created_at timestamptz`

Unique: `(document_id, version_number)`.

### `evidence`

- `id uuid pk`
- `tenant_id uuid nullable`
- `evidence_type text`
- `subject_type text`
- `subject_id uuid`
- `document_id uuid nullable`
- `source_type text`
- `source_reference text nullable`
- `captured_by uuid nullable fk users.id`
- `captured_at timestamptz`
- `confidence_level text`
- `status text`
- timestamps

## 9. Verification

### `verification_cases`

- `id uuid pk`
- `tenant_id uuid nullable`
- `subject_type text`
- `subject_id uuid`
- `verification_type text`
- `requested_by_party_id uuid nullable`
- `assigned_to_party_id uuid nullable`
- `status text`
- `confidence_level text nullable`
- `started_at timestamptz nullable`
- `completed_at timestamptz nullable`
- `expires_at timestamptz nullable`
- timestamps

### `verification_actions`

- `id uuid pk`
- `verification_case_id uuid fk verification_cases.id`
- `action_type text`
- `actor_party_id uuid nullable`
- `evidence_id uuid nullable`
- `finding text nullable`
- `result text nullable`
- `performed_at timestamptz`

### `verification_decisions`

- `id uuid pk`
- `verification_case_id uuid unique fk verification_cases.id`
- `decision text`
- `decision_reason text`
- `decided_by_party_id uuid`
- `decided_at timestamptz`
- `authority_reference text nullable`

## 10. Projects and Operations

### `projects`

- `id uuid pk`
- `tenant_id uuid nullable`
- `project_identifier text unique`
- `name text`
- `project_type text`
- `sponsor_party_id uuid nullable`
- `spv_id uuid nullable fk spvs.id`
- `status text`
- `jurisdiction_id uuid nullable`
- `budget_amount numeric nullable`
- `budget_currency text nullable`
- `planned_start date nullable`
- `planned_end date nullable`
- timestamps

### `project_assets`

- `project_id uuid fk projects.id`
- `asset_id uuid fk assets.id`
- `relationship_type text`
- timestamps
- composite primary key `(project_id, asset_id)`

### `project_milestones`

- `id uuid pk`
- `project_id uuid fk projects.id`
- `name text`
- `description text nullable`
- `sequence integer`
- `status text`
- `target_date date nullable`
- `completed_at timestamptz nullable`
- `evidence_id uuid nullable`
- timestamps

### `maintenance_records`

- `id uuid pk`
- `asset_id uuid fk assets.id`
- `project_id uuid nullable fk projects.id`
- `maintenance_type text`
- `description text`
- `cost numeric nullable`
- `currency_code text nullable`
- `performed_by_party_id uuid nullable`
- `condition_before jsonb nullable`
- `condition_after jsonb nullable`
- `performed_at timestamptz`
- `next_review_at timestamptz nullable`

## 11. Valuation and Risk

### `valuations`

- `id uuid pk`
- `asset_id uuid fk assets.id`
- `valuation_type text`
- `value numeric`
- `currency_code text`
- `valuation_date date`
- `valid_until date nullable`
- `methodology text`
- `methodology_version text nullable`
- `valuer_party_id uuid nullable`
- `evidence_id uuid nullable`
- `confidence_level text nullable`
- `assumptions jsonb nullable`
- timestamps

### `risk_assessments`

- `id uuid pk`
- `subject_type text`
- `subject_id uuid`
- `risk_model text`
- `risk_model_version text`
- `overall_score numeric nullable`
- `overall_level text`
- `assessor_party_id uuid nullable`
- `evidence_snapshot jsonb nullable`
- `assessed_at timestamptz`
- `expires_at timestamptz nullable`

### `risk_factors`

- `id uuid pk`
- `risk_assessment_id uuid fk risk_assessments.id`
- `category text`
- `probability numeric nullable`
- `impact numeric nullable`
- `score numeric nullable`
- `description text`
- `mitigation text nullable`

## 12. Capital and Investment

### `investment_products`

- `id uuid pk`
- `tenant_id uuid nullable`
- `product_identifier text unique`
- `name text`
- `product_type text`
- `legal_structure_id uuid nullable fk legal_entities.id`
- `status text`
- `jurisdiction_id uuid nullable`
- `target_amount numeric nullable`
- `currency_code text nullable`
- `terms jsonb`
- `eligibility_policy_id uuid nullable`
- timestamps

An investment product is not an ownership record. Underlying legal rights remain in `asset_rights`.

### `investment_product_assets`

- `investment_product_id uuid fk investment_products.id`
- `asset_id uuid fk assets.id`
- `relationship_type text`
- timestamps
- composite primary key `(investment_product_id, asset_id)`

### `capital_commitments`

- `id uuid pk`
- `investment_product_id uuid fk investment_products.id`
- `investor_party_id uuid fk parties.id`
- `amount numeric`
- `currency_code text`
- `status text`
- `committed_at timestamptz`
- `expires_at timestamptz nullable`

### `subscriptions`

- `id uuid pk`
- `investment_product_id uuid fk investment_products.id`
- `investor_party_id uuid fk parties.id`
- `commitment_id uuid nullable fk capital_commitments.id`
- `amount numeric`
- `currency_code text`
- `status text`
- timestamps

### `positions`

- `id uuid pk`
- `investor_party_id uuid fk parties.id`
- `investment_product_id uuid fk investment_products.id`
- `units numeric`
- `cost_basis numeric nullable`
- `currency_code text nullable`
- `status text`
- timestamps

## 13. Treasury

### `accounts`

- `id uuid pk`
- `tenant_id uuid nullable`
- `account_type text`
- `owner_party_id uuid nullable`
- `currency_code text`
- `status text`
- timestamps

### `transactions`

- `id uuid pk`
- `tenant_id uuid nullable`
- `transaction_reference text unique`
- `transaction_type text`
- `source_account_id uuid nullable fk accounts.id`
- `destination_account_id uuid nullable fk accounts.id`
- `amount numeric`
- `currency_code text`
- `status text`
- `external_reference text nullable`
- `correlation_id uuid nullable`
- timestamps

### `ledger_entries`

- `id uuid pk`
- `transaction_id uuid fk transactions.id`
- `account_id uuid fk accounts.id`
- `entry_type text`
- `amount numeric`
- `currency_code text`
- `created_at timestamptz`

### `reconciliations`

- `id uuid pk`
- `transaction_id uuid nullable`
- `account_id uuid nullable`
- `external_reference text`
- `status text`
- `difference_amount numeric nullable`
- `resolved_at timestamptz nullable`
- timestamps

The current property `raised` value must not become the long-term financial source of truth.

## 14. Governance

### `policies`

- `id uuid pk`
- `tenant_id uuid nullable`
- `policy_code text unique`
- `name text`
- `policy_type text`
- `version text`
- `rules jsonb`
- `status text`
- effective dates

### `governance_proposals`

- `id uuid pk`
- `tenant_id uuid nullable`
- `proposer_party_id uuid`
- `policy_id uuid nullable`
- `subject_type text`
- `subject_id uuid nullable`
- `proposal_type text`
- `status text`
- `rationale text`
- `evidence_snapshot jsonb`
- timestamps

### `decisions`

- `id uuid pk`
- `proposal_id uuid nullable`
- `decision_type text`
- `decision text`
- `decision_reason text`
- `authority_party_id uuid`
- `effective_at timestamptz`
- `conditions jsonb nullable`
- timestamps

## 15. Institutional Memory

### `institutional_events`

Append-only business history.

- `id uuid pk`
- `tenant_id uuid nullable`
- `event_id uuid unique`
- `event_type text`
- `subject_type text`
- `subject_id uuid`
- `actor_party_id uuid nullable`
- `authority_party_id uuid nullable`
- `correlation_id uuid nullable`
- `causation_id uuid nullable`
- `previous_state jsonb nullable`
- `resulting_state jsonb nullable`
- `evidence_refs jsonb nullable`
- `occurred_at timestamptz`
- `recorded_at timestamptz`

No normal business API should expose update/delete operations for these records.

### `audit_events`

Security/compliance audit.

- `id uuid pk`
- `tenant_id uuid nullable`
- `actor_user_id uuid nullable`
- `action text`
- `resource_type text`
- `resource_id uuid nullable`
- `request_id text nullable`
- `correlation_id uuid nullable`
- `ip_address inet nullable`
- `user_agent text nullable`
- `result text`
- `metadata jsonb nullable`
- `occurred_at timestamptz`

Audit events are append-only.

## 16. Partners and integrations

### `partners`

- `id uuid pk`
- `organization_id uuid fk organizations.id`
- `partner_type text`
- `status text`
- `mandate jsonb`
- timestamps

### `integrations`

- `id uuid pk`
- `partner_id uuid nullable fk partners.id`
- `provider text`
- `integration_type text`
- `capabilities jsonb`
- `configuration jsonb`
- `status text`
- timestamps

Secrets must be stored through the platform secret-management mechanism, not ordinary configuration JSON.

## 17. Legacy compatibility

Existing prototype tables remain during migration:

- `properties`
- `carbon_projects`
- `governance_proposals`
- `activity_events`
- `whitelist`
- `leads`
- `device_push_tokens`

### `legacy_entity_map`

- `id uuid pk`
- `legacy_table text`
- `legacy_id text`
- `canonical_type text`
- `canonical_id uuid`
- `migration_version text`
- `migrated_at timestamptz`

This permits complete traceability from old records to canonical records.

## 18. Migration order

1. Platform Core — jurisdictions, tenants, organizations, persons, legal entities, parties, users.
2. Authorization — roles, permissions, user_roles and policy foundation.
3. Asset Registry — asset_types, assets, asset_identifiers, asset_locations, asset_relationships.
4. Evidence / Verification — documents, document_versions, evidence, verification_cases, verification_actions, verification_decisions.
5. Legal / Rights — spvs, asset_rights, encumbrances.
6. Projects / Operations — projects, project_assets, project_milestones, maintenance_records.
7. Valuation / Risk — valuations, risk_assessments, risk_factors.
8. Capital — investment_products, investment_product_assets, capital_commitments, subscriptions, positions.
9. Treasury — accounts, transactions, ledger_entries, reconciliations.
10. Governance / Memory — policies, decisions, institutional_events, audit_events.
11. Partners / Integrations — partners, integrations.
12. Legacy Mapping — legacy_entity_map and controlled backfill.

## 19. Legacy backfill rules

For every current property:

1. create a canonical asset;
2. create a legacy mapping;
3. create its location;
4. preserve legal-document references as evidence candidates;
5. build an Asset Passport projection;
6. keep token/fundraising values in legacy context until Investment Product migration is approved;
7. emit a migration event;
8. reconcile counts and relationships;
9. expose canonical APIs only after validation.

For `activity_events`, preserve originals and create canonical institutional events only when classification is reliable.

For `whitelist`, map the participant into Party/Identity/Eligibility without treating a wallet address as the canonical person identity.

## 20. Tenant isolation

The application must enforce tenant context. PostgreSQL Row-Level Security should be introduced progressively after tenant ownership semantics are established, domain by domain.

RLS must not be blindly enabled on prototype tables.

## 21. Index strategy

High-value indexes include:

- `assets(asset_identifier)` unique
- `assets(tenant_id, status)`
- `asset_identifiers(identifier_type, identifier_value)`
- `asset_rights(asset_id, effective_from, effective_to)`
- `evidence(subject_type, subject_id)`
- `verification_cases(subject_type, subject_id, status)`
- `projects(tenant_id, status)`
- `valuations(asset_id, valuation_date desc)`
- `risk_assessments(subject_type, subject_id, assessed_at desc)`
- `transactions(transaction_reference)` unique
- `transactions(correlation_id)`
- `institutional_events(subject_type, subject_id, occurred_at desc)`
- `audit_events(actor_user_id, occurred_at desc)`

## 22. Integrity rules

Database constraints should enforce what is safely enforceable:

- unique canonical identifiers;
- foreign-key integrity;
- valid party relationships;
- valid project/asset relationships;
- valid investment-product/asset relationships;
- valid ledger references;
- unique document versions;
- unique event IDs;
- non-destructive historical records;
- appropriate numeric/check constraints.

Institutional authorization remains a service-layer responsibility.

## 23. Explicit non-dependencies

The canonical schema does not make these foundational:

- UTLAM
- OSANV token
- Solana
- any specific blockchain
- secondary trading
- DAO governance
- one bank/payment provider
- one cloud provider
- one identity provider
- AI-generated truth

## 24. Approval gate before database migration

No destructive modification to current prototype tables until:

1. Drizzle implementation compiles;
2. migrations pass against an isolated database;
3. legacy-to-canonical mapping is tested;
4. tenant/security model is reviewed;
5. rollback/recovery is documented;
6. API contracts are aligned;
7. existing application tests remain green;
8. migration counts and reconciliation reports are generated.

The first implementation must be additive and reversible.
