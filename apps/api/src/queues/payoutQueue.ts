import { Queue } from "bullmq"
import { redis } from "../db/redis"

export const payoutQueue = new Queue("payout-queue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
})

export async function enqueuePayoutJob(data: {
  userId: string
  balance: number
  apy: number
  liquidity?: number
  liabilities?: number
}) {
  return await payoutQueue.add("daily-payout", {
    ...data,
    liquidity: data.liquidity ?? 1,
    liabilities: data.liabilities ?? 0,
  })
}
