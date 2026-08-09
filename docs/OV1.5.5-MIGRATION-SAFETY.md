# OV1.5.5 Migration Safety

The identity migration is staging-only until certified.

Never execute it against production from this branch.

Required command in a disposable staging database:

```bash
psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/db/migrations/0001_identity_foundation.sql
```

Required checks:

- eleven new identity tables exist;
- existing ÒsánVault tables are unchanged;
- all expected foreign keys and unique indexes exist;
- workspace typecheck passes;
- API regression tests pass;
- rollback/recovery is demonstrated.

The migration does not backfill users, identities or wallet addresses. Backfill is a separate, evidence-driven operation after the identity provider and mapping rules are approved.
