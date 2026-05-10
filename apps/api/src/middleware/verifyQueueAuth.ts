import crypto from "crypto"
import type { Request, Response, NextFunction } from "express"

export function verifyQueueAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.QUEUE_SECRET

  if (!secret) {
    return res.status(500).json({ error: "Queue secret not configured" })
  }

  const signature = req.headers["x-queue-signature"] as string

  if (!signature) {
    return res.status(401).json({ error: "Missing signature" })
  }

  const payload = JSON.stringify(req.body)

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  if (signature !== expected) {
    return res.status(403).json({ error: "Invalid signature" })
  }

  next()
}
