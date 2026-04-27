import { Pool } from 'pg'
import { logger } from '../logger'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export async function connectDB(): Promise<void> {
  try {
    const client = await pool.connect()
    logger.info('PostgreSQL connected successfully')
    client.release()
  } catch (err) {
    logger.error(`PostgreSQL connection failed: ${err}`)
    throw err
  }
}
