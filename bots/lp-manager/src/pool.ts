import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { config, PoolConfig, createPublicKey } from "./config.js";
import BN from "bn.js";

export interface PoolState {
  name: string;
  tokenABalance: BN;
  tokenBBalance: BN;
  tokenAPrice: number;
  tokenBPrice: number;
  totalValueUsd: number;
  currentRatio: number;
}

export class PoolManager {
  private connection: Connection;
  private tokenProgramId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.tokenProgramId = createPublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss6VQ6");
  }

  async getPoolState(pool: PoolConfig): Promise<PoolState> {
    if (!pool.poolAddress) {
      return { name: pool.name, tokenABalance: new BN(0), tokenBBalance: new BN(0), tokenAPrice: 1.0, tokenBPrice: 1.0, totalValueUsd: 0, currentRatio: 0.5 };
    }
    const tokenAInfo = await this.connection.getParsedTokenAccountsByOwner(createPublicKey(pool.poolAddress), { programId: this.tokenProgramId });
    const tokenA = tokenAInfo.value.find((t) => t.account.data.parsed.info.mint === pool.tokenAMint);
    const tokenB = tokenAInfo.value.find((t) => t.account.data.parsed.info.mint === pool.tokenBMint);
    const tokenAAmount = tokenA ? new BN(tokenA.account.data.parsed.info.amount) : new BN(0);
    const tokenBAmount = tokenB ? new BN(tokenB.account.data.parsed.info.amount) : new BN(0);
    return { name: pool.name, tokenABalance: tokenAAmount, tokenBBalance: tokenBAmount, tokenAPrice: 1.0, tokenBPrice: 1.0, totalValueUsd: 0, currentRatio: 0.5 };
  }

  async checkAndRebalance(pool: PoolConfig, wallet: Keypair): Promise<{ action: string; amount: number }> {
    const state = await this.getPoolState(pool);
    const totalValue = state.tokenABalance.toNumber() + state.tokenBBalance.toNumber();
    if (totalValue < config.minLiquidityUsd) return { action: "skip", amount: 0 };
    const ratioDiff = Math.abs(state.currentRatio - pool.targetRatio);
    if (ratioDiff > pool.minRatioDiff) {
      if (config.dryRun) { console.log(`[LP] DRY RUN: Would rebalance ${pool.name} to ratio ${pool.targetRatio}`); return { action: "rebalance_dry", amount: ratioDiff }; }
      console.log(`[LP] Rebalancing ${pool.name}: ratio drift ${ratioDiff.toFixed(2)}%`);
      return { action: "rebalance", amount: ratioDiff };
    }
    return { action: "ok", amount: 0 };
  }

  async addLiquidity(pool: PoolConfig, amountA: BN, amountB: BN, wallet: Keypair): Promise<{ txid: string; success: boolean }> {
    if (config.dryRun) { console.log(`[LP] DRY RUN: Would add ${amountA.toString()} A + ${amountB.toString()} B to ${pool.name}`); return { txid: "", success: true }; }
    console.log(`[LP] Adding liquidity to ${pool.name}: ${amountA.toString()} / ${amountB.toString()}`);
    return { txid: "simulated", success: true };
  }

  async removeLiquidity(pool: PoolConfig, percentage: number, wallet: Keypair): Promise<{ txid: string; success: boolean }> {
    if (config.dryRun) { console.log(`[LP] DRY RUN: Would remove ${percentage}% from ${pool.name}`); return { txid: "", success: true }; }
    console.log(`[LP] Removing ${percentage}% liquidity from ${pool.name}`);
    return { txid: "simulated", success: true };
  }
}