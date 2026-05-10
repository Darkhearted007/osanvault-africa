import { Router } from 'express'
import { pool } from '../db/index.js'
import { redis } from '../db/redis.js'
import { listCircuits } from '../middleware/circuitBreaker.js'

const router = Router()

router.get('/', async (_req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: {
      api: 'ok',
      database: 'unknown',
      redis: 'unknown',
    }
  }

  try {
    await pool.query('SELECT 1')
    checks.services.database = 'ok'
  } catch {
    checks.services.database = 'error'
  }

  try {
    await redis.ping()
    checks.services.redis = 'ok'
  } catch {
    checks.services.redis = 'error'
  }

  const allOk = Object.values(checks.services).every(s => s === 'ok')
  res.status(allOk ? 200 : 503).json(checks)
})

router.get('/circuits', (_req, res) => {
  res.json({ data: listCircuits() })
})

export default router
