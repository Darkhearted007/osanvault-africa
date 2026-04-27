import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { z } from 'zod'

const router = Router({ mergeParams: true })

// GET /api/properties/:id/milestones
router.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM construction_milestones
       WHERE property_id = $1
       ORDER BY sequence_order`,
      [req.params.id]
    )
    res.json({ data: rows })
  } catch {
    res.status(500).json({ error: 'Failed to fetch milestones' })
  }
})

// PATCH /api/properties/:id/milestones/:milestoneId
router.patch('/:milestoneId', async (req: Request, res: Response) => {
  try {
    const StatusSchema = z.object({
      status: z.enum(['not_started','planning','in_progress','completed','verified']),
      notes: z.string().optional(),
      paid_amount: z.number().optional(),
    })

    const body = StatusSchema.parse(req.body)
    const now = new Date().toISOString()

    let extraFields = ''
    const params: any[] = [body.status, req.params.milestoneId, req.params.id]

    if (body.status === 'in_progress') {
      extraFields = ', started_at = NOW()'
    } else if (body.status === 'completed') {
      extraFields = ', completed_at = NOW()'
    } else if (body.status === 'verified') {
      extraFields = ', verified_at = NOW(), escrow_released = TRUE, escrow_released_at = NOW()'
    }

    if (body.notes) {
      extraFields += `, notes = '${body.notes.replace(/'/g, "''")}'`
    }

    if (body.paid_amount !== undefined) {
      extraFields += `, paid_amount = ${body.paid_amount}`
    }

    const { rows } = await pool.query(
      `UPDATE construction_milestones
       SET status = $1, updated_at = NOW() ${extraFields}
       WHERE id = $2 AND property_id = $3
       RETURNING *`,
      params
    )

    if (!rows.length) {
      return res.status(404).json({ error: 'Milestone not found' })
    }

    res.json({ data: rows[0] })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    res.status(500).json({ error: 'Failed to update milestone' })
  }
})

export default router
