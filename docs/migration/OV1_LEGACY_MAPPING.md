# OV1 Legacy Mapping Contract

The prototype remains operational during migration. Legacy records are never rewritten in place.

## Prototype properties → canonical asset

For each existing `properties.id`:

- create one canonical `assets` record;
- assign a stable public `asset_identifier` such as `OSAN-AFR-ASSET-LEGACY-PROPERTY-<id>` until a production identifier policy is approved;
- map `type` to an `asset_types` record;
- map `name`, `description`, `status`, `jurisdiction`, `lat`, `lng` and `location` into canonical asset/location fields;
- retain `targetRaise`, `raised`, `totalTokens`, `tokenPrice` and `yieldApy` only in the legacy property record during OV1;
- map `legalDocCid` to evidence/document metadata when its source can be verified;
- map `indigenousAuthority` into evidence/source metadata rather than treating it as proof by itself;
- create a `legacy_entity_mappings` row linking the original property ID to the canonical asset UUID.

## Rules

1. Mapping is idempotent by `(source_system, source_entity_type, source_entity_id)`.
2. Existing property IDs remain valid for the prototype API.
3. No token field is required to create or verify a canonical asset.
4. Financial fields are not copied into canonical ownership or rights records without an approved legal/business mapping.
5. Every document/evidence mapping retains its source reference.
6. Mapping failures are recorded and do not abort unrelated records.

## Future migrations

Leads, whitelist records, governance records and portfolio records receive their own mapping contracts after the Asset Registry migration is certified. Do not create speculative mappings for unrelated domains in OV1.
