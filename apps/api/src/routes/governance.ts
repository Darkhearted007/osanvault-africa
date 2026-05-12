import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import { pool } from '../db/index.js'
import { logger } from '../logger.js'

const router = Router()

router.get('/proposals', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        gp.*,
        u.wallet_address as proposer_wallet
      FROM governance_proposals gp
      LEFT JOIN users u ON u.id = gp.proposer_id
      ORDER BY gp.created_at DESC
      LIMIT 50
    `)
    res.json({ data: rows })
  } catch {
    res.status(500).json({ error: 'Failed to fetch proposals' })
  }
})

router.get('/proposals/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT gp.*, u.wallet_address as proposer_wallet 
       FROM governance_proposals gp
       LEFT JOIN users u ON u.id = gp.proposer_id
       WHERE gp.id = $1`,
      [req.params.id]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Proposal not found' })
    }
    res.json({ data: rows[0] })
  } catch {
    res.status(500).json({ error: 'Failed to fetch proposal' })
  }
})

router.post('/proposals', async (req: Request, res: Response) => {
  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(44),
      title: z.string().min(5).max(200),
      description: z.string().min(20),
      proposal_type: z.enum(['parameter_change', 'new_property', 'treasury_allocation', 'platform_upgrade']),
      voting_days: z.number().min(1).max(14).default(7),
    })

    const { wallet_address, title, description, proposal_type, voting_days } = Schema.parse(req.body)

    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [wallet_address]
    )
    if (!users.length) {
      return res.status(401).json({ error: 'Wallet not registered. Authenticate first.' })
    }
    const userId = users[0].id

    const votingStart = new Date()
    const votingEnd = new Date(votingStart.getTime() + voting_days * 24 * 60 * 60 * 1000)

    const { rows } = await pool.query(
      `INSERT INTO governance_proposals (title, description, proposal_type, status, proposer_id, voting_start, voting_end)
       VALUES ($1, $2, $3, 'voting', $4, $5, $6) RETURNING *`,
      [title, description, proposal_type, userId, votingStart, votingEnd]
    )

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
       VALUES ($1, 'proposal_create', 'governance_proposal', $2, $3)`,
      [userId, JSON.stringify({ proposal_id: rows[0].id, title }), req.ip || 'unknown']
    )

    logger.info(`Governance proposal created: ${title}`)
    res.status(201).json({ data: rows[0] })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: err.errors })
    }
    logger.error(`Proposal creation failed: ${err}`)
    res.status(500).json({ error: 'Failed to create proposal' })
  }
})

router.post('/vote', async (req: Request, res: Response) => {
  try {
    const Schema = z.object({
      wallet_address: z.string().min(32).max(44),
      proposal_id: z.string().uuid(),
      vote: z.enum(['for', 'against', 'abstain']),
      osanv_weight: z.number().min(1),
    })

    const { wallet_address, proposal_id, vote, osanv_weight } = Schema.parse(req.body)

    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [wallet_address]
    )
    if (!users.length) {
      return res.status(401).json({ error: 'Wallet not registered' })
    }
    const userId = users[0].id

    const { rows: proposals } = await pool.query(
      'SELECT status, voting_end FROM governance_proposals WHERE id = $1',
      [proposal_id]
    )
    if (!proposals.length) {
      return res.status(404).json({ error: 'Proposal not found' })
    }
    if (proposals[0].status !== 'voting') {
      return res.status(400).json({ error: 'Proposal not accepting votes' })
    }
    if (new Date() > new Date(proposals[0].voting_end)) {
      return res.status(400).json({ error: 'Voting period has ended' })
    }

    await pool.query(
      `INSERT INTO governance_votes (proposal_id, voter_id, vote, osanv_weight)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (proposal_id, voter_id) DO UPDATE SET vote = $3, osanv_weight = $4`,
      [proposal_id, userId, vote, osanv_weight]
    )

    const column = vote === 'for' ? 'votes_for' : vote === 'against' ? 'votes_against' : 'votes_abstain'
    await pool.query(
      `UPDATE governance_proposals SET ${column} = ${column} + $1 WHERE id = $2`,
      [osanv_weight, proposal_id]
    )

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
       VALUES ($1, 'governance_vote', 'governance_proposal', $2, $3)`,
      [userId, JSON.stringify({ proposal_id, vote }), req.ip || 'unknown']
    )

    logger.info(`Vote cast: ${vote} on proposal ${proposal_id.slice(0, 8)}`)
    res.json({ message: 'Vote recorded', vote, weight: osanv_weight })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: err.errors })
    }
    logger.error(`Vote failed: ${err}`)
    res.status(500).json({ error: 'Failed to record vote' })
  }
})

router.get('/votes/:proposalId', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT gv.*, u.wallet_address 
       FROM governance_votes gv
       JOIN users u ON u.id = gv.voter_id
       WHERE gv.proposal_id = $1
       ORDER BY gv.created_at DESC`,
      [req.params.proposalId]
    )
    res.json({ data: rows })
  } catch {
    res.status(500).json({ error: 'Failed to fetch votes' })
  }
})

export default router