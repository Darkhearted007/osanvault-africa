import { connectDB } from "../db/index.js"
import { redis } from "../db/redis.js"
import { logger } from "../logger.js"

export async function bootstrapCore() {
  try {
    await connectDB()

    // Redis health check (safe ping instead of reconnect logic)
    await redis.ping()

    logger.info("Core services initialized")
  } catch (err: unknown) {
    console.error("❌ CORE BOOTSTRAP ERROR:", err)
    logger.error(err)

    logger.warn("Core bootstrap failed — running degraded mode")
  }
}
