import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { z } from 'zod'

const router = Router()

const PropertySchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  country: z.string().min(1),
  total_value: z.number().positive(),
  token_price: z.number().positive(),
  total_tokens: z.number().int().positive(),
  annual_yield: z.number().optional(),
  ipfs_hash: z.string().optional(),
})

// GET /api/properties
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    const country = req.query.country as string

    let query = `SELECT * FROM properties`
    const params: any[] = []

    if (country) {
      query += ` WHERE country = $1`
      params.push(country)
    }

    const countQuery = `SELECT COUNT(*) FROM properties${country ? ' WHERE country = $1' : ''}`
    const [rows, count] = await Promise.all([
      pool.query(`${query} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]),
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
})

// GET /api/properties/:id
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' })
  }
})

// POST /api/properties
router.post('/', async (req: Request, res: Response) => {
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
    res.status(201).json({ data: rows[0] })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    res.status(500).json({ error: 'Failed to create property' })
  }
})

// PATCH /api/properties/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    const valid = ['pending', 'active', 'fully_funded', 'closed']
    if (!valid.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` })
    }
    const { rows } = await pool.query(
      `UPDATE properties SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Property not found' })
    res.json({ data: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property status' })
  }
})

export default router
