import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

function parsePublicKey(value: string): PublicKey {
  if (!value) return new PublicKey(PublicKey.default);
  try { return new PublicKey(value); }
  catch { return new PublicKey(bs58.decode(value)); }
}

export interface DRIPConfig {
  rpcEndpoint: string;
  walletPath: string;
  properties: PropertyConfig[];
  minDividendThreshold: number;
  checkIntervalMs: number;
  autoReinvest: boolean;
  dryRun: boolean;
}

export interface PropertyConfig {
  propertyId: string;
  propertyAddress: string;
  minDividendUsd: number;
}

function getWalletPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "C:\\Users\\HomePC";
  return process.env.DRIP_WALLET_PATH || path.join(home, ".solana", "id.json");
}

export const config: DRIPConfig = {
  rpcEndpoint: process.env.RPC_ENDPOINT || "https://api.devnet.solana.com",
  walletPath: getWalletPath(),
  properties: [],
  minDividendThreshold: parseFloat(process.env.DRIP_MIN_THRESHOLD_USD || "10"),
  checkIntervalMs: parseInt(process.env.DRIP_CHECK_INTERVAL_MS || "86400000"),
  autoReinvest: process.env.DRIP_AUTO_REINVEST === "true",
  dryRun: process.env.DRIP_DRY_RUN !== "false",
};

export function createPublicKey(value: string): PublicKey {
  return parsePublicKey(value);
}