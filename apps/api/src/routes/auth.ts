import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { z } from 'zod'

const router = Router()

// POST /api/auth/wallet
// Called when a wallet connects — creates or fetches the user
router.post('/wallet', async (req: Request, res: Response) => {
  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(64),
    })

    const { wallet_address } = Schema.parse(req.body)

    // Upsert user by wallet address
    const { rows } = await pool.query(
      `INSERT INTO users (wallet_address, role, kyc_status)
       VALUES ($1, 'investor', 'pending')
       ON CONFLICT (wallet_address)
       DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [wallet_address]
    )

    const user = rows[0]

    // Log the connection
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata)
       VALUES ($1, 'wallet_connect', 'user', $2)`,
      [user.id, JSON.stringify({ wallet_address })]
    )

    res.json({
      data: {
        id: user.id,
        wallet_address: user.wallet_address,
        role: user.role,
        kyc_status: user.kyc_status,
        created_at: user.created_at,
      }
    })
  } catch (err) {
    if (err instanceof Error && err.message.includes('ZodError')) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }
    res.status(500).json({ error: 'Failed to authenticate wallet' })
  }
})

// GET /api/auth/wallet/:address
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, wallet_address, role, kyc_status, created_at
       FROM users WHERE wallet_address = $1`,
      [req.params.address]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Wallet not registered' })
    }
    res.json({ data: rows[0] })
  } catch {
    res.status(500).json({ error: 'Failed to fetch wallet' })
  }
})

export default router
