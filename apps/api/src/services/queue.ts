import { Queue } from "bullmq"
import { redis } from "../db/redis"

export const payoutQueue = new Queue("payout-queue", {
  connection: redis,
})

// helper to add jobs cleanly
export async function addPayoutJob(data: {
  userId: string
  balance: number
  apy: number
  liabilities?: number
  liquidity?: number
}) {
  return payoutQueue.add("daily-payout", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  })
}
