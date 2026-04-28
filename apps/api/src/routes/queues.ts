import { Router } from "express"
import { verifyQueueAuth } from "../middleware/verifyQueueAuth"
import { enqueuePayoutJob } from "../services/queue"

const router = Router()

// ❌ PUBLIC ENDPOINT DISABLED (safe guard)
router.post("/payout", async (req, res) => {
  return res.status(403).json({
    error: "Disabled external access"
  })
})

// ✅ INTERNAL SECURE ENDPOINT
router.post("/request-payout", verifyQueueAuth, async (req, res) => {
  try {
    const { userId, balance, apy } = req.body

    if (!userId || !balance) {
      return res.status(400).json({
        error: "userId and balance are required"
      })
    }

    const job = await enqueuePayoutJob({
      userId,
      balance,
      apy: apy || 12,
    })

    return res.json({
      success: true,
      message: "Payout job queued",
      jobId: job.id,
    })

  } catch (err) {
    return res.status(500).json({
      error: "Failed to queue payout"
    })
  }
})

export default router
