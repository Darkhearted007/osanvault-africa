# ÒsánVault Africa - Security Audit Preparation

## Executive Summary

ÒsánVault Africa is a compliance-first, blockchain-based real estate tokenization platform built on Solana. This document outlines our security posture and prepares for external security audits.

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | ÒsánVault Africa |
| **Blockchain** | Solana (Anchor/Rust) |
| **Token** | OSANV (500M supply) |
| **Launch Target** | Q4 2026 |
| **Primary Market** | Nigeria (SEC ARIP Sandbox) |

---

## Smart Contracts (Audit Scope)

### 1. osanvault_core
- Platform initialization and admin functions
- Property registration and management
- Investment processing with CEI pattern
- RBAC with super_admin, admin_role, property_manager_role
- Emergency pause functionality
- Fee management (platform, withdrawal)

### 2. osanvault_lend
- Lending pool initialization
- Collateral deposit/withdrawal
- Borrow/repay functions
- **Liquidation engine** (25% threshold, 10% liquidator bonus)
- Health ratio calculation
- Oracle price integration (Pyth)

### 3. reits
- REIT creation and management
- Share issuance and transfer
- NAV (Net Asset Value) updates
- Yield distribution (configurable bps)
- Property portfolio management

### 4. minerals
- Mineral site registration
- Token minting on extraction
- Royalty payments (configurable bps)
- Transfer with automatic royalty
- Site verification and closure

### 5. carbon
- Carbon project registration
- Credit issuance (verifier only)
- Credit retirement (burn)
- Transfer with audit trail
- Project verification updates

### 6. landbank
- Land pool creation
- Land acquisition management
- Contribution tracking
- Ownership percentage calculation
- Appreciation calculation (8% annual)
- Claim and sale functions

### 7. oracle
- Pyth price feed integration
- Price with confidence intervals
- Switchboard fallback
- Multi-oracle price averaging

---

## Security Features Implemented

### Access Control
- Role-Based Access Control (RBAC) across all contracts
- Super admin, admin, property manager roles
- Multi-sig ready architecture

### Input Validation
- All numeric overflow checks (checked_add/sub)
- Parameter bounds validation
- String length and format checks
- Account existence verification

### Financial Safeguards
- Platform pause functionality
- Fee caps (max 5%)
- Liquidation thresholds
- Slippage protection

### Audit Trail
- Event logging on key actions
- Investment receipt tracking
- Transaction history in contract state

---

## Internal Testing

### Test Coverage
- **29 passing security tests** covering:
  - HMAC authentication
  - Nonce-based auth
  - Input validation
  - Circuit breaker
  - Health factor calculations
  - Dividend distribution
  - Rate limiting
  - RBAC enforcement

### Test Commands
```bash
cd programs/osanvault_core
cargo test
```

---

## Audit Recommendations

### Recommended Audit Firms

| Firm | Specialty | Estimated Cost |
|------|-----------|----------------|
| **Certik** | Blockchain/Solana | $7,000 - $15,000 |
| **Hacken** | DeFi/Crypto | $5,000 - $12,000 |
| **OtterSec** | Rust/Solana | $8,000 - $20,000 |
| **Halborn** | Blockchain | $10,000 - $25,000 |

### Audit Focus Areas

1. **Re-entrancy protection** - All external calls follow CEI pattern
2. **Overflow handling** - Using checked arithmetic throughout
3. **RBAC verification** - Role assignment and enforcement
4. **Oracle manipulation** - Price feed reliability
5. **Liquidation logic** - Edge cases in health calculations
6. **Token economics** - Supply caps, fee calculations

---

## Recent Security Work

- VPS hardening (fail2ban, UFW, SSH)
- Rate limiting on all API endpoints
- Input validation middleware
- Circuit breaker implementation
- Database hardening
- Monitoring and logging

---

## Contact for Audit Inquiries

**Primary Contact:** Olugbenga Ajayi (Founder & CEO)
- Email: Olugbenga1000@gmail.com
- Phone: +2347065056103
- Website: osanvaultafrica.com

**Technical Lead:** Available for technical calls

---

## Next Steps

1. ✅ Internal security tests (29 passing)
2. ⏳ External security audit (in progress)
3. ⏳ Mainnet deployment
4. ⏳ Bug bounty program launch
5. ⏳ Continuous security monitoring

---

*Last Updated: May 2026*
*Version: 1.0*