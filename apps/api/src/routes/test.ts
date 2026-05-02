import { Router } from "express";
import { payoutQueue } from "../services/queue";

const router = Router();

router.post("/yield", async (req, res) => {
  const job = await payoutQueue.add("calculate", {
    amount: 1000,
    apy: 12,
  });

  res.json({
    message: "Yield job queued",
    jobId: job.id,
  });
});

export default router;
