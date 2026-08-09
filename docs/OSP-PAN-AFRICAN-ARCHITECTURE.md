# OSP Pan-African Architecture

## Purpose

ÒsánVault Africa is designed as a pan-African real-world-asset and digital infrastructure platform. Nigeria is the first country implementation, not the permanent architectural boundary.

## Core principle

Keep the platform core country-neutral. Country-specific regulation, identity, property/asset registries, payment rails, currencies, tax rules, languages, data-residency requirements and investment restrictions belong behind country adapters.

## Target model

```text
                    ÒSÁNVAULT AFRICA
                           |
                    PAN-AFRICAN CORE
                           |
       +-------------------+-------------------+
       |                   |                   |
      NG                  GH                  KE
       |                   |                   |
  Country adapter     Country adapter     Country adapter
       |                   |                   |
  identity/payment   identity/payment   identity/payment
  asset rules        asset rules        asset rules
  compliance         compliance         compliance
       +-------------------+-------------------+
                           |
                  Shared platform domains
                           |
       identity | assets | verification | documents
       offerings | investment | ownership | treasury
       carbon | governance | audit | notifications
```

## Country adapter contract

Each country adapter should be capable of providing:

- ISO country and jurisdiction metadata
- supported currencies and settlement configuration
- identity-provider integrations
- property/land/asset registry integrations where legally available
- document and verification requirements
- investment eligibility and product restrictions
- tax configuration hooks
- payment and payout rail adapters
- data residency and retention rules
- local legal-entity/SPV references
- localization metadata

Country adapters must not fork core domain logic.

## Core versus adapter boundary

### Core

- asset identity
- asset lifecycle
- verification state machine
- document metadata
- offering lifecycle
- investment lifecycle
- ownership records
- audit events
- notifications
- authorization primitives
- API contracts

### Country-specific

- regulatory rules
- KYC/identity provider selection
- land/property registry integrations
- currency and payment rails
- tax treatment
- local investment restrictions
- legal entity structures
- data residency controls

## Tokenization policy

Tokenization is an optional representation/settlement capability, not a prerequisite for the platform.

A real-world asset must be able to be registered, verified, offered and managed without requiring a platform token.

Any future blockchain representation must follow:

```text
real-world asset
 -> legal ownership/right
 -> verification
 -> compliance approval
 -> investment product
 -> ownership/entitlement record
 -> optional blockchain representation
```

The platform's internal financial ledger remains authoritative for accounting. Blockchain state must not be treated as the sole source of financial truth.

## OSANV decision gate

Do not make OSANV a mandatory dependency in the core domain model at this stage.

Before activating or expanding token utility, certify:

1. product utility
2. legal/regulatory basis in each target market
3. treasury/accounting treatment
4. custody and settlement model
5. transfer restrictions where applicable
6. token-to-asset rights relationship
7. security and smart-contract audit requirements
8. consumer/investor protection controls

The OSANV decision is therefore an architecture gate, not a prerequisite for building the platform.

## Country rollout model

1. Build and certify the country-neutral core.
2. Certify Nigeria as the first country adapter.
3. Add one additional country adapter as a reference implementation.
4. Prove that no core business logic is duplicated.
5. Establish a repeatable country onboarding process.
6. Expand country-by-country subject to legal, regulatory and operational readiness.

## Non-goals

This document does not authorize:

- launching a token
- offering securities
- operating as a bank/payment institution
- cross-border investment solicitation
- automatic land-title verification
- production blockchain deployment

Those require separate technical, legal and compliance certification.