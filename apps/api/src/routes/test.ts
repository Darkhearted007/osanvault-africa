import { Router } from 'express'
import { yieldQueue } from '../services/queues'

const router = Router()

router.post('/yield', async (req, res) => {
  const job = await yieldQueue.add('calculate', {
    amount: 1000,
    apy: 12,
  })

  res.json({
    message: 'Yield job queued',
    jobId: job.id,
  })
})

export default router
