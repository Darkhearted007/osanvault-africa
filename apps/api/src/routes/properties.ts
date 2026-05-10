import { Router } from 'express'
import type { Request, Response } from 'express'
import { pool } from '../db/index.js'
import { z } from 'zod'
import { requireAdmin, requirePropertyManager } from '../middleware/rbac.js'
import { verifyQueueAuth } from '../middleware/verifyQueueAuth.js'
import { logger } from '../logger.js'

const router = Router()

// Input validation schema
const PropertySchema = z.object({
  title: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  country: z.string().min(1).max(100),
  total_value: z.number().positive(),
  token_price: z.number().positive(),
  total_tokens: z.number().int().positive(),
  annual_yield: z.number().min(0).max(100).optional(),
  ipfs_hash: z.string().max(100).optional(),
})

// Query validation - prevent SQL injection
const CountrySchema = z.enum(['Nigeria', 'Ghana', 'Kenya', 'SouthAfrica'])

// GET /api/properties - Publicly accessible
router.get('/', async (req: Request, res: Response) => {
  try {
    // Validate and sanitize pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 20))
    const offset = (page - 1) * limit
    
    // Validate country filter to prevent SQL injection
    let countryFilter = ''
    const params: any[] = []
    
    if (req.query.country) {
      try {
        CountrySchema.parse(req.query.country)
        countryFilter = ' WHERE country = $1'
        params.push(req.query.country)
      } catch {
        // Invalid country, ignore it
        logger.warn(`Invalid country filter: ${req.query.country}`)
      }
    }

    const countQuery = `SELECT COUNT(*) FROM properties${countryFilter}`
    const [rows, count] = await Promise.all([
      pool.query(
        `SELECT * FROM properties${countryFilter} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      pool.query(countQuery, params)
    ])

    res.json({
      data: rows.rows,
      meta: {
        total: parseInt(count.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(count.rows[0].count) / limit)
      }
    })
  } catch (err: unknown) {
    logger.error(`Property fetch error: ${err}`)
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
})

// GET /api/properties/:id - Publicly accessible
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
        COALESCE(SUM(i.tokens_purchased), 0) as tokens_sold,
        COUNT(DISTINCT i.user_id) as investor_count
       FROM properties p
       LEFT JOIN investments i ON i.property_id = p.id AND i.status = 'confirmed'
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Property not found' })
    res.json({ data: rows[0] })
  } catch (err: unknown) {
    logger.error(`Property fetch error: ${err}`)
    res.status(500).json({ error: 'Failed to fetch property' })
  }
})

// POST /api/properties - Requires Admin or Property Manager
router.post('/', requirePropertyManager(), async (req: Request, res: Response) => {
  try {
    const body = PropertySchema.parse(req.body)
    
    const { rows } = await pool.query(
      `INSERT INTO properties
        (title, location, country, total_value, token_price, total_tokens, annual_yield, ipfs_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [body.title, body.location, body.country, body.total_value,
       body.token_price, body.total_tokens, body.annual_yield ?? null,
       body.ipfs_hash ?? null]
    )
    
    const userId = req.headers['x-user-id']
    if (userId) {
      await pool.query(
        `INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata, ip_address)
         VALUES ($1, 'property_create', 'property', $2, $3, $4)`,
        [userId, rows[0].id, JSON.stringify({ title: body.title }), req.ip || 'unknown']
      )
    }
    
    res.status(201).json({ data: rows[0] })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    logger.error(`Property creation error: ${err}`)
    res.status(500).json({ error: 'Failed to create property' })
  }
})

// PATCH /api/properties/:id/status - Requires Admin only
router.patch('/:id/status', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    const valid = ['pending', 'active', 'fully_funded', 'closed']
    
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` })
    }
    
    const { rows } = await pool.query(
      `UPDATE properties SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    )
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Property not found' })
    }
    
    const userId = req.headers['x-user-id']
    if (userId) {
      await pool.query(
        `INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata, ip_address)
         VALUES ($1, 'property_status_change', 'property', $2, $3, $4)`,
        [userId, rows[0].id, JSON.stringify({ old_status: 'unknown', new_status: status }), req.ip || 'unknown']
      )
    }
    
    res.json({ data: rows[0] })
  } catch (err: unknown) {
    logger.error(`Property status update error: ${err}`)
    res.status(500).json({ error: 'Failed to update property status' })
  }
})

// POST /api/properties/ingest - Requires Admin + Queue signature (internal bot auth)
router.post('/ingest', verifyQueueAuth, requireAdmin(), async (req: Request, res: Response) => {
  try {
    const ScrapedPropertySchema = z.object({
      title: z.string(),
      location: z.string(),
      country: z.string(),
      total_value_usd: z.number(),
    })
    
    const body = z.array(ScrapedPropertySchema).parse(req.body)
    
    // Use transaction for batch insert
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      const results = []
      
      for (const item of body) {
        const tokenPrice = 10
        const totalTokens = Math.floor(item.total_value_usd / tokenPrice)
        
        const { rows } = await client.query(
          `INSERT INTO properties
            (title, location, country, total_value, token_price, total_tokens, status)
           VALUES ($1,$2,$3,$4,$5,$6,'pending')
           RETURNING id, title, status`,
          [item.title, item.location, item.country, item.total_value_usd, tokenPrice, totalTokens]
        )
        results.push(rows[0])
      }
      
      await client.query('COMMIT')
      
      const userId = req.headers['x-user-id']
      if (userId) {
        await pool.query(
          `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
           VALUES ($1, 'property_batch_ingest', 'property', NULL, $2, $3)`,
          [userId, JSON.stringify({ count: results.length }), req.ip || 'unknown']
        )
      }
      
      res.status(201).json({ 
        success: true, 
        ingested_count: results.length,
        data: results 
      })
    } catch (err: unknown) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    logger.error(`Property ingest error: ${err}`)
    res.status(500).json({ error: 'Failed to ingest properties' })
  }
})

export default router