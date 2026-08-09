# ADR: Mutation Security Gate

## Status

Accepted for OV1.4 implementation.

## Decision

No new protected mutation capability will be added to the ÒsánVault API until the existing authentication mechanism is explicitly identified and route-level authorization requirements are documented.

Existing public read endpoints may remain public where intended. Public lead intake may remain public if required, but it must be treated as untrusted input and protected with validation and abuse controls.

## Protected operation classes

- whitelist approval/status changes
- whitelist deletion
- lead management
- device-token ownership operations
- property funding/financial mutations
- future investment, ownership, treasury and governance mutations

## Requirements

Every protected mutation must have:

1. authenticated principal
2. authorization decision
3. input validation
4. audit event
5. consistent error response
6. regression test for denied access

## Compatibility rule

Do not replace the application's authentication mechanism in this milestone. First identify and document it, then place authorization checks around the existing mechanism.

## Why this gate exists

The current route implementation contains mutation endpoints while the contract surface does not yet fully document them. Adding new financial or compliance operations before closing this boundary would increase security and audit risk.

## Exit criteria

OV1.4 security gate is satisfied when all current mutations have an explicit classification and protected operations have an enforceable authorization boundary with tests.
