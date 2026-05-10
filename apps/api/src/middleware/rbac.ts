import type { Request, Response, NextFunction } from 'express'
import { pool } from '../db/index.js'
import { logger } from '../logger.js'

// Role definitions
export enum Role {
  ADMIN = 'admin',
  PROPERTY_MANAGER = 'property_manager',
  INVESTOR = 'investor',
}

/**
 * RBAC Middleware for Òsánvault Africa
 * 
 * SECURITY: This middleware enforces role-based access control
 * on all protected endpoints.
 * 
 * Usage:
 *   - requireRole('admin') - only admins can access
 *   - requireRole('admin', 'property_manager') - admins or property managers
 *   - requireAny() - any authenticated user with a role
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get wallet from auth header or body
      const walletAddress = req.headers['x-wallet-address'] as string || 
                           req.body.wallet_address as string

      if (!walletAddress) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      // Fetch user role from database
      const { rows } = await pool.query(
        'SELECT id, role, kyc_status FROM users WHERE wallet_address = $1',
        [walletAddress]
      )

      if (!rows.length) {
        return res.status(401).json({ error: 'User not found. Please authenticate first.' })
      }

      const user = rows[0]

      // Check if user's role is allowed
      if (!allowedRoles.includes(user.role as Role)) {
        logger.warn(`Access denied: ${walletAddress.slice(0, 8)}... tried to access with role ${user.role}`)

        // Log the unauthorized access attempt
        await pool.query(
          `INSERT INTO audit_log (user_id, action, entity_type, metadata, ip_address)
           VALUES ($1, 'access_denied', 'user', $2, $3)`,
          [user.id, JSON.stringify({ 
            allowedRoles, 
            attemptedRole: user.role,
            path: req.path,
            method: req.method 
          }), req.ip || 'unknown']
        )

        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          required: allowedRoles,
          current: user.role
        })
      }

      // Check KYC status for certain roles
      if (user.role === Role.INVESTOR && user.kyc_status !== 'verified') {
        logger.warn(`KYC required: ${walletAddress.slice(0, 8)}...`)
        return res.status(403).json({ 
          error: 'KYC verification required',
          kyc_status: user.kyc_status
        })
      }

      // Attach user to request for downstream use
      req.headers['x-user-id'] = user.id
      req.headers['x-user-role'] = user.role

      next()
    } catch (err: unknown) {
      logger.error(`RBAC middleware error: ${err}`)
      res.status(500).json({ error: 'Authorization check failed' })
    }
  }
}

/**
 * Require admin role only
 */
export function requireAdmin() {
  return requireRole(Role.ADMIN)
}

/**
 * Require property manager or admin
 */
export function requirePropertyManager() {
  return requireRole(Role.ADMIN, Role.PROPERTY_MANAGER)
}

/**
 * Require authenticated user (any role)
 */
export function requireAuthenticated() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletAddress = req.headers['x-wallet-address'] as string ||
                           req.body.wallet_address as string

      if (!walletAddress) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const { rows } = await pool.query(
        'SELECT id, role FROM users WHERE wallet_address = $1',
        [walletAddress]
      )

      if (!rows.length) {
        return res.status(401).json({ error: 'User not authenticated' })
      }

      req.headers['x-user-id'] = rows[0].id
      req.headers['x-user-role'] = rows[0].role

      next()
    } catch (err: unknown) {
      logger.error(`Authentication middleware error: ${err}`)
      res.status(500).json({ error: 'Authentication check failed' })
    }
  }
}