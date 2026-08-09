# OV1.5.2 Identity Provider Decision

## Current finding

The canonical web application includes wallet tooling (`wagmi`, `RainbowKit`, `viem`) but no verified evidence in the audited application package that wallet connectivity is an application authentication system. The API also has no visible authentication middleware at its route boundary.

## Decision

Do not equate wallet connectivity with ÒsánVault identity.

The platform requires a provider-neutral identity boundary capable of supporting:

- individual users
- organizations/institutions
- service identities
- country/jurisdiction context
- assurance level
- account lifecycle
- recovery
- consent/session management

## Target architecture

```text
Identity Provider / Enterprise IdP
              |
              v
      Identity Adapter
              |
              v
       Request Principal
              |
       +------+------+
       |             |
 Authorization    Audit Context
       |
       v
     API/domain
```

The adapter may later support one or more approved identity providers, but the domain and authorization layers must not depend directly on a vendor SDK.

## Wallet boundary

Wallet connection remains a separate capability:

```text
User identity ────────> authentication
User identity ────────> authorization
User identity ────────> verification
Wallet address ───────> blockchain account
```

A wallet signature can be used for a blockchain action or, if separately approved, as one authentication factor. It does not by itself prove legal identity, property ownership or investment eligibility.

## Selection criteria

Before selecting an identity provider, evaluate:

1. OIDC/OAuth2 support
2. MFA and recovery
3. organization accounts
4. role/permission integration
5. auditability
6. data residency requirements
7. Nigerian and future African jurisdiction support
8. mobile support
9. enterprise federation
10. migration/export capabilities
11. operational cost
12. vendor lock-in

## Implementation gate

No provider-specific SDK should be introduced until the current web/mobile/deployment identity flows are conclusively audited and a provider decision is approved.

The first implementation should expose an internal identity adapter and request principal interface. Provider integration sits behind that boundary.
