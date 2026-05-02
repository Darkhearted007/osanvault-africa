import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import "dotenv/config";
import { config } from "./config.js";
import { PoolManager } from "./pool.js";

function loadWallet(): Keypair {
  const walletPath = config.walletPath;
  if (!fs.existsSync(walletPath)) throw new Error(`Wallet file not found: ${walletPath}`);
  const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(walletData));
}

class LPManager {
  private connection: Connection;
  private poolManager: PoolManager;
  private wallet: Keypair | null = null;
  private running = false;
  private checkCount = 0;

  constructor() {
    this.connection = new Connection(config.rpcEndpoint, "confirmed");
    this.poolManager = new PoolManager(this.connection);
  }

  async start() {
    console.log("═══════════════════════════════════════\n  ÒsánVault LP Manager\n═══════════════════════════════════════");
    console.log(`[Manager] RPC: ${config.rpcEndpoint}`);
    console.log(`[Manager] Pools configured: ${config.pools.length}`);
    console.log(`[Manager] Dry run: ${config.dryRun}`);
    console.log(`[Manager] Auto-rebalance: ${config.autoRebalance}`);

    if (!config.dryRun && config.autoRebalance) {
      try { this.wallet = loadWallet(); console.log(`[Manager] Wallet: ${this.wallet.publicKey.toString()}`); }
      catch (error) { console.error("[Manager] Failed to load wallet:", error); }
    } else { console.log("[Manager] Running in DRY RUN mode"); }

    this.running = true;
    this.runLoop();
  }

  async stop() { this.running = false; console.log("[Manager] Stopped"); }

  private runLoop() {
    if (!this.running) return;
    setTimeout(async () => { await this.checkLoop(); this.runLoop(); }, config.checkIntervalMs);
  }

  private async checkLoop() {
    this.checkCount++;
    console.log(`\n[Manager] Check #${this.checkCount}`);
    for (const pool of config.pools) {
      try {
        const result = await this.poolManager.checkAndRebalance(pool, this.wallet!);
        console.log(`[Manager] ${pool.name}: ${result.action} (${result.amount.toFixed(2)}%)`);
        if (result.action === "rebalance" && this.wallet) { await this.poolManager.addLiquidity(pool, new BN(1000), new BN(1000), this.wallet); }
      } catch (error) { console.error(`[Manager] Error checking ${pool.name}:`, error); }
    }
    if (this.checkCount % 10 === 0) console.log(`[Manager] Pool check completed: ${config.pools.length} pools monitored`);
  }
}

async function main() {
  const manager = new LPManager();
  process.on("SIGINT", async () => { console.log("\n[Manager] Shutting down..."); await manager.stop(); process.exit(0); });
  await manager.start();
}

main().catch(console.error);