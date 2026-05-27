import { Router } from "express";
import { verifyQueueAuth } from "../middleware/verifyQueueAuth.js";
import { enqueuePayoutJob } from "../services/queue.js";

const router = Router();

router.post("/request-payout", verifyQueueAuth, async (req, res) => {
  try {
    const { userId, balance, apy } = req.body;

    if (!userId || !balance) {
      return res.status(400).json({ error: "missing fields" });
    }

    const job = await enqueuePayoutJob({
      userId,
      balance,
      apy: apy || 12
    });

    return res.json({
      success: true,
      jobId: job.id
    });
  } catch {
    return res.status(500).json({ error: "queue failed" });
  }
});

export default router;
