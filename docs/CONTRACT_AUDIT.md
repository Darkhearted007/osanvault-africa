# ÒsánVault Africa — Contract Architecture Audit

## Executive Summary

Audit date: June 2026
Scope: All contracts in contracts/ directory
Version: 1.0.0

## Architecture Overview

### Contract Map

| Contract | Type | Lines | Dependencies | Status |
|---|---|---|---|---|
| OsanCarbon | ERC-1155 | 273 | OZ 5.x | Existing (kept) |
| AssetRegistry | UUPS | ~150 | OZ Upgradeable | New |
| SPVRegistry | UUPS | ~150 | OZ Upgradeable | New |
| ComplianceManager | UUPS | ~180 | OZ Upgradeable | New |
| LandRegistry | UUPS | ~200 | OZ Upgradeable | New |
| RevenueDistributionEngine | UUPS | ~200 | OZ Upgradeable | New |
| PayoutManager | UUPS | ~210 | OZ Upgradeable | New |
| CarbonRegistry | UUPS | ~190 | OZ Upgradeable | New |
| CarbonRetirement | UUPS | ~215 | OZ Upgradeable | New |
| Marketplace | UUPS | ~190 | OZ Upgradeable | New |
| PPPRegistry | UUPS | ~200 | OZ Upgradeable | New |
| MineralsModule | UUPS | ~220 | OZ Upgradeable | New |
| RiskEngine | UUPS | ~200 | OZ Upgradeable | New |
| OsanVaultRouter | UUPS | ~200 | OZ Upgradeable | New |
| MockUSDC | ERC-20 | ~30 | OZ | Test only |

### Dependency Graph (simplified)

```
OsanVaultRouter (entry point)
  ├── AssetRegistry — asset metadata
  ├── SPVRegistry — legal ownership
  ├── ComplianceManager — KYC/AML
  ├── RevenueDistributionEngine — yield
  ├── PayoutManager — treasury payouts
  ├── LandRegistry — land parcels
  ├── CarbonRegistry — carbon projects
  ├── CarbonRetirement → CarbonRegistry — carbon retirement
  ├── Marketplace — token trading
  ├── PPPRegistry — government partnerships
  ├── MineralsModule → RevenueDistributionEngine — mineral rights
  └── RiskEngine → LandRegistry, SPVRegistry, ComplianceManager — risk scoring
```

## Security Analysis

### 1. Access Control

All contracts use OpenZeppelin AccessControlUpgradeable with role-based permissions:
- DEFAULT_ADMIN_ROLE: full admin, can grant/revoke roles
- Specialized roles per contract (VERIFIER, REGISTRAR, COMPLIANCE, etc.)
- UPGRADER_ROLE: limited to UUPS upgrade authorization only

**Finding: Secure.** Role separation follows principle of least privilege. UPGRADER_ROLE is properly isolated from other admin functions.

### 2. Upgrade Security

- All UUPS contracts call _disableInitializers() in constructor
- _authorizeUpgrade restricted to UPGRADER_ROLE
- Storage gaps (uint256[50]) allow future storage additions

**Finding: Secure.**

### 3. Reentrancy

- Marketplace.buyListing and RevenueDistributionEngine.claimRevenue use nonReentrant
- PayoutManager.executePayout uses nonReentrant
- Token transfers follow checks-effects-interactions pattern

**Finding: Secure with minor note below.**

### 4. Treasury Protections

- PayoutManager has timelock (configurable) + multi-sig approval threshold
- Only PAYOUT_CREATOR_ROLE can submit payouts
- Only PAYOUT_APPROVER_ROLE can approve
- TreasuryVault address is settable by DEFAULT_ADMIN_ROLE only

**Finding: Strong.** The multi-sig + timelock combination provides institutional-grade protection.

### 5. Oracle / Price Risks

- Marketplace uses fixed-price listings (no oracle dependency)
- No external price oracles currently integrated

**Finding: Low risk** but consider Chainlink integration for future REIT pricing.

### 6. Compliance

- ComplianceManager enforces KYC levels and investor caps
- Marketplace has complianceManager address slot for future integration
- PropertyNFT minting can check ComplianceManager

**Finding: Well-structured** for regulatory compliance.

## Gas Optimization Notes

- Using Cancun EVM with viaIR enabled (optimizer 200 runs)
- Storage gaps add ~50 slots per contract (acceptable for upgradeability)
- Consider batching frequent operations
- Marketplace fee calculation uses basis points (safe math since Solidity 0.8.x has built-in overflow checks)

## Missing Functionality

1. No on-chain oracle for asset pricing
2. No emergency pause mechanism in individual modules (except global pause)
3. No circuit breaker for marketplace
4. RevenueDistributionEngine uses simplified pro-rata model

## Upgrade Path

Contract upgrade order (if needed):
1. Deploy new implementation
2. Call upgradeTo(address) on proxy via UPGRADER_ROLE
3. Verify state migration

## Recommendations

### High Priority
1. Add emergency pause to Marketplace
2. Add rate limiting to RevenueDistributionEngine

### Medium Priority
3. Add Chainlink price feeds for REIT tokens
4. Add on-chain cap management for total protocol TVL

### Low Priority
5. Add event indexing for off-chain analytics
6. Add merkle proof-based batch distribution

## Conclusion

The architecture is well-structured for institutional deployment. The UUPS pattern, role-based access control, and multi-sig treasury provide strong security guarantees.
