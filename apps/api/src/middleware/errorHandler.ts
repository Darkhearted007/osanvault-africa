import { Request, Response, NextFunction } from 'express'
import { logger, securityAlert } from '../logger'

export function errorHandler(
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || 'unknown'
  const statusCode = err.statusCode || 500

  if (statusCode >= 500 || statusCode === 403 || statusCode === 401) {
    securityAlert('api_error', {
      error: err.message,
      stack: err.stack?.slice(0, 500),
      path: req.path,
      method: req.method,
      statusCode,
      ip,
    })
  }

  logger.error(`Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    statusCode,
    ip,
  })

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' })
  } else {
    res.status(statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV !== 'production' ? { statusCode } : {}),
    })
  }
}