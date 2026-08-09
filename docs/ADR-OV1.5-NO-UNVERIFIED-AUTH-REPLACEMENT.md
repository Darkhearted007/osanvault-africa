# ADR: Do Not Replace Authentication Without Repository Evidence

## Status

Accepted for OV1.5 planning.

## Decision

ÒsánVault will not introduce a new authentication provider, JWT implementation, session mechanism, wallet-authentication flow or identity service merely to fill an architectural gap.

First identify the authentication behavior actually used by the canonical application and its deployment environment. Then harden that existing mechanism or make an explicitly approved migration.

## Rationale

Authentication is a security boundary. Replacing it during architectural consolidation can silently invalidate sessions, alter account ownership semantics or create incompatible security behavior.

## Consequences

- The current canonical repository remains the source of truth.
- Any authentication implementation must be evidenced by code/configuration or an explicit product decision.
- Authorization can be designed independently, but its enforcement must use the verified principal established by authentication.
- Protected mutations remain gated until the identity boundary is confirmed.

## Rejected approach

Do not add a generic `auth` package, JWT secret, wallet signature verifier or third-party identity provider without first establishing that it matches the existing application requirements.
