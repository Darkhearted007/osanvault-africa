# Security Fixes Log — OsanVault Africa

**Date:** 2026-06-03  
**Branch:** `security/router-fixes`  
**Commit:** `2d8fc42`

## Fixes Applied

### 1. **OsanVaultRouter Call Safety (HIGH)**

#### Issue
Raw `.call()` invocations without proper return data validation could silently fail and mask errors, leading to:
- Failed transactions appearing successful
- Loss of user funds without detection
- Untraced state inconsistencies

**Affected Functions:**
- `buyProperty()` (line 116-127)
- `claimYield()` (line 131-137)
- `retireCarbonCredits()` (line 169-183)

#### Fix Applied
```solidity
// BEFORE: Ignored return data
(bool success, ) = marketplace_.call(...);
require(success, "buy failed");

// AFTER: Properly decode return data
(bool success, bytes memory data) = marketplace_.call(...);
require(success, "buy failed");
if (data.length > 0) {
    (bool result) = abi.decode(data, (bool));
    require(result, "marketplace operation failed");
}
```

**Impact:** Enables detection of contract-level failures even when the low-level call succeeds.

---

### 2. **Broken View Functions Removed (MEDIUM)**

#### Issue
Two functions existed but always reverted with unhelpful messages:
- `getAsset()` — received proper return data but then reverted
- `getPortfolio()` — reverted unconditionally

These created false API contracts and confusing error messages.

#### Fix Applied
Removed both functions entirely. Users must call `AssetRegistry.getAsset()` and individual contract methods directly.

**Rationale:** Router is an entry point for state-changing operations, not read-only queries. Queries should go directly to source contracts.

---

### 3. **Input Validation Hardening (MEDIUM)**

Added zero-checks to all router functions:
- `buyProperty()`: validates `marketplace_`, `listingId_`, `amount_`
- `claimYield()`: validates `revenueDistributionEngine`, `revenueId_`
- `retireCarbonCredits()`: validates `projectId_`, `amount_`, `reason_` non-empty

---

### 4. **Unused Parameter Cleanup (LOW)**

Silenced compiler warnings on `buyProperty()` unused parameters by explicitly removing parameter names (kept for API compatibility).

---

## Compilation & Testing

✅ **Compilation:** Successful (65 contracts)  
✅ **Tests:** All passing  
✅ **Warnings:** Only OZ transient storage warnings (expected and safe)

---

## Migration Path

### Option A: Merge PR into Osanvault (Recommended)
```bash
# Will trigger CI on GitHub
gh pr create --base Osanvault --head security/router-fixes \
  --title "fix: OsanVaultRouter call safety & API cleanup" \
  --body "See SECURITY_FIXES_LOG.md for details"
```

### Option B: Force-merge into Osanvault (Direct)
```bash
git checkout Osanvault
git merge --ff-only security/router-fixes
git push osanvault-africa Osanvault
```

---

## Remaining High-Priority Issues

Not fixed (out of scope for this session):
1. **Marketplace compliance check** — Integrate RiskEngine into `buyListing()`
2. **Smart contract audit** — Full security review recommended before mainnet
3. **Backend API** — Still missing entirely (planned separately)

---

## Files Changed

- `contracts/OsanVaultRouter.sol` — Main fixes here

All other files committed for completeness (tests, frontend, docs).

---

## Next Steps

1. Review PR on GitHub
2. Run full test suite in CI
3. Merge to Osanvault branch
4. Deploy to Amoy testnet for validation
