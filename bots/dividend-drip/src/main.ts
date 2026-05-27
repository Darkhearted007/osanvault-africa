import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import "dotenv/config";
import { config, PropertyConfig } from "./config.js";
import BN from "bn.js";

interface DividendEvent {
  propertyId: string;
  amount: BN;
  timestamp: number;
  txSignature: string;
}

function loadWallet(): Keypair {
  if (!fs.existsSync(config.walletPath)) throw new Error(`Wallet not found: ${config.walletPath}`);
  return Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(config.walletPath, "utf-8"))));
}

class DividendDRIP {
  private connection: Connection;
  private wallet: Keypair | null = null;
  private running = false;
  private checkCount = 0;

  constructor() { this.connection = new Connection(config.rpcEndpoint, "confirmed"); }

  async start() {
    console.log("═══════════════════════════════════════\n  ÒsánVault Dividend DRIP\n═══════════════════════════════════════");
    console.log(`[DRIP] RPC: ${config.rpcEndpoint}`);
    console.log(`[DRIP] Properties: ${config.properties.length}`);
    console.log(`[DRIP] Min threshold: $${config.minDividendThreshold}`);
    console.log(`[DRIP] Auto-reinvest: ${config.autoReinvest}`);
    console.log(`[DRIP] Dry run: ${config.dryRun}`);
    if (!config.dryRun && config.autoReinvest) { try { this.wallet = loadWallet(); console.log(`[DRIP] Wallet: ${this.wallet.publicKey}`); } catch (e) { console.error("[DRIP] Wallet load failed:", e); } }
    this.running = true;
    this.runLoop();
  }

  private runLoop() { if (!this.running) return; setTimeout(async () => { await this.checkLoop(); this.runLoop(); }, config.checkIntervalMs); }

  private async checkLoop() {
    this.checkCount++;
    console.log(`\n[DRIP] Check #${this.checkCount}`);
    for (const property of config.properties) {
      const dividends = await this.fetchDividends(property);
      for (const dividend of dividends) { await this.processDividend(property, dividend); }
    }
  }

  private async fetchDividends(property: PropertyConfig): Promise<DividendEvent[]> {
    console.log(`[DRIP] Checking dividends for ${property.propertyId}`);
    return [];
  }

  private async processDividend(property: PropertyConfig, dividend: DividendEvent) {
    const amountUsd = dividend.amount.toNumber() / 1e6;
    if (amountUsd < config.minDividendThreshold) { console.log(`[DRIP] ${property.propertyId}: dividend $${amountUsd.toFixed(2)} below threshold`); return; }
    console.log(`[DRIP] ${property.propertyId}: new dividend $${amountUsd.toFixed(2)}`);
    if (config.dryRun || !config.autoReinvest) { console.log(`[DRIP] Would reinvest $${amountUsd.toFixed(2)} into ${property.propertyId}`); return; }
    console.log(`[DRIP] Reinvesting $${amountUsd.toFixed(2)} into ${property.propertyId}`);
  }

  async stop() { this.running = false; console.log("[DRIP] Stopped"); }
}

async function main() {
  const drip = new DividendDRIP();
  process.on("SIGINT", async () => { console.log("\n[DRIP] Shutting down..."); await drip.stop(); process.exit(0); });
  await drip.start();
}

main().catch(console.error);