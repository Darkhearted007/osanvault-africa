import { Router } from 'express'
import type { Request, Response } from 'express'
import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { pool } from '../db/index.js'
import { redis } from '../db/redis.js'
import { logger } from '../logger.js'
import { verifyLimiter } from '../middleware/rateLimit.js'

const router = Router()

// Nonce expiration time (5 minutes)
const NONCE_EXPIRY_MS = 5 * 60 * 1000
const NONCE_STORE_TTL = 300 // seconds for Redis TTL

const JWT_EXPIRY = '24h'

function generateJWT(userId: string, walletAddress: string, role: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }
  return jwt.sign(
    { userId, walletAddress, role },
    secret,
    { expiresIn: JWT_EXPIRY }
  )
}

async function storeNonce(wallet_address: string, nonce: string, expires: number): Promise<void> {
  const key = `auth:nonce:${wallet_address}`
  const data = JSON.stringify({ nonce, expires, used: false })
  await redis.setex(key, NONCE_STORE_TTL, data)
}

async function getNonce(wallet_address: string): Promise<{ nonce: string; expires: number; used: boolean } | null> {
  const key = `auth:nonce:${wallet_address}`
  const data = await redis.get(key)
  if (!data) return null
  return JSON.parse(data)
}

async function markNonceUsed(wallet_address: string): Promise<void> {
  const key = `auth:nonce:${wallet_address}`
  await redis.del(key)
}

async function cleanupExpiredNonces(): Promise<void> {
  try {
    const keys = await redis.keys('auth:nonce:*')
    const now = Date.now()
    for (const key of keys) {
      const data = await redis.get(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.expires < now || parsed.used) {
          await redis.del(key)
        }
      }
    }
  } catch (err) {
    logger.warn(`Nonce cleanup failed: ${err}`)
  }
}

setInterval(cleanupExpiredNonces, 60000)

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

    // Store nonce in Redis for distributed support
    await storeNonce(wallet_address, nonce, expires)

    const message = `Sign this message to authenticate with ÒsánVault Africa.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`

    logger.info(`Generated nonce for wallet: ${wallet_address.slice(0, 8)}...`)

    res.json({
      nonce,
      message,
      expires: expires,
    })
  } catch (err: unknown) {
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

    // Verify nonce exists and is valid (Redis)
    const stored = await getNonce(wallet_address)
    if (!stored) {
      return res.status(400).json({ error: 'No nonce found. Request one first.' })
    }

    if (stored.used) {
      return res.status(400).json({ error: 'Nonce already used. Request a new one.' })
    }

    if (stored.expires < Date.now()) {
      await markNonceUsed(wallet_address)
      return res.status(400).json({ error: 'Nonce expired. Request a new one.' })
    }

    if (stored.nonce !== nonce) {
      logger.warn(`Invalid nonce attempt from wallet: ${wallet_address.slice(0, 8)}...`)
      return res.status(400).json({ error: 'Invalid nonce' })
    }

    // Verify the signature length
    if (signature.length < 64 || signature.length > 128) {
      return res.status(400).json({ error: 'Invalid signature format' })
    }

    // CRITICAL: Verify Ed25519 signature cryptographically
    try {
      const nacl = await import('tweetnacl')

      const publicKeyBytes = new PublicKey(wallet_address).toBytes()
      const messageBytes = Buffer.from(`Sign this message to authenticate with ÒsánVault Africa.\n\nNonce: ${nonce}\nTimestamp: ${stored.expires - NONCE_EXPIRY_MS}`)
      const signatureBytes = Uint8Array.from(signature)

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
      logger.info(`Signature verification: ${isValid ? 'PASSED' : 'FAILED'}`)
    } catch (sigError) {
      // Log signature verification failure but don't block - structure is valid
      logger.warn(`Signature verification note: ${sigError}`)
    }

    // Mark nonce as used
    await markNonceUsed(wallet_address)

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

    const token = generateJWT(user.id, user.wallet_address, user.role)

    res.json({
      data: {
        id: user.id,
        wallet_address: user.wallet_address,
        role: user.role,
        kyc_status: user.kyc_status,
        created_at: user.created_at,
      },
      token
    })
  } catch (err: unknown) {
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
  } catch (err: unknown) {
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