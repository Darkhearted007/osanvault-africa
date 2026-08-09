# ADR: API as the Single Contract Boundary

## Status

Accepted for OV1.4 implementation.

## Decision

The existing OpenAPI 3.1 specification is the canonical external API contract. Express route implementations, Zod validation and generated React Query clients must converge on that contract.

## Rationale

The canonical repository already contains an Express API, OpenAPI specification, Zod schemas and generated API clients. Introducing a second API specification or service would create drift and duplicate authority.

## Consequences

- Route additions require OpenAPI updates.
- Contract changes trigger schema/client regeneration.
- Mutations require explicit authentication/authorization requirements.
- Legacy behavior is preserved through compatible changes where possible.
- Breaking changes require explicit versioning and migration documentation.

## Financial consideration

Presentation aggregates such as property funding and platform statistics are not the institutional ledger. A future financial domain will define transactions, allocations, ownership and settlement separately.

## Rejected alternatives

- Creating a second API service for the same domain.
- Maintaining hand-written client contracts independently of OpenAPI.
- Moving the database behind a new service solely to satisfy architectural aesthetics.
