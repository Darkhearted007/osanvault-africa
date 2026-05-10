import { Router } from "express";
import { payoutQueue } from "../services/queue.js";

const router = Router();

router.post("/yield", async (req, res) => {
  const job = await payoutQueue.add("calculate", {
    userId: "test_user",
    balance: 1000,
    apy: 12,
  });

  res.json({
    message: "Yield job queued",
    jobId: job.id,
  });
});

export default router;
