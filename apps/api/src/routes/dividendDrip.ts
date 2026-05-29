import { Router } from "express"
import { requireAdmin } from "../middleware/rbac.js"
import { logger } from "../logger.js"
import { pool } from "../db/index.js"

const router = Router()

router.post("/distribute", requireAdmin(), async (req, res) => {
  const { property_id, amount, tx_signature } = req.body

  if (!property_id || !amount) {
    return res.status(400).json({ error: "property_id and amount are required" })
  }

  if (tx_signature && (tx_signature.length < 64 || tx_signature.length > 128)) {
    return res.status(400).json({ error: "Invalid transaction signature format" })
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const { rows: investors } = await client.query(
      `SELECT DISTINCT i.user_id, i.tokens_purchased
       FROM investments i
       WHERE i.property_id = $1 AND i.status = 'confirmed'`,
      [property_id]
    )

    if (!investors.length) {
      return res.status(400).json({ error: "No active investors for this property" })
    }

    const totalTokens = investors.reduce((s: number, r: { tokens_purchased: number }) => s + r.tokens_purchased, 0)
    const dividendRecords = investors.map((inv: { user_id: string; tokens_purchased: number }) => ({
      user_id: inv.user_id,
      tokens_purchased: inv.tokens_purchased,
      share: inv.tokens_purchased / totalTokens,
      amount: (inv.tokens_purchased / totalTokens) * amount,
    }))

    for (const div of dividendRecords) {
      await client.query(
        `INSERT INTO dividends
          (property_id, user_id, amount, tx_signature)
         VALUES ($1, $2, $3, $4)`,
        [property_id, div.user_id, div.amount, tx_signature || null]
      )
    }

    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'dividend_distributed', 'property', $2, $3)`,
      [req.headers["x-user-id"], property_id, JSON.stringify({
        investor_count: dividendRecords.length,
        total_amount: amount,
        tx_signature,
      })]
    )

    await client.query("COMMIT")

    logger.info(`Dividend distributed to ${dividendRecords.length} investors for property ${property_id}`)

    res.json({
      success: true,
      investor_count: dividendRecords.length,
      total_amount: amount,
    })
  } catch (err: unknown) {
    await client.query("ROLLBACK")
    logger.error(`Dividend distribution failed: ${err}`)
    res.status(500).json({ error: "Dividend distribution failed" })
  } finally {
    client.release()
  }
})

router.get("/history/:propertyId", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT d.id, d.user_id, d.amount, d.tx_signature, d.distributed_at
     FROM dividends d WHERE d.property_id = $1
     ORDER BY d.distributed_at DESC`,
    [req.params.propertyId]
  )
  res.json({ data: rows })
})

export default router