import IORedis from 'ioredis'
import { logger } from '../logger.js'

const IORedisConstructor = IORedis.default ?? IORedis
export const redis = new IORedisConstructor({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
})

export async function connectRedis() {
  return new Promise<void>((resolve, reject) => {
    redis.once('connect', () => {
      logger.info('🟢 Redis connected successfully')
      resolve()
    })

    redis.once('error', (err: Error) => {
      logger.error('🔴 Redis connection failed')
      reject(err)
    })
  })
}
