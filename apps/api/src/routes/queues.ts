import { Router } from "express"
import { Queue } from "bullmq"
import { redis } from "../db/redis"

const router = Router()

const payoutQueue = new Queue("payout-queue", {
  connection: redis,
})

router.post("/payout", async (req, res) => {
  const { userId, balance, apy, liabilities, liquidity } = req.body

  await payoutQueue.add("payout-job", {
    userId,
    balance,
    apy,
    liabilities,
    liquidity,
  })

  res.json({
    success: true,
    message: "Payout job queued",
  })
})

export default router
