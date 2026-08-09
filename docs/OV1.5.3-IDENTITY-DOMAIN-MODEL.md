# OV1.5.3 Identity Domain Model

## Objective

Define the identity model before implementing an authentication provider or changing the database.

## Existing signals

The current database already stores whitelist-oriented identity attributes including wallet/address, KYC level, investor type, jurisdiction and investment cap. These are useful compliance attributes but must not be treated as the complete identity model.

## Canonical model

```text
Principal
├── Person
│   └── Identity
├── Organization
│   └── OrganizationMembership
└── ServiceAccount

Identity
├── credentials/providers
├── sessions
├── verification state
├── jurisdiction
└── assurance level

Authorization
├── roles
├── permissions
└── scoped resource access
```

## Separation of concerns

### Authentication
Proves that a principal controls an accepted credential/session.

### Identity
Represents the principal in the platform.

### Verification
Determines whether identity information has met required evidence/assurance rules.

### Authorization
Determines what the principal may do.

### Investor eligibility
Determines whether a verified principal may participate in a particular investment product.

### Wallet
Represents a blockchain account and is not inherently proof of identity or ownership.

## Existing whitelist relationship

The current whitelist table contains `address`, `kycLevel`, `investorType`, `jurisdiction` and `investmentCapNgn`. These fields should become attributes of a verified investor/product-eligibility model over time rather than becoming the permanent identity authority.

Do not delete or break the existing whitelist table during this phase.

## Jurisdiction model

A principal may have multiple jurisdiction relationships. Jurisdiction should not be stored as a single immutable identity property when future cross-border activity is expected.

Target concept:

```text
Principal
  └── JurisdictionMembership*
       ├── country
       ├── status
       ├── effectiveFrom
       ├── effectiveTo
       └── evidence/reference
```

## Organization model

Organizations must be first-class principals. A person may act on behalf of an organization through an explicit membership/role relationship.

This supports:

- investors
- property owners
- developers
- institutional funds
- banks/financial institutions
- government entities
- service providers

## Service identities

Machine-to-machine operations must use service identities with explicit scopes. API keys or service credentials must never inherit unrestricted human administrator privileges.

## Migration principle

Introduce the model additively. Existing whitelist, lead and device-token behavior remains functional until a verified identity layer is ready to replace or wrap it.

## Exit criteria

OV1.5.3 is complete when:

- identity entities and relationships are approved;
- existing whitelist semantics are mapped;
- jurisdiction is modeled for future multi-country support;
- organization principals are supported conceptually;
- service identities are scoped;
- authentication, verification and authorization remain separate.
