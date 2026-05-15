import { Worker } from "bullmq"
import { redis } from "../db/redis.js"
import { calculateYield } from "../core/financial/yieldEngine.js"
import { liquidityFactor } from "../core/financial/liquidityEngine.js"
import { getStressFactor } from "../core/financial/treasuryEngine.js"
import { addLedger } from "../services/ledger.js"
import { logger } from "../logger.js"

console.log("🟡 Payout worker file loaded")

const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000

function getRetryDelay(attempt: number): number {
  return Math.min(RETRY_DELAY_BASE * Math.pow(2, attempt), 30000)
}

export function startPayoutWorker() {
  console.log("🟢 Payout Worker STARTED")

  const worker = new Worker(
    "payout-queue",
    async (job) => {
      logger.info(`Processing payout job: ${job.id}`)

      try {
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

        logger.info(`Payout completed for user ${userId}: ${yieldAmount}`)

        return { success: true, yield: yieldAmount }
      } catch (error) {
        logger.error(`Payout job ${job.id} failed:`, error)
        throw error
      }
    },
    {
      connection: redis,
      concurrency: 5,
      maxRetriesPerCycle: MAX_RETRIES,
    }
  )

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed permanently:`, err.message)
  })

  worker.on("closed", () => {
    logger.warn("Payout worker connection closed, attempting restart...")
    setTimeout(() => startPayoutWorker(), getRetryDelay(0))
  })

  return worker
}
