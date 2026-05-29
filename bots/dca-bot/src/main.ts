import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import "dotenv/config";
import { config, DCAStrategy } from "./config.js";

function loadWallet(): Keypair {
  if (!fs.existsSync(config.walletPath)) throw new Error(`Wallet not found: ${config.walletPath}`);
  return Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(config.walletPath, "utf-8"))));
}

class DCABot {
  private connection: Connection;
  private wallet: Keypair | null = null;
  private running = false;
  private checkCount = 0;

  constructor() { this.connection = new Connection(config.rpcEndpoint, "confirmed"); }

  async start() {
    console.log("═══════════════════════════════════════\n  ÒsánVault DCA Bot\n═══════════════════════════════════════");
    console.log(`[DCA] RPC: ${config.rpcEndpoint}`);
    console.log(`[DCA] Strategies: ${config.strategies.length}`);
    console.log(`[DCA] Dry run: ${config.dryRun}`);
    if (!config.dryRun) { try { this.wallet = loadWallet(); console.log(`[DCA] Wallet: ${this.wallet.publicKey}`); } catch (e) { console.error("[DCA] Wallet load failed:", e); } }
    this.running = true;
    this.runLoop();
  }

  private runLoop() { if (!this.running) return; setTimeout(async () => { await this.checkLoop(); this.runLoop(); }, config.checkIntervalMs); }

  private async checkLoop() {
    this.checkCount++;
    console.log(`\n[DCA] Check #${this.checkCount}`);
    for (const strategy of config.strategies) {
      if (this.shouldExecute(strategy)) await this.executeDCA(strategy);
    }
  }

  private shouldExecute(strategy: DCAStrategy): boolean { return (Date.now() - strategy.lastExecution) / (1000 * 60 * 60) >= strategy.intervalHours; }

  private async executeDCA(strategy: DCAStrategy) {
    if (config.dryRun) { console.log(`[DCA] DRY RUN: Would execute ${strategy.name}: ${strategy.amountPerInterval} ${strategy.fromToken} -> ${strategy.toToken}`); return; }
    console.log(`[DCA] Executing ${strategy.name}: ${strategy.amountPerInterval} ${strategy.fromToken} -> ${strategy.toToken}`);
    console.log(`[DCA] (Simulated - actual DEX integration pending)`);
  }

  async stop() { this.running = false; console.log("[DCA] Stopped"); }
}

async function main() {
  const bot = new DCABot();
  process.on("SIGINT", async () => { console.log("\n[DCA] Shutting down..."); await bot.stop(); process.exit(0); });
  await bot.start();
}

main().catch(console.error);