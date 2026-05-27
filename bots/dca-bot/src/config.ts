import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

function parsePublicKey(value: string): PublicKey {
  if (!value) return new PublicKey(PublicKey.default);
  try { return new PublicKey(value); }
  catch { return new PublicKey(bs58.decode(value)); }
}

export interface DCAConfig {
  rpcEndpoint: string;
  walletPath: string;
  strategies: DCAStrategy[];
  checkIntervalMs: number;
  dryRun: boolean;
}

export interface DCAStrategy {
  name: string;
  fromToken: string;
  toToken: string;
  amountPerInterval: number;
  intervalHours: number;
  lastExecution: number;
  maxSlippageBps: number;
}

function getWalletPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "C:\\Users\\HomePC";
  return process.env.DCA_WALLET_PATH || path.join(home, ".solana", "id.json");
}

function parseStrategies(): DCAStrategy[] {
  const json = process.env.DCA_STRATEGIES || "[]";
  try { return JSON.parse(json); } catch { return []; }
}

export const config: DCAConfig = {
  rpcEndpoint: process.env.RPC_ENDPOINT || "https://api.devnet.solana.com",
  walletPath: getWalletPath(),
  strategies: parseStrategies(),
  checkIntervalMs: parseInt(process.env.DCA_CHECK_INTERVAL_MS || "3600000"),
  dryRun: process.env.DCA_DRY_RUN !== "false",
};

export function createPublicKey(value: string): PublicKey {
  return parsePublicKey(value);
}