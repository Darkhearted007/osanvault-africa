# OV1.4 API Contract Alignment

## Objective

Make the existing ÒsánVault API a single contract-driven system without replacing the current Express, OpenAPI, Zod, React Query, Drizzle or PostgreSQL architecture.

## Current boundary

```text
React / Mobile
      |
Generated API client
      |
OpenAPI 3.1
      |
Zod validation
      |
Express routes
      |
Drizzle
      |
PostgreSQL
```

## Route inventory baseline

The current route registry includes:

- health
- properties
- carbon
- governance
- activity
- platform statistics
- whitelist
- leads
- device tokens

The OpenAPI specification currently documents only part of this route surface. Contract drift must be eliminated before expanding investment or financial workflows.

## Alignment rules

1. Every externally consumed route must have an OpenAPI operation.
2. Every OpenAPI operation must map to one implemented route.
3. Request and response schemas must be represented consistently in Zod/generated clients.
4. Mutating routes must have explicit authentication and authorization requirements before production use.
5. Error responses must use a consistent documented shape.
6. Financial fields must not imply ledger truth merely because they are exposed by a property or stats endpoint.
7. Existing public read behavior should remain compatible unless a versioned breaking change is explicitly approved.
8. Regeneration of API clients must be deterministic and reviewed with the OpenAPI change.

## First alignment set

Bring these implemented routes into the contract surface without changing their business behavior:

- whitelist
- leads
- device tokens
- property funding/mutation endpoints
- any additional route discovered during implementation audit

## Security gate

Before exposing or retaining mutating endpoints in production:

- identify the authentication mechanism currently used by the application;
- define route-level authorization requirements;
- prevent unauthenticated creation/update/delete operations where they modify protected resources;
- preserve current authentication behavior while introducing the explicit boundary;
- add regression tests for authorized and unauthorized requests.

## Financial boundary

The existing property `raised`/funding aggregates and platform statistics are presentation/domain aggregates. They must not be promoted into the canonical institutional ledger without a separate transaction/ledger model.

## Exit criteria

OV1.4 is complete when:

- route inventory is complete;
- OpenAPI and implemented routes are aligned;
- generated API schemas/clients regenerate cleanly;
- API typecheck passes;
- contract tests cover all documented operations;
- protected mutations have an explicit security boundary;
- no breaking API change was introduced.

## Non-goals

This milestone does not:

- integrate other ÒsánVault repositories;
- introduce a new API framework;
- replace Drizzle/PostgreSQL;
- launch or modify OSANV;
- activate investment or treasury operations;
- add country-specific business logic.
