import { createPublicClient, http, type Address } from "viem";
import { polygonAmoy } from "./wagmi";
import {
  OsanCarbonAbi,
  PropertyNFTAbi,
  StakingVaultAbi,
  GovernanceAbi,
  LandRegistryAbi,
} from "./abi";

// ─── Contract Addresses (Polygon Amoy Testnet) ───────────────────────────────
// Replace with deployed addresses once contracts are live on Amoy.
// IS_CONTRACT_DEPLOYED gates all wagmi reads/writes — pages fall back to mock data when false.

export const OSANCARBON_ADDRESS: Address     = "0x0000000000000000000000000000000000000000";
export const PROPERTY_NFT_ADDRESS: Address   = "0x0000000000000000000000000000000000000000";
export const STAKING_VAULT_ADDRESS: Address  = "0x0000000000000000000000000000000000000000";
export const GOVERNANCE_ADDRESS: Address     = "0x0000000000000000000000000000000000000000";
export const LAND_REGISTRY_ADDRESS: Address  = "0x0000000000000000000000000000000000000000";
export const OSANV_TOKEN_ADDRESS: Address    = "0x0000000000000000000000000000000000000000";
export const TREASURY_VAULT_ADDRESS: Address = "0x0000000000000000000000000000000000000000";
export const FEE_ROUTER_ADDRESS: Address     = "0x0000000000000000000000000000000000000000";

export const IS_CONTRACT_DEPLOYED =
  OSANCARBON_ADDRESS !== "0x0000000000000000000000000000000000000000";

// ─── Re-export ABIs ──────────────────────────────────────────────────────────
export {
  OsanCarbonAbi,
  PropertyNFTAbi,
  StakingVaultAbi,
  GovernanceAbi,
  LandRegistryAbi,
};

// ─── Wagmi contract config helpers ──────────────────────────────────────────
// Use these directly in useReadContract / useWriteContract hooks
export const OSANCARBON_CONTRACT    = { address: OSANCARBON_ADDRESS,    abi: OsanCarbonAbi }    as const;
export const PROPERTY_NFT_CONTRACT  = { address: PROPERTY_NFT_ADDRESS,  abi: PropertyNFTAbi }   as const;
export const STAKING_VAULT_CONTRACT = { address: STAKING_VAULT_ADDRESS, abi: StakingVaultAbi }  as const;
export const GOVERNANCE_CONTRACT    = { address: GOVERNANCE_ADDRESS,    abi: GovernanceAbi }    as const;
export const LAND_REGISTRY_CONTRACT = { address: LAND_REGISTRY_ADDRESS, abi: LandRegistryAbi } as const;

// ─── Public viem client (Polygon Amoy) ───────────────────────────────────────
export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http("https://rpc-amoy.polygon.technology"),
});

// ─── Utility functions ───────────────────────────────────────────────────────
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatCredits(amount: bigint): string {
  const val = Number(amount) / 1e18;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toFixed(0);
}

export const POLYGONSCAN_BASE = "https://amoy.polygonscan.com";

export function explorerTx(hash: string): string {
  return `${POLYGONSCAN_BASE}/tx/${hash}`;
}

export function explorerAddress(addr: string): string {
  return `${POLYGONSCAN_BASE}/address/${addr}`;
}

// ─── Staking tier constants (from StakingVault.sol constructor) ───────────────
export const STAKING_TIER_CONFIGS = [
  { index: 0, name: "Bronze",   aprBps: 800,  lockDays: 30,  lockSeconds: 30  * 86400 },
  { index: 1, name: "Silver",   aprBps: 1200, lockDays: 90,  lockSeconds: 90  * 86400 },
  { index: 2, name: "Gold",     aprBps: 1800, lockDays: 180, lockSeconds: 180 * 86400 },
  { index: 3, name: "Platinum", aprBps: 2200, lockDays: 365, lockSeconds: 365 * 86400 },
] as const;

// ─── Governance constants (from Governance.sol) ───────────────────────────────
export const GOVERNANCE_PARAMS = {
  proposalThreshold: 100_000n * 10n ** 18n,  // 100K OSANV
  quorum:          5_000_000n * 10n ** 18n,  // 5M OSANV
  votingPeriodDays: 7,
  timelockDays: 2,
} as const;

// ─── FeeRouter split constants (from FeeRouter.sol) ──────────────────────────
export const FEE_SPLIT = {
  treasury:   30,   // 30% → TreasuryVault
  burn:       20,   // 20% → token burn
  staking:    40,   // 40% → StakingVault rewards
  team:       10,   // 10% → team
} as const;
