import { Router } from "express"
import { z } from "zod"
import { requireAdmin } from "../middleware/rbac"
import { logger } from "../logger"
import { pool } from "../db"

const router = Router()

const LiquidityParamsSchema = z.object({
  pool_address: z.string().min(32).max(64),
  target_ratio: z.number().min(0.01).max(0.5),
  min_trade: z.number().min(0.001),
  max_trade: z.number().min(1),
})

router.post("/rebalance", requireAdmin(), async (req, res) => {
  try {
    const params = LiquidityParamsSchema.parse(req.body)
    logger.info(`LP rebalance triggered for pool ${params.pool_address.slice(0, 8)}...`)

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata)
       VALUES ($1, 'lp_rebalance', 'pool', $2)`,
      [req.headers["x-user-id"], JSON.stringify(params)]
    )

    res.json({ success: true, pool: params.pool_address })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid parameters", details: err.errors })
    }
    res.status(500).json({ error: "Rebalance failed" })
  }
})

router.get("/status", async (_req, res) => {
  const result = await pool.query(`
    SELECT pool_address, target_ratio, status, updated_at
    FROM lp_positions ORDER BY updated_at DESC LIMIT 50
  `)
  res.json({ data: result.rows })
})

export default router