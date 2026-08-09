# OV1.5.5 Review Gate

Branch `feat/identity-foundation` contains the provider-neutral identity foundation.

Review before merge:

- schema and migration parity;
- additive safety;
- authorization primitive correctness;
- compatibility with existing schema;
- staging validation requirements.

Do not merge to `main` until staging PostgreSQL and regression checks pass.
