import { createPublicClient, http, type Address } from "viem";
import { OsanCarbonAbi } from "./abi";
import { polygonAmoy } from "./wagmi";

export const OSANCARBON_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export const PROPERTY_NFT_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export const STAKING_VAULT_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export const GOVERNANCE_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export const OSANV_TOKEN_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";

export const IS_CONTRACT_DEPLOYED =
  OSANCARBON_ADDRESS !== "0x0000000000000000000000000000000000000000";

export { OsanCarbonAbi };

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http("https://rpc-amoy.polygon.technology"),
});

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
