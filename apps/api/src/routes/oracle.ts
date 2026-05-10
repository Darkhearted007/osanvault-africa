import { Router } from "express"
import type { Request, Response } from "express"
import { getPrice, validateOraclePrice, getCacheStats, clearPriceCache } from "../services/oracle.js"
import { requireAdmin } from "../middleware/rbac.js"
import { z } from "zod"

const router = Router()

const AssetSchema = z.object({
  asset: z.string().min(1).max(50),
  max_staleness: z.coerce.number().min(1).max(3600).optional(),
})

router.get("/:asset", async (req: Request, res: Response) => {
  try {
    const { asset } = z.object({ asset: z.string() }).parse(req.params)

    const result = await getPrice(asset)

    res.json({
      data: {
        asset,
        price: result.price,
        source: result.source,
        confidence: result.confidence,
        staleness_seconds: Math.round(result.staleness),
        fetched_at: new Date(result.fetchTime).toISOString(),
      },
    })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid asset" })
    }
    res.status(502).json({ error: "Oracle unavailable for this asset" })
  }
})

router.get("/:asset/validate", async (req: Request, res: Response) => {
  try {
    const { asset } = z.object({ asset: z.string() }).parse(req.params)
    const maxStaleness = parseInt(req.query.max_staleness as string) || 60

    const isValid = await validateOraclePrice(asset, maxStaleness)

    res.json({
      data: {
        asset,
        oracle_valid: isValid,
        max_staleness: maxStaleness,
      },
    })
  } catch {
    res.status(502).json({ error: "Oracle unavailable" })
  }
})

router.get("/", async (_req: Request, res: Response) => {
  res.json({ data: getCacheStats() })
})

router.delete("/cache", requireAdmin(), async (_req: Request, res: Response) => {
  clearPriceCache()
  res.json({ success: true })
})

export default router