import { Router } from 'express'
const router = Router()

router.get('/markets', (_req, res) => {
  res.json({ data: [], message: 'ÒsánVault Lend — coming soon' })
})

router.get('/positions/:wallet', (req, res) => {
  res.json({ data: null, wallet: req.params.wallet })
})

export default router
