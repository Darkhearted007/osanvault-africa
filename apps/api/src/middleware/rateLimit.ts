import rateLimit from "express-rate-limit"
import type { Request, Response, NextFunction } from "express"
import { logger } from "../logger.js"

// Standard API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down."
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded: ${req.ip}`)
    res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: 60
    })
  }
})

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again later."
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip}, wallet: ${req.body.wallet_address}`)
    res.status(429).json({
      error: "Authentication rate limit exceeded",
      retryAfter: 900
    })
  }
})

// Payout rate limiter (existing)
export const payoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Too many payout requests. Slow down."
  }
})

// Property creation rate limiter
export const propertyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: "Too many property requests. Slow down."
  }
})

// Investment rate limiter
export const investmentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: "Too many investment requests. Slow down."
  }
})

// Wallet verification rate limiter
export const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: "Too many verification attempts. Please wait."
  }
})