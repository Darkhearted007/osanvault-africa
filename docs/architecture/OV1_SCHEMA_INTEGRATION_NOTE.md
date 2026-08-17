# OV1 Schema Integration Note

The canonical foundation is currently isolated in `lib/db/src/schema/canonical-foundation.ts` so the prototype schema is not overwritten.

Before merge to `main`, the existing `lib/db/src/schema/index.ts` must export the canonical module alongside all existing prototype exports. The canonical module must then be included in the repository's Drizzle schema configuration and validated by generated SQL against disposable PostgreSQL.

This branch intentionally does not alter the existing prototype schema index without first reading its current exports, because preserving existing tables is a hard migration invariant.
