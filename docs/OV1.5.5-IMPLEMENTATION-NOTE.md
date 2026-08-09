# OV1.5.5 Implementation Note

The provider-neutral identity foundation is implemented on `feat/identity-foundation`.

GitHub repository operations can write and review the schema and migration files, but they do not provide a connected staging PostgreSQL database in this workflow. Therefore staging execution is intentionally not claimed as complete.

This is a hard gate before merging the migration to `main`.
