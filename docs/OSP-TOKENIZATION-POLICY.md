# OSP Tokenization Policy

## Position

ÒsánVault does not require a platform token to operate.

The platform must support real-world asset registration, verification, offerings, investment workflows and ownership records without requiring OSANV or any blockchain transaction.

## Architecture

```text
Asset
 -> legal ownership/right
 -> verification
 -> compliance
 -> offering
 -> investment
 -> ownership/entitlement
 -> optional token representation
```

## Financial truth

The canonical internal ledger is the authoritative accounting record. Wallet balances, token balances and blockchain events are settlement/proof inputs or outputs and must not silently become accounting truth.

## When tokenization is appropriate

Tokenization may be considered where it provides measurable value such as:

- programmable settlement
- controlled transferability
- provenance
- transparent auditability
- fractional representation where legally permitted
- interoperability with approved external networks

## OSANV gate

Before any OSANV utility is activated, the platform must separately certify:

- legal classification and jurisdictional treatment
- documented utility
- treasury and accounting treatment
- custody and key management
- transfer restrictions
- smart-contract security
- investor/consumer protection
- country-specific compliance
- incident and recovery procedures

## Country neutrality

Country adapters must be able to operate without OSANV. A country-specific investment product must not depend on a universal token unless that dependency has been separately approved.

## Prohibited assumptions

The current architecture must not assume:

- OSANV is a security
- OSANV represents ownership of every asset
- token holders automatically own underlying real-world assets
- staking creates investment rights
- token balances equal treasury balances
- blockchain presence proves legal title

## Decision outcome

For the current implementation phase:

**Build the platform first. Keep tokenization as an optional adapter. Defer the final OSANV utility decision until the asset, legal, investment, treasury and compliance models are certified.**