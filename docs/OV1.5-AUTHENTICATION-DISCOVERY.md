# OV1.5 Authentication Discovery

## Finding

The canonical API currently exposes its Express router directly under `/api`. The application middleware includes security headers, CORS, request logging, JSON parsing and routing, but no visible authentication or authorization middleware is mounted before the route registry.

The repository code search did not identify a clear JWT/session/role middleware or established `requireAuth`/`requireRole` boundary in the canonical API.

## Consequence

This is not evidence that no authentication exists anywhere in the wider product. It means the API boundary currently does not demonstrate an explicit authenticated principal contract that protected route handlers can rely upon.

This distinction is important: do not invent a replacement authentication provider until the web/mobile account flows, deployment environment and any external identity configuration are fully audited.

## Immediate security classification

### Public/read-only candidates

- health
- public property discovery
- public carbon discovery
- public activity/statistics where approved

### Protected candidates

- whitelist administration
- lead administration
- device-token deletion/management
- property funding/mutation
- governance mutation
- future investment operations
- ownership operations
- treasury operations
- verification decisions

### Highly privileged

- treasury settlement
- ownership correction
- verification override
- regulatory/compliance override
- system administration

## Required principal contract

Before protected routes are enabled, the API needs a request-scoped principal with at least:

- subject identifier
- principal type (person, organization, service)
- authenticated status
- roles/permissions
- jurisdiction/tenant context where applicable
- authentication assurance level

## No-breaking-change rule

OV1.5 must preserve any existing client-facing account behavior once discovered. The first implementation should introduce an adapter around the actual identity mechanism, not replace it.

## Next audit targets

1. web authentication/account UI
2. mobile authentication/account UI
3. environment and deployment configuration
4. existing external identity providers
5. cookie/session/token handling
6. administrative access paths
7. secrets and credential exposure

Only after these are mapped should authentication middleware be implemented.
