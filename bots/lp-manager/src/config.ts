import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

function parsePublicKey(value: string): PublicKey {
  if (!value) return new PublicKey(PublicKey.default);
  try { return new PublicKey(value); }
  catch { return new PublicKey(bs58.decode(value)); }
}

export interface LPConfig {
  rpcEndpoint: string;
  walletPath: string;
  pools: PoolConfig[];
  checkIntervalMs: number;
  minLiquidityUsd: number;
  maxSlippageBps: number;
  autoRebalance: boolean;
  dryRun: boolean;
}

export interface PoolConfig {
  name: string;
  tokenAMint: string;
  tokenBMint: string;
  poolAddress: string;
  targetRatio: number;
  minRatioDiff: number;
}

function getWalletPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "C:\\Users\\HomePC";
  const defaultPath = path.join(home, ".solana", "id.json");
  return process.env.LP_WALLET_PATH || defaultPath;
}

function parsePools(): PoolConfig[] {
  const poolsJson = process.env.LP_POOLS || "[]";
  try { return JSON.parse(poolsJson); } catch { return []; }
}

export const config: LPConfig = {
  rpcEndpoint: process.env.RPC_ENDPOINT || "https://api.devnet.solana.com",
  walletPath: getWalletPath(),
  pools: parsePools(),
  checkIntervalMs: parseInt(process.env.LP_CHECK_INTERVAL_MS || "60000"),
  minLiquidityUsd: parseFloat(process.env.LP_MIN_LIQUIDITY_USD || "1000"),
  maxSlippageBps: parseInt(process.env.LP_MAX_SLIPPAGE_BPS || "50"),
  autoRebalance: process.env.LP_AUTO_REBALANCE === "true",
  dryRun: process.env.LP_DRY_RUN !== "false",
};

export function createPublicKey(value: string): PublicKey {
  return parsePublicKey(value);
}