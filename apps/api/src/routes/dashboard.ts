import { Router } from 'express'
import type { Request, Response } from 'express'
import { pool } from '../db/index.js'
import { redis } from '../db/redis.js'

const router = Router()

// GET /api/dashboard/summary
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    // Try cache first (30s TTL)
    const cached = await redis.get('dashboard:summary').catch(() => null)
    if (cached) {
      return res.json({ data: JSON.parse(cached), cached: true })
    }

    const { rows } = await pool.query(`SELECT * FROM platform_summary`)
    const summary = rows[0]

    // Cache for 30 seconds
    await redis.setex('dashboard:summary', 30, JSON.stringify(summary)).catch(() => null)

    res.json({ data: summary, cached: false })
  } catch {
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// GET /api/dashboard/ledger
router.get('/ledger', async (req: Request, res: Response) => {
  try {
    const wallet = req.headers['x-wallet-address'] as string
    if (!wallet) {
      return res.status(401).json({ error: 'Wallet address required' })
    }

    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [wallet]
    )
    if (!users.length) {
      return res.json({ data: [] })
    }
    const userId = users[0].id

    const { rows } = await pool.query(`
      SELECT 
        'investment' as type,
        i.id,
        i.created_at as timestamp,
        p.title as description,
        i.amount_paid as amount,
        i.status
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1
      UNION ALL
      SELECT 
        'dividend' as type,
        d.id,
        d.distributed_at as timestamp,
        p.title as description,
        d.amount as amount,
        'confirmed' as status
      FROM dividends d
      JOIN properties p ON p.id = d.property_id
      WHERE d.user_id = $1
      ORDER BY timestamp DESC
      LIMIT 20
    `, [userId])

    res.json({ data: rows })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ledger' })
  }
})

// GET /api/dashboard/properties-overview
router.get('/properties-overview', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id, p.title, p.location, p.country,
        p.total_value, p.status, p.annual_yield,
        COUNT(cm.id) as total_milestones,
        COUNT(CASE WHEN cm.status = 'completed' THEN 1 END) as completed_milestones,
        COUNT(CASE WHEN cm.status = 'in_progress' THEN 1 END) as active_milestones,
        COALESCE(SUM(CASE WHEN cm.status IN ('completed','verified')
          THEN cm.percentage_of_total ELSE 0 END), 0) as construction_progress
      FROM properties p
      LEFT JOIN construction_milestones cm ON cm.property_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `)
    res.json({ data: rows })
  } catch {
    res.status(500).json({ error: 'Failed to fetch properties overview' })
  }
})

export default router
