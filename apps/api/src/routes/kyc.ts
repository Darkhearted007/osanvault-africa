import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { pool } from '../db/index.js'
import { logger } from '../logger.js'

const router = Router()

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(44),
      full_name: z.string().min(2).max(100),
      document_type: z.enum(['nin', 'bvn', 'passport', 'drivers_license']),
      document_number: z.string().min(5).max(20),
    })

    const { wallet_address, full_name, document_type, document_number } = Schema.parse(req.body)

    const { rows: users } = await pool.query(
      'SELECT id, kyc_status FROM users WHERE wallet_address = $1',
      [wallet_address]
    )

    let userId: string
    if (users.length === 0) {
      const newUser = await pool.query(
        `INSERT INTO users (wallet_address, role, kyc_status) 
         VALUES ($1, 'investor', 'pending') RETURNING id`,
        [wallet_address]
      )
      userId = newUser.rows[0].id
    } else {
      userId = users[0].id
      if (users[0].kyc_status === 'verified') {
        return res.status(400).json({ error: 'KYC already verified' })
      }
    }

    await pool.query(
      `INSERT INTO kyc_submissions (user_id, full_name, document_type, document_number, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [userId, full_name, document_type, document_number]
    )

    await pool.query(
      `UPDATE users SET kyc_status = 'pending', updated_at = NOW() WHERE id = $1`,
      [userId]
    )

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
       VALUES ($1, 'kyc_submit', 'user', $2, $3)`,
      [userId, JSON.stringify({ document_type }), req.ip || 'unknown']
    )

    logger.info(`KYC submitted for wallet: ${wallet_address.slice(0, 8)}...`)

    res.json({
      message: 'KYC submission received. Processing may take 24-48 hours.',
      status: 'pending'
    })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: err.errors })
    }
    logger.error(`KYC submission failed: ${err}`)
    res.status(500).json({ error: 'Failed to submit KYC' })
  }
})

router.get('/status/:wallet', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT kyc_status, created_at, updated_at 
       FROM users WHERE wallet_address = $1`,
      [req.params.wallet]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ 
      data: { 
        kyc_status: rows[0].kyc_status,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at
      } 
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch KYC status' })
  }
})

export default router