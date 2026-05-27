import { Queue } from "bullmq";
import { redis } from "../db/redis.js";

export type PayoutJobData = {
  userId: string;
  balance: number;
  apy: number;
  liabilities?: number;
  liquidity?: number;
};

export const payoutQueue = new Queue<PayoutJobData>("payout-queue", {
  connection: redis,
});

// main safe API (use this everywhere)
export function enqueuePayoutJob(data: PayoutJobData) {
  return payoutQueue.add("daily-payout", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  });
}
