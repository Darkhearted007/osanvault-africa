import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import "dotenv/config";
import { config, TargetAllocation } from "./config.js";
import BN from "bn.js";

interface TokenHolding {
  mint: string;
  amount: BN;
  valueUsd: number;
  percent: number;
}

function loadWallet(): Keypair {
  if (!fs.existsSync(config.walletPath)) throw new Error(`Wallet not found: ${config.walletPath}`);
  return Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(config.walletPath, "utf-8"))));
}

class PortfolioRebalancer {
  private connection: Connection;
  private wallet: Keypair | null = null;
  private running = false;
  private checkCount = 0;

  constructor() { this.connection = new Connection(config.rpcEndpoint, "confirmed"); }

  async start() {
    console.log("═══════════════════════════════════════\n  ÒsánVault Portfolio Rebalancer\n═══════════════════════════════════════");
    console.log(`[Rebal] RPC: ${config.rpcEndpoint}`);
    console.log(`[Rebal] Targets: ${config.targets.length}`);
    console.log(`[Rebal] Threshold: ${config.thresholdPercent}%`);
    console.log(`[Rebal] Auto-rebalance: ${config.autoRebalance}`);
    console.log(`[Rebal] Dry run: ${config.dryRun}`);
    if (!config.dryRun && config.autoRebalance) { try { this.wallet = loadWallet(); console.log(`[Rebal] Wallet: ${this.wallet.publicKey}`); } catch (e) { console.error("[Rebal] Wallet load failed:", e); } }
    this.running = true;
    this.runLoop();
  }

  private runLoop() { if (!this.running) return; setTimeout(async () => { await this.checkLoop(); this.runLoop(); }, config.checkIntervalMs); }

  private async checkLoop() {
    this.checkCount++;
    console.log(`\n[Rebal] Check #${this.checkCount}`);
    const holdings = await this.getHoldings();
    const rebalanceNeeded = this.checkRebalance(holdings);
    if (rebalanceNeeded.length > 0) {
      console.log(`[Rebal] Rebalance needed: ${rebalanceNeeded.length} tokens`);
      for (const token of rebalanceNeeded) { console.log(`[Rebal]   ${token.mint}: current ${token.percent.toFixed(1)}% vs target ${token.percent.toFixed(1)}%`); }
      if (!config.dryRun && config.autoRebalance) { await this.executeRebalance(holdings); }
    } else { console.log(`[Rebal] Portfolio balanced`); }
  }

  private async getHoldings(): Promise<TokenHolding[]> {
    if (!this.wallet) return [];
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(this.wallet.publicKey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss6VQ6") });
    const holdings: TokenHolding[] = [];
    let totalValue = 0;
    for (const account of tokenAccounts.value) {
      const mint = account.account.data.parsed.info.mint;
      const amount = new BN(account.account.data.parsed.info.amount);
      if (amount.isZero()) continue;
      holdings.push({ mint, amount, valueUsd: amount.toNumber() / 1e6, percent: 0 });
      totalValue += amount.toNumber() / 1e6;
    }
    for (const h of holdings) { h.percent = totalValue > 0 ? (h.valueUsd / totalValue) * 100 : 0; }
    return holdings;
  }

  private checkRebalance(holdings: TokenHolding[]): TokenHolding[] {
    const outOfBalance: TokenHolding[] = [];
    for (const target of config.targets) {
      const holding = holdings.find(h => h.mint === target.tokenMint);
      if (!holding) continue;
      const diff = Math.abs(holding.percent - target.targetPercent);
      if (diff > config.thresholdPercent) { outOfBalance.push(holding); }
    }
    return outOfBalance;
  }

  private async executeRebalance(holdings: TokenHolding[]) { console.log(`[Rebal] Executing rebalance (simulated)`); }

  async stop() { this.running = false; console.log("[Rebal] Stopped"); }
}

async function main() {
  const rebalancer = new PortfolioRebalancer();
  process.on("SIGINT", async () => { console.log("\n[Rebal] Shutting down..."); await rebalancer.stop(); process.exit(0); });
  await rebalancer.start();
}

main().catch(console.error);