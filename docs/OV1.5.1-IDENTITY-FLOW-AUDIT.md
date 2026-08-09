# OV1.5.1 Identity Flow Audit

## Scope

Review the canonical web/mobile application surfaces before implementing authentication middleware.

## Findings

The web application currently exposes product routes including `/dashboard`, `/portfolio`, `/treasury`, `/admin`, `/issuer`, `/whitelist`, `/staking` and `/governance` in the client router. The router itself does not establish an authentication gate; route protection therefore cannot be inferred from URL structure alone.

Repository-wide searches did not identify a clear shared `AuthContext`, `useAuth`, JWT/session middleware, `requireAuth`, or role-enforcement implementation in the canonical API.

## Risk

Client-side route visibility is not authorization. A route such as `/admin` being present in a React router must never be considered evidence that a request is authorized. The API must enforce authorization independently.

## Target flow

```text
User / Organization / Service
            |
       Identity Provider
            |
       Authentication
            |
     Request Principal
            |
       Authorization
            |
     Business Verification
            |
       Domain Operation
```

## Required route behavior

- Public pages may remain accessible without a session where product policy permits.
- Protected pages should obtain authenticated session state from a future shared identity adapter.
- Protected API operations must enforce authorization server-side even if the UI hides the route.
- Verification and investment eligibility remain separate from authentication.
- Wallet connection, where used, is a capability/settlement mechanism and not by itself proof of identity or legal ownership.

## Recommended implementation order

1. Identify the actual identity provider or confirm that none exists.
2. Define a provider-neutral identity adapter.
3. Define a server-side request principal.
4. Add authorization middleware to protected API route families.
5. Add client-side route guards for UX only.
6. Add tests proving server-side denial without authorization.
7. Add audit events for privileged actions.

## Non-goal

Do not add a new authentication provider in this audit phase.
