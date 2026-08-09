# OV1.5.4 Migration Safety Checklist

Before any identity migration is applied to a database:

- [ ] Generate migration from the additive Drizzle schema.
- [ ] Review generated SQL manually.
- [ ] Confirm no existing table is dropped or altered destructively.
- [ ] Confirm no existing column is renamed or removed.
- [ ] Run against disposable/staging PostgreSQL first.
- [ ] Verify foreign keys and unique indexes.
- [ ] Run existing API tests.
- [ ] Run identity schema/type checks.
- [ ] Confirm production remains untouched.

The identity schema branch intentionally does not wire authorization into existing routes yet. That is the next gate after database migration validation.
