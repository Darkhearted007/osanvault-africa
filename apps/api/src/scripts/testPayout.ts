import { Queue } from "bullmq"
import { redis } from "../db/redis"

const queue = new Queue("payout-queue", {
  connection: redis,
})

async function run() {
  await queue.add("test-payout", {
    userId: "user_001",
    balance: 1000,
    apy: 12,
    liquidity: 0.8,
    liabilities: 200
  })

  console.log("🚀 Test payout job injected")
}

run()
