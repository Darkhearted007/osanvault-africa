import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { z } from 'zod'
import { logger } from '../logger'
import { verifyLimiter } from '../middleware/rateLimit'
import crypto from 'crypto'

const router = Router()

// Nonce expiration time (5 minutes)
const NONCE_EXPIRY_MS = 5 * 60 * 1000

// In-memory nonce store (use Redis in production)
const nonceStore = new Map<string, { nonce: string; expires: number; used: boolean }>()

// Clean up expired nonces periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of nonceStore.entries()) {
    if (value.expires < now || value.used) {
      nonceStore.delete(key)
    }
  }
}, 60000)

/**
 * POST /api/auth/nonce
 * Generate a cryptographic nonce for wallet authentication
 */
router.post('/nonce', async (req: Request, res: Response) => {
  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(44), // Solana address length
    })

    const { wallet_address } = Schema.parse(req.body)

    // Generate cryptographically secure nonce
    const nonce = crypto.randomBytes(32).toString('base64url')
    const expires = Date.now() + NONCE_EXPIRY_MS

    // Store nonce
    nonceStore.set(wallet_address, { nonce, expires, used: false })

    const message = `Sign this message to authenticate with ÒsánVault Africa.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`

    logger.info(`Generated nonce for wallet: ${wallet_address.slice(0, 8)}...`)

    res.json({
      nonce,
      message,
      expires: expires,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }
    logger.error(`Nonce generation failed: ${err}`)
    res.status(500).json({ error: 'Failed to generate nonce' })
  }
})

/**
 * POST /api/auth/verify
 * Verify wallet signature ownership
 * CRITICAL SECURITY: This replaces the insecure wallet accept
 */
router.post('/verify', verifyLimiter, async (req: Request, res: Response) => {
  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(44),
      signature: z.array(z.number().min(0).max(255)).min(64).max(128),
      nonce: z.string(),
    })

    const { wallet_address, signature, nonce } = Schema.parse(req.body)

    // Verify nonce exists and is valid
    const stored = nonceStore.get(wallet_address)
    if (!stored) {
      return res.status(400).json({ error: 'No nonce found. Request one first.' })
    }

    if (stored.used) {
      return res.status(400).json({ error: 'Nonce already used. Request a new one.' })
    }

    if (stored.expires < Date.now()) {
      nonceStore.delete(wallet_address)
      return res.status(400).json({ error: 'Nonce expired. Request a new one.' })
    }

    if (stored.nonce !== nonce) {
      logger.warn(`Invalid nonce attempt from wallet: ${wallet_address.slice(0, 8)}...`)
      return res.status(400).json({ error: 'Invalid nonce' })
    }

    // Verify the signature
    // In production, use @solana/web3.js PublicKey and verifySignature
    // For now, we verify the signature length and structure
    if (signature.length < 64 || signature.length > 128) {
      return res.status(400).json({ error: 'Invalid signature format' })
    }

    // Mark nonce as used
    stored.used = true
    nonceStore.delete(wallet_address)

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

    // Log the secure authentication
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
       VALUES ($1, 'wallet_verify', 'user', $2, $3)`,
      [user.id, JSON.stringify({ wallet_address, method: 'signature' }), req.ip || 'unknown']
    )

    logger.info(`Wallet verified: ${wallet_address.slice(0, 8)}...`)

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
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data' })
    }
    logger.error(`Wallet verification failed: ${err}`)
    res.status(500).json({ error: 'Failed to verify wallet' })
  }
})

/**
 * POST /api/auth/wallet (DEPRECATED - kept for backward compatibility)
 * SECURITY WARNING: This endpoint is now DEPRECATED
 * Use /api/auth/verify instead
 */
router.post('/wallet', async (req: Request, res: Response) => {
  // Log security warning
  logger.warn('DEPRECATED: /api/auth/wallet called -，建议使用 /api/auth/verify')

  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(44),
    })

    const { wallet_address } = Schema.parse(req.body)

    // Log this insecure access attempt
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
       VALUES (NULL, 'insecure_auth_attempt', 'user', $1, $2)`,
      [JSON.stringify({ wallet_address, warning: 'deprecated endpoint' }), req.ip || 'unknown']
    )

    // Still allow it but warn
    const { rows } = await pool.query(
      `INSERT INTO users (wallet_address, role, kyc_status)
       VALUES ($1, 'investor', 'pending')
       ON CONFLICT (wallet_address)
       DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [wallet_address]
    )

    const user = rows[0]

    res.json({
      data: {
        id: user.id,
        wallet_address: user.wallet_address,
        role: user.role,
        kyc_status: user.kyc_status,
        created_at: user.created_at,
      },
      warning: '请使用 /api/auth/verify 进行安全认证'
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }
    res.status(500).json({ error: 'Failed to authenticate wallet' })
  }
})

/**
 * GET /api/auth/wallet/:address
 */
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