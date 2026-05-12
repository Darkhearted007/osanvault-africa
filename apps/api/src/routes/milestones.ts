import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { pool } from '../db/index.js'
import { requireAdmin, requirePropertyManager } from '../middleware/rbac.js'
import { logger } from '../logger.js'

const router = Router({ mergeParams: true })

const MilestoneStatusSchema = z.object({
  status: z.enum(['not_started', 'planning', 'in_progress', 'completed', 'verified']),
  notes: z.string().max(1000).optional(),
  paid_amount: z.number().min(0).optional(),
})

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
router.patch('/:milestoneId', requirePropertyManager(), async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const body = MilestoneStatusSchema.parse(req.body)

    await client.query('BEGIN')

    let statusField = 'status = $1'
    const params: any[] = [body.status, req.params.milestoneId, req.params.id]
    let paramIdx = 4

    if (body.status === 'in_progress') {
      statusField += ', started_at = NOW()'
    } else if (body.status === 'completed') {
      statusField += ', completed_at = NOW()'
    } else if (body.status === 'verified') {
      statusField += ', verified_at = NOW(), escrow_released = TRUE, escrow_released_at = NOW()'
    }

    if (body.notes !== undefined) {
      statusField += `, notes = $${paramIdx}`
      params.push(body.notes)
      paramIdx++
    }

    if (body.paid_amount !== undefined) {
      statusField += `, paid_amount = $${paramIdx}`
      params.push(body.paid_amount)
      paramIdx++
    }

    statusField += ', updated_at = NOW()'

    const { rows } = await client.query(
      `UPDATE construction_milestones
       SET ${statusField}
       WHERE id = $2 AND property_id = $3
       RETURNING *`,
      params
    )

    if (!rows.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Milestone not found' })
    }

    await client.query('COMMIT')

    const userId = req.headers['x-user-id']
    if (userId) {
      await pool.query(
        `INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata, ip_address)
         VALUES ($1, 'milestone_update', 'milestone', $2, $3, $4)`,
        [userId, rows[0].id, JSON.stringify(body), req.ip || 'unknown']
      )
    }

    res.json({ data: rows[0] })
  } catch (err: unknown) {
    await client.query('ROLLBACK')
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    logger.error(`Milestone update error: ${err}`)
    res.status(500).json({ error: 'Failed to update milestone' })
  } finally {
    client.release()
  }
})

export default router