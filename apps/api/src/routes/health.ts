import { Router } from 'express'
import { pool } from '../db'
import { redis } from '../db/redis'

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

export default router
