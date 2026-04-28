import { Worker } from "bullmq"
import { redis } from "../db/redis"
import { calculateYield } from "../core/financial/yieldEngine"
import { liquidityFactor } from "../core/financial/liquidityEngine"
import { getStressFactor } from "../core/financial/treasuryEngine"
import { addLedger } from "../services/ledger"

console.log("🟡 Payout worker file loaded")

export function startPayoutWorker() {
  console.log("🟢 Payout Worker STARTED")

  const worker = new Worker(
    "payout-queue",
    async (job) => {
      console.log("🧠 JOB RECEIVED:", job.data)

      const {
        userId,
        balance,
        apy,
        liabilities = 0,
        liquidity = 1,
      } = job.data

      const yieldAmount = calculateYield({
        principal: balance,
        baseApy: apy,
        liquidityFactor: liquidityFactor(liquidity, liabilities),
        riskWeight: 1,
        daysActive: 1,
        treasuryStressFactor: getStressFactor(),
      })

      await addLedger({
        userId,
        type: "CREDIT",
        token: "OSANV",
        amount: yieldAmount,
        reason: "DAILY_YIELD",
        timestamp: Date.now(),
      })

      console.log("💰 Payout executed:", userId, yieldAmount)

      return { success: true, yield: yieldAmount }
    },
    { connection: redis }
  )

  worker.on("failed", (job, err) => {
    console.error("❌ Job failed:", job?.id, err.message)
  })

  return worker
}
