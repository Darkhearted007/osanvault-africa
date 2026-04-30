import { Router } from "express"
import { z } from "zod"
import { requireAuthenticated } from "../middleware/rbac"
import { logger } from "../logger"
import { pool } from "../db"

const router = Router()

const RebalanceSchema = z.object({
  wallet_address: z.string().min(32).max(44),
  target_allocation: z.record(z.string(), z.number().min(0).max(1)),
  threshold: z.number().min(0.01).max(0.5).default(0.05),
})

router.post("/rebalance", requireAuthenticated(), async (req, res) => {
  try {
    const params = RebalanceSchema.parse(req.body)

    const allocSum = Object.values(params.target_allocation).reduce((s, v) => s + v, 0)
    if (Math.abs(allocSum - 1) > 0.001) {
      return res.status(400).json({
        error: "Allocation must sum to 1.0",
        actual_sum: allocSum,
      })
    }

    const { rows } = await pool.query(
      `SELECT property_id, tokens_purchased
       FROM investments
       WHERE user_id = $1 AND status = 'confirmed'`,
      [req.headers["x-user-id"]]
    )

    if (!rows.length) {
      return res.status(400).json({ error: "No active investments" })
    }

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata)
       VALUES ($1, 'rebalance_requested', 'portfolio', $2)`,
      [req.headers["x-user-id"], JSON.stringify(params)]
    )

    res.json({
      success: true,
      investments_found: rows.length,
      rebalance_triggered: true,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid parameters", details: err.errors })
    }
    res.status(500).json({ error: "Rebalance failed" })
  }
})

router.get("/allocation", requireAuthenticated(), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT i.property_id, p.title, i.tokens_purchased,
       ROUND(i.tokens_purchased * 1.0 / NULLIF(
         (SELECT SUM(tokens_purchased) FROM investments WHERE user_id = $1 AND status = 'confirmed'), 0
       ), 4) as percentage
     FROM investments i
     JOIN properties p ON p.id = i.property_id
     WHERE i.user_id = $1 AND i.status = 'confirmed'
     ORDER BY i.created_at DESC`,
    [req.headers["x-user-id"]]
  )
  res.json({ data: rows })
})

export default router