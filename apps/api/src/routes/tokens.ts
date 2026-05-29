import { Router } from 'express'
const router = Router()

// GET /api/tokens/osanv — OSANV token info
router.get('/osanv', (_req, res) => {
  res.json({
    data: {
      name: 'OSANV',
      blockchain: 'Solana',
      type: 'SPL',
      totalSupply: 500_000_000,
      tranches: [
        { id: 1, name: 'Public Sale' },
        { id: 2, name: 'Ecosystem & Rewards' },
        { id: 3, name: 'Team & Advisors' },
        { id: 4, name: 'Treasury & Reserve' },
        { id: 5, name: 'Strategic Partners' },
        { id: 6, name: 'Liquidity' },
      ],
      deprecated: ['NET', 'NigeriaEstateToken'],
    }
  })
})

export default router
