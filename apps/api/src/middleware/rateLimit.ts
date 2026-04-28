import rateLimit from "express-rate-limit"

export const payoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 requests per minute
  message: {
    error: "Too many payout requests. Slow down."
  },
})
