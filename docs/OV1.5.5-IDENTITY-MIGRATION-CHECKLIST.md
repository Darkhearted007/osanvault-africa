# OV1.5.5 Identity Migration Certification Checklist

## Scope

This migration is additive. It does not modify or delete existing ÒsánVault tables.

## Review gates

- [x] Identity schema is exported from the canonical Drizzle schema index.
- [x] PostgreSQL migration SQL is present.
- [x] Foreign keys use cascading cleanup only for identity-owned records.
- [x] Provider credentials are represented by references, not raw secrets.
- [x] Wallet addresses are not used as principal primary keys.
- [x] Organization memberships are scoped to organization principals.
- [x] Roles and permissions are separate entities.
- [x] Service identities are distinct from human principals.
- [x] Jurisdiction is modeled as a relationship.
- [x] Existing whitelist schema is unchanged.
- [ ] Migration executed against disposable staging PostgreSQL.
- [ ] Existing schema regression check passed in staging.
- [ ] Drizzle schema/typecheck passed.
- [ ] API regression suite passed.
- [ ] Rollback/recovery procedure tested in staging.

## Staging verification

Run the migration only against a dedicated staging database:

```bash
psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/db/migrations/0001_identity_foundation.sql
```

Then verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'principals', 'identities', 'organizations',
    'organization_memberships', 'roles', 'permissions',
    'role_permissions', 'principal_roles', 'sessions',
    'service_accounts', 'principal_jurisdictions'
  )
ORDER BY table_name;
```

Expected: 11 identity tables.

## Important

A successful SQL parse is not equivalent to migration certification. Staging execution, schema verification and application regression tests must pass before this migration is promoted to the canonical main branch.

## Follow-on gate

After certification, add provider-neutral request-principal resolution and route authorization. Do not enable protected mutations until a real authentication provider/session source has been connected and tested.
