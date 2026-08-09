# OV1.4 Current Route Inventory

This inventory is the implementation baseline for API contract alignment. It records the current Express route surface without changing behavior.

| Route family | Operations currently implemented | Contract status | Security classification |
| --- | --- | --- | --- |
| `/healthz` | GET | documented | public operational |
| `/properties` | GET list, GET detail, POST funding/mutation where implemented | partially documented | reads public; mutations protected gate |
| `/carbon-projects` | GET | documented | public read |
| `/governance-proposals` | GET | documented | public read; future mutations protected |
| `/activity` | GET | documented | public read |
| `/platform-stats` | GET | documented | public read |
| `/whitelist` | GET list, GET detail, GET stats, POST, PATCH, DELETE | undocumented in OpenAPI | protected administrative/investor-compliance surface |
| `/leads` | GET list, GET detail, GET count, POST, PATCH, DELETE | undocumented in OpenAPI | public intake only for POST; management operations protected |
| `/device-tokens` | POST, DELETE | undocumented in OpenAPI | authenticated device-management boundary |

## Findings

### 1. Contract drift exists

The OpenAPI document currently covers health, properties reads, carbon projects, governance reads, activity and platform statistics, while the Express router registers additional whitelist, leads and device-token endpoints.

### 2. Mutations need an explicit security boundary

Whitelist PATCH/DELETE and lead PATCH/DELETE are management operations. They must not remain implicitly public when the platform is production-facing.

Device-token registration/deletion must be associated with an authenticated user/device identity before it is treated as a production identity capability.

### 3. Public intake must remain deliberately narrow

The lead creation endpoint can remain a public acquisition/intake operation if product requirements require it. It must be rate-limited, validated and protected against abuse. Lead listing, modification and deletion are administrative operations.

### 4. API errors need normalization

Current routes return several compatible but different error shapes, including `{ error }` and `{ error, details }`. OV1.4 should converge them through a documented error envelope without changing successful response semantics unnecessarily.

## Implementation order

1. Freeze this inventory as the baseline.
2. Define security requirements for each operation.
3. Add missing OpenAPI paths and schemas.
4. Normalize error schemas where safe.
5. Regenerate Zod/client artifacts.
6. Add contract regression tests.
7. Only then introduce new financial/investment operations.
