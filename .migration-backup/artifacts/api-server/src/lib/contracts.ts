// Shared contract configuration for the API server.
// Mirrors artifacts/osanvault/src/lib/contract.ts — kept in sync manually.
// When contracts are deployed, update these addresses and flip IS_CONTRACT_DEPLOYED.

export const OSANCARBON_ADDRESS     = "0x0000000000000000000000000000000000000000";
export const PROPERTY_NFT_ADDRESS   = "0x0000000000000000000000000000000000000000";
export const STAKING_VAULT_ADDRESS  = "0x0000000000000000000000000000000000000000";
export const GOVERNANCE_ADDRESS     = "0x0000000000000000000000000000000000000000";
export const LAND_REGISTRY_ADDRESS  = "0x0000000000000000000000000000000000000000";
export const OSANV_TOKEN_ADDRESS    = "0x0000000000000000000000000000000000000000";
export const TREASURY_VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
export const FEE_ROUTER_ADDRESS     = "0x0000000000000000000000000000000000000000";

export const IS_CONTRACT_DEPLOYED =
  OSANCARBON_ADDRESS !== "0x0000000000000000000000000000000000000000";

export const CHAIN_ID = 80002; // Polygon Amoy Testnet
export const RPC_URL = "https://rpc-amoy.polygon.technology";
export const POLYGONSCAN_BASE = "https://amoy.polygonscan.com";

// ─── Staking tier constants (from StakingVault.sol constructor) ───────────────
export const STAKING_TIER_CONFIGS = [
  { index: 0, name: "Bronze",   aprBps: 800,  lockDays: 30,  lockSeconds: 30  * 86400 },
  { index: 1, name: "Silver",   aprBps: 1200, lockDays: 90,  lockSeconds: 90  * 86400 },
  { index: 2, name: "Gold",     aprBps: 1800, lockDays: 180, lockSeconds: 180 * 86400 },
  { index: 3, name: "Platinum", aprBps: 2200, lockDays: 365, lockSeconds: 365 * 86400 },
] as const;

// ─── Governance constants (from Governance.sol) ───────────────────────────────
export const GOVERNANCE_PARAMS = {
  proposalThresholdWei: BigInt("100000000000000000000000"),  // 100K OSANV
  quorumWei:          BigInt("5000000000000000000000000"),   // 5M OSANV
  votingPeriodDays: 7,
  timelockDays: 2,
} as const;

// ─── FeeRouter split (from FeeRouter.sol) ────────────────────────────────────
export const FEE_SPLIT = {
  treasury: 30,
  burn:     20,
  staking:  40,
  team:     10,
} as const;
