# OV1.5.5 Identity Migration Certification

This gate applies to `lib/db/migrations/0001_identity_foundation.sql`.

## Required before merge to main

- Staging PostgreSQL execution succeeds with `ON_ERROR_STOP=1`.
- Eleven identity tables are present.
- Foreign keys and unique indexes are verified.
- Existing ÒsánVault tables remain unchanged.
- Drizzle schema typecheck passes.
- API regression tests pass.
- Rollback/recovery is tested in staging.

## Required before enabling protected mutations

- A real identity provider/session source is selected and tested.
- Request-principal resolution is implemented.
- Server-side permission enforcement is enabled.
- Unauthorized requests are rejected.
- Authorization decisions are audited.

No production identity records are backfilled by this migration. No wallet address is promoted to a principal without deterministic evidence.
