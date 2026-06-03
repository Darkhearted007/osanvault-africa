# ÒsánVault Africa — Architecture

## System Architecture

### Layer Diagram

```
Frontend (Next.js)
    ↕ ABIs via TypeChain
OsanVaultRouter (Stable Frontend Interface)
    ↕
┌─────────────────────────────────────────────┐
│ Core Protocol Layer                         │
│  AssetRegistry │ SPVRegistry │ Compliance   │
├─────────────────────────────────────────────┤
│ Domain Layer                                │
│  LandRegistry │ Carbon* │ Minerals │ PPP    │
├─────────────────────────────────────────────┤
│ Financial Layer                             │
│  RevenueDistribution │ PayoutManager        │
├─────────────────────────────────────────────┤
│ Market Layer                                │
│  Marketplace │ RiskEngine                   │
├─────────────────────────────────────────────┤
│ Legacy Layer                                │
│  OsanCarbon (ERC-1155)                      │
└─────────────────────────────────────────────┘
```

### Data Flow

1. User connects wallet → Frontend calls OsanVaultRouter
2. Router delegates to appropriate module contract
3. Module contracts check ComplianceManager for authorization
4. Financial operations route through RevenueDistributionEngine
5. Treasury operations go through PayoutManager with timelock
6. All operations emit events for off-chain indexing

### Upgrade Strategy

All new contracts follow UUPS upgradeable pattern:
- Proxy contract stores state, delegates to implementation
- Implementation can be replaced via upgradeTo()
- Only UPGRADER_ROLE can authorize upgrades
- Storage layout preserved via __gap arrays

### Key Design Decisions

1. **UUPS over Transparent Proxy**: Lower gas costs for users
2. **Router pattern**: Frontend has single entry point
3. **Role-based access**: Fine-grained permissions per module
4. **Dual verification**: Land requires government + indigenous approval
5. **Multi-sig treasury**: No single point of failure for funds

### Deployment Order

1. AssetRegistry
2. SPVRegistry
3. ComplianceManager
4. OsanCarbon (non-upgradeable, legacy)
5. RevenueDistributionEngine
6. PayoutManager
7. LandRegistry
8. CarbonRegistry
9. CarbonRetirement
10. Marketplace
11. PPPRegistry
12. MineralsModule
13. RiskEngine
14. OsanVaultRouter
15. Configure Router with all addresses

### Network Architecture

- Polygon Amoy (testnet): Chain ID 80002
- Polygon Mainnet (future): Chain ID 137
- Local Hardhat node: Chain ID 31337
