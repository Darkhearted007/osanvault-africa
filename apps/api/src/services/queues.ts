import { Queue } from "bullmq"
import { redis } from "../db/redis"

export const payoutQueue = new Queue("payout-queue", {
  connection: redis,
})
