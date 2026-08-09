# OV1.5 Security & Identity Readiness

## Finding

The current API route surface contains mutating endpoints, including whitelist, leads and device-token operations, but repository search did not identify an established route-level authentication/session middleware. This is a readiness gap, not permission to invent a replacement authentication system.

## Decision

Before production use of protected mutations, ÒsánVault must have an explicit identity and authorization boundary that is compatible with the application's existing authentication behavior once that behavior is identified and verified.

No authentication provider or protocol is selected by this document.

## Security zones

### Public

Suitable candidates, subject to final review:

- health
- public property discovery
- public carbon/project discovery
- public platform statistics
- public activity feed where data is intentionally public
- lead submission, if intentionally public

### Authenticated

Requires a verified user identity:

- investor profile operations
- device-token management
- personal investment information
- personal documents
- personal ownership information

### Privileged

Requires role/permission checks and audit logging:

- whitelist approval/rejection/revocation
- lead status administration
- property lifecycle mutations
- investment product administration
- ownership adjustments
- verification decisions
- treasury operations
- governance administration

## Required controls

1. Authentication must establish a trusted principal.
2. Authorization must be evaluated at the route/domain boundary.
3. Mutating privileged operations must be auditable.
4. Sensitive operations should require explicit idempotency/replay controls where applicable.
5. Error responses must not disclose secrets or internal infrastructure details.
6. Administrative operations must be separated from ordinary investor permissions.
7. Country-specific compliance rules must be enforced through policy/configuration rather than copied business logic.

## Identity model target

```text
Principal
  |
  +-- person
  +-- organization
  +-- service
  |
  +-- roles
  +-- permissions
  +-- jurisdiction
  +-- verification state
```

The identity model must remain separate from blockchain wallet ownership. A wallet address may be a credential or settlement identifier; it is not automatically a complete legal identity.

## Verification boundary

Identity verification, investor eligibility, asset verification and transaction authorization are separate concerns:

```text
Identity
   -> eligibility
   -> verification
   -> authorization
   -> transaction
```

Passing one stage must not imply that all later stages are satisfied.

## Exit criteria

OV1.5 is ready for implementation when:

- the existing authentication mechanism has been identified from the canonical repository;
- principal, role and permission semantics are documented;
- public/authenticated/privileged routes are classified;
- privileged mutations have audit requirements;
- authorization tests exist for allow/deny paths;
- no authentication behavior is silently replaced or bypassed.
