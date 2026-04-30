import { Router } from "express"
import { z } from "zod"
import { requireAuthenticated } from "../middleware/rbac"
import { logger } from "../logger"
import { pool } from "../db"

const router = Router()

const DCAPlanSchema = z.object({
  wallet_address: z.string().min(32).max(44),
  asset: z.string().min(1).max(20),
  amount_per_trade: z.number().positive(),
  frequency_hours: z.number().int().min(1).max(8760),
  total_trades: z.number().int().min(1).max(365),
})

router.post("/plan", requireAuthenticated(), async (req, res) => {
  try {
    const plan = DCAPlanSchema.parse(req.body)

    const { rows } = await pool.query(
      `INSERT INTO dca_plans
        (user_id, wallet_address, asset, amount_per_trade, frequency_hours, total_trades, remaining_trades)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING *`,
      [req.headers["x-user-id"], plan.wallet_address, plan.asset,
       plan.amount_per_trade, plan.frequency_hours, plan.total_trades]
    )

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'dca_plan_created', 'dca_plan', $2, $3)`,
      [req.headers["x-user-id"], rows[0].id, JSON.stringify(plan)]
    )

    res.status(201).json({ data: rows[0] })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors })
    }
    res.status(500).json({ error: "Failed to create DCA plan" })
  }
})

router.get("/plans", requireAuthenticated(), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, asset, amount_per_trade, frequency_hours, total_trades, remaining_trades, status, created_at
     FROM dca_plans WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.headers["x-user-id"]]
  )
  res.json({ data: rows })
})

router.delete("/plan/:id", requireAuthenticated(), async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE dca_plans SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.headers["x-user-id"]]
  )
  if (!rows.length) {
    return res.status(404).json({ error: "Plan not found" })
  }
  res.json({ success: true })
})

export default router