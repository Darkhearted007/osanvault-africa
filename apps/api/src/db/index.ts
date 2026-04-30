import { Pool, PoolClient } from 'pg'
import { logger } from '../logger'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 10000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
  } : false,
})

pool.on('error', (err) => {
  logger.error(`Unexpected DB pool error: ${err}`)
})

pool.on('connect', () => {
  logger.debug('New DB connection established')
})

export async function connectDB(): Promise<void> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT 1')
    client.release()
    if (result.rows[0] === 1) {
      logger.info('PostgreSQL connected successfully')
    }
  } catch (err) {
    logger.error(`PostgreSQL connection failed: ${err}`)
    throw err
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}