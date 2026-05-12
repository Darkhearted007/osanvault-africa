import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import * as fs from "fs";
import "dotenv/config";
import { config, PoolConfig } from "./config.js";

function loadWallet(): Keypair {
  const walletPath = config.walletPath;
  if (!fs.existsSync(walletPath)) throw new Error(`Wallet file not found: ${walletPath}`);
  const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(walletData));
}

interface RebalanceResult {
  action: string;
  amount: number;
}

class PoolManager {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async checkAndRebalance(pool: PoolConfig, _wallet: Keypair | null): Promise<RebalanceResult> {
    const targetRatio = pool.targetRatio / 100;
    const minRatioDiff = pool.minRatioDiff / 100;

    const ownerPubkey = _wallet ? _wallet.publicKey : PublicKey.default;

    try {
      const tokenAAccounts = await this.connection.getTokenAccountsByOwner(
        ownerPubkey,
        { mint: new PublicKey(pool.tokenAMint) }
      );
      const tokenBAccounts = await this.connection.getTokenAccountsByOwner(
        ownerPubkey,
        { mint: new PublicKey(pool.tokenBMint) }
      );

      const balanceA = tokenAAccounts.value.length > 0
        ? Number((tokenAAccounts.value[0].account.data as unknown as { parsed: { info: { amount: string } } }).parsed.info.amount) / 1e6
        : 0;
      const balanceB = tokenBAccounts.value.length > 0
        ? Number((tokenBAccounts.value[0].account.data as unknown as { parsed: { info: { amount: string } } }).parsed.info.amount) / 1e6
        : 0;

      const totalValue = balanceA + balanceB;
      if (totalValue === 0) return { action: 'no_position', amount: 0 };

      const currentRatio = balanceA / totalValue;
      const diff = Math.abs(currentRatio - targetRatio);

      if (diff <= minRatioDiff) return { action: 'balanced', amount: diff * 100 };
      if (currentRatio > targetRatio) return { action: 'rebalance', amount: diff * 100 };
      return { action: 'rebalance', amount: diff * 100 };
    } catch {
      return { action: 'error', amount: 0 };
    }
  }

  async addLiquidity(_pool: PoolConfig, _amountA: BN, _amountB: BN, _wallet: Keypair): Promise<void> {
    console.log(`[Pool] Adding liquidity (simulated): ${_amountA.toString()} + ${_amountB.toString()}`);
    console.log(`[Pool] NOTE: Actual liquidity provision requires Raydium/Orca SDK integration`);
  }

  async removeLiquidity(_pool: PoolConfig, _lpAmount: BN, _wallet: Keypair): Promise<void> {
    console.log(`[Pool] Removing liquidity (simulated): ${_lpAmount.toString()}`);
  }
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
        if (result.action === "rebalance" && this.wallet) {
          await this.poolManager.addLiquidity(pool, new BN(1000), new BN(1000), this.wallet);
        }
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