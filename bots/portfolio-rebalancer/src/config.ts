import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

function parsePublicKey(value: string): PublicKey {
  if (!value) return new PublicKey(PublicKey.default);
  try { return new PublicKey(value); }
  catch { return new PublicKey(bs58.decode(value)); }
}

export interface RebalancerConfig {
  rpcEndpoint: string;
  walletPath: string;
  targets: TargetAllocation[];
  thresholdPercent: number;
  checkIntervalMs: number;
  autoRebalance: boolean;
  dryRun: boolean;
}

export interface TargetAllocation {
  tokenMint: string;
  targetPercent: number;
}

function getWalletPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "C:\\Users\\HomePC";
  return process.env.REBAL_WALLET_PATH || path.join(home, ".solana", "id.json");
}

function parseTargets(): TargetAllocation[] {
  const json = process.env.REBAL_TARGETS || "[]";
  try { return JSON.parse(json); } catch { return []; }
}

export const config: RebalancerConfig = {
  rpcEndpoint: process.env.RPC_ENDPOINT || "https://api.devnet.solana.com",
  walletPath: getWalletPath(),
  targets: parseTargets(),
  thresholdPercent: parseFloat(process.env.REBAL_THRESHOLD_PERCENT || "5"),
  checkIntervalMs: parseInt(process.env.REBAL_CHECK_INTERVAL_MS || "3600000"),
  autoRebalance: process.env.REBAL_AUTO_REBALANCE === "true",
  dryRun: process.env.REBAL_DRY_RUN !== "false",
};

export function createPublicKey(value: string): PublicKey {
  return parsePublicKey(value);
}