# OV1 Validation Commands

Run from the repository root after the canonical schema export/configuration is integrated:

```bash
pnpm install --frozen-lockfile
pnpm -r typecheck
pnpm --filter @workspace/db exec drizzle-kit generate
pnpm --filter @workspace/api-server test
```

Review the generated SQL before applying it.

For staging only:

```bash
psql "$STAGING_DATABASE_URL" -v ON_ERROR_STOP=1 -f <generated-migration.sql>
```

Then verify:

- canonical tables exist;
- all existing prototype tables still exist;
- no prototype column was dropped/renamed;
- foreign keys and unique indexes are present;
- API regression tests pass;
- rollback/recovery is documented.

Do not run the staging command against production.
