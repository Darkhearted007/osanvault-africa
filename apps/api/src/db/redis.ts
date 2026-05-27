import IORedis from 'ioredis'
import { logger } from '../logger.js'

const IORedisConstructor = IORedis.default ?? IORedis

function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname || '127.0.0.1',
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
    }
  } catch {
    return { host: '127.0.0.1', port: 6379 }
  }
}

const redisConfig = process.env.REDIS_URL
  ? parseRedisUrl(process.env.REDIS_URL)
  : { host: '127.0.0.1', port: 6379 }

export const redis = new IORedisConstructor({
  ...redisConfig,
  maxRetriesPerRequest: null,
  lazyConnect: true,
})

export async function connectRedis() {
  return new Promise<void>((resolve, reject) => {
    redis.connect().then(() => {
      logger.info('Redis connected successfully')
      resolve()
    }).catch((err: Error) => {
      logger.error(`Redis connection failed: ${err.message}`)
      reject(err)
    })
  })
}
