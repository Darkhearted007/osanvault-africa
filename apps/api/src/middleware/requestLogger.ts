import { Request, Response, NextFunction } from 'express'
import { logger, securityAlert, suspiciousActivity } from '../logger'
import { pool } from '../db'

const SENSITIVE_ENDPOINTS = new Set(['/api/auth/verify', '/api/auth/nonce', '/api/investments', '/api/payout'])
const MAX_BODY_LOG_SIZE = 200

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  const ip = req.ip || 'unknown'

  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip,
    }

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData)
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData)
    } else {
      logger.info('Request completed', logData)
    }

    if (res.statusCode === 429) {
      suspiciousActivity(ip, `rate_limit_exceeded: ${req.method} ${req.path}`, { duration })
    }
  })

  next()
}

export async function securityAuditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (SENSITIVE_ENDPOINTS.has(req.path)) {
    const ip = req.ip || 'unknown'
    const body = { ...req.body }

    if (body.signature) delete body.signature
    if (body.nonce) delete body.nonce
    if (body.wallet_address) body.wallet_address = `${body.wallet_address.slice(0, 8)}...`

    for (const key of Object.keys(body)) {
      if (typeof body[key] === 'string' && body[key].length > MAX_BODY_LOG_SIZE) {
        body[key] = `${body[key].slice(0, MAX_BODY_LOG_SIZE)}...`
      }
    }

    try {
      await pool.query(
        `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
         VALUES (NULL, 'api_access', 'request', $1, $2)`,
        [JSON.stringify({ path: req.path, method: req.method, body }), ip]
      )
    } catch {
      // Don't block the request if audit logging fails
    }
  }
  next()
}

export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || 'unknown'
  const statusCode = err.statusCode || 500

  if (statusCode >= 500) {
    securityAlert('unhandled_exception', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip,
    })
  }

  logger.error(`Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    statusCode,
  })

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' })
  } else {
    res.status(statusCode).json({ error: err.message })
  }
}