import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { logger } from "../logger"

export function inputValidator(req: Request, res: Response, next: NextFunction) {
  const contentType = req.headers["content-type"] || ""
  
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!contentType.includes("application/json")) {
      if (contentType) {
        logger.warn(`Invalid content-type: ${contentType}`)
        res.status(415).json({ error: "Content-Type must be application/json" })
        return
      }
    }
    
    if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
      if (req.body !== null) {
        logger.warn(`Invalid body type: ${typeof req.body}`)
        res.status(400).json({ error: "Request body must be a JSON object" })
        return
      }
    }
    
    if (req.body && Object.keys(req.body).length > 100) {
      logger.warn(`Body too large: ${Object.keys(req.body).length} keys`)
      res.status(413).json({ error: "Request body too large (max 100 fields)" })
      return
    }
  }
  
  if (req.method === "GET") {
    if (Object.keys(req.query).length > 50) {
      logger.warn(`Query too large: ${Object.keys(req.query).length} params`)
      res.status(414).json({ error: "Query string too large" })
      return
    }
    
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string" && value.length > 2000) {
        logger.warn(`Query param ${key} too long: ${value.length}`)
        res.status(414).json({ error: `Query parameter ${key} too long (max 2000 chars)` })
        return
      }
    }
  }
  
  next()
}

export function validateSchema(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: err.errors.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        })
        return
      }
      next(err)
    }
  }
}

export const WalletAddressSchema = z.object({
  wallet_address: z.string().min(32).max(44)
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20)
})

export const AmountSchema = z.object({
  amount: z.number().positive().max(1_000_000_000)
})