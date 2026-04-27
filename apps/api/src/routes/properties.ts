import { Router } from 'express'
const router = Router()

// GET /api/properties — list all tokenized properties
router.get('/', async (_req, res) => {
  res.json({
    data: [],
    meta: { total: 0, page: 1, limit: 20 },
    message: 'Tokenized Real Estate vertical — coming soon'
  })
})

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
  res.json({ data: null, id: req.params.id })
})

export default router
