# OV1.5.4 Identity Database & Authorization Design

## Objective

Map the approved identity model onto the existing Drizzle/PostgreSQL foundation without replacing the current schema or introducing provider-specific authentication tables prematurely.

## Existing database boundary

The repository already uses Drizzle with PostgreSQL and requires `DATABASE_URL` for database configuration. The current schema is exported through `lib/db/src/schema/index.ts`.

## Additive target entities

The first identity migration should be additive and should introduce only the minimum entities required for a request principal and authorization:

```text
principals
identities
organizations
organization_memberships
roles
permissions
role_permissions
principal_roles
sessions
service_accounts
principal_jurisdictions
```

Provider credentials should be represented through an adapter-owned credential reference rather than storing raw provider secrets in the domain database.

## Principal model

`principals` is the stable internal subject identifier.

A principal may represent:

- person
- organization
- service account

Do not use wallet addresses as the primary key for a person.

## Organization membership

Membership connects a person/service principal to an organization with an explicit role/scope.

This enables:

- company administrators
- investment managers
- property operators
- government institutions
- service integrations

without granting global administrator access.

## Authorization model

Use RBAC as the initial model with resource-scope hooks for future ABAC requirements.

```text
Principal
  -> Roles
     -> Permissions
        -> optional resource/jurisdiction scope
```

Examples of permissions:

- `property.read`
- `property.write`
- `whitelist.read`
- `whitelist.manage`
- `investment.read`
- `investment.create`
- `ownership.manage`
- `verification.review`
- `treasury.read`
- `treasury.approve`
- `admin.manage`

Do not grant permissions merely because a user is authenticated.

## Sessions

Sessions belong to the identity adapter boundary. The database may retain revocation/session metadata where required, but raw passwords, provider secrets or long-lived bearer credentials must not be stored in the domain database.

## Service accounts

Service identities require explicit scopes and lifecycle status. They must not inherit human administrator permissions by default.

## Jurisdiction

A principal can have multiple jurisdiction relationships with effective dates and evidence references. This supports pan-African expansion without hard-coding a single country on the principal.

## Existing whitelist mapping

The current whitelist table remains operational. Its KYC, investor type, jurisdiction and investment cap fields should eventually map to a product-eligibility/compliance domain rather than becoming the canonical identity store.

## Migration strategy

1. Add identity tables.
2. Backfill only deterministic relationships that can be proven from existing data.
3. Do not invent identities from wallet addresses.
4. Keep whitelist behavior compatible.
5. Introduce request-principal middleware behind a feature flag/configuration boundary.
6. Protect one mutation family at a time.
7. Add audit events for authorization decisions.

## Security requirements

- least privilege
- explicit deny by default for protected routes
- server-side authorization
- immutable audit trail for privileged actions
- no secrets in source control
- credential rotation/revocation support
- separation of human and service identities

## Non-goals

This design does not select a specific identity vendor, add production authentication code, migrate user accounts, or change existing API behavior. Those require the next implementation gate after provider selection and staging database review.
