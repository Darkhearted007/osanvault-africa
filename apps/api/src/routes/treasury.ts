import { Router } from "express"
import type { Request, Response } from "express"
import {
  getSafeBalances,
  proposeTransaction,
  getTransactionHistory,
  requiresMultisig,
} from "../services/gnosisSafe.js"
import { getTreasurySnapshot } from "../services/treasury.js"
import { requireAdmin } from "../middleware/rbac.js"
import { z } from "zod"

const router = Router()

const TxSchema = z.object({
  to: z.string(),
  value: z.string(),
  data: z.string(),
  nonce: z.number(),
})

router.get("/balances", async (_req: Request, res: Response) => {
  try {
    const balances = await getSafeBalances()
    res.json({ data: balances })
  } catch {
    res.status(502).json({ error: "Failed to fetch Safe balances" })
  }
})

router.post("/propose", requireAdmin(), async (req: Request, res: Response) => {
  try {
    const body = TxSchema.parse(req.body)

    const requiresSafe = await requiresMultisig(parseFloat(body.value))
    if (!requiresSafe) {
      return res.status(400).json({
        error: "Amount below multisig threshold — use direct transfer",
      })
    }

    const result = await proposeTransaction(body)
    res.json({ data: result })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid transaction data" })
    }
    res.status(500).json({ error: "Failed to propose transaction" })
  }
})

router.get("/history", requireAdmin(), async (req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
  const history = await getTransactionHistory(limit)
  res.json({ data: history })
})

router.get("/treasury", async (_req: Request, res: Response) => {
  const [snapshot, safeBalances] = await Promise.all([
    getTreasurySnapshot(),
    getSafeBalances(),
  ])
  res.json({
    data: {
      ledger: snapshot,
      safe: safeBalances,
    },
  })
})

export default router