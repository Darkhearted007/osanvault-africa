import { connectDB } from "../db"
import { redis } from "../db/redis"
import { logger } from "../logger"

export async function bootstrapCore() {
  try {
    await connectDB()

    // Redis health check (safe ping instead of reconnect logic)
    await redis.ping()

    logger.info("Core services initialized")
  } catch (err) {
    console.error("❌ CORE BOOTSTRAP ERROR:", err)
    logger.error(err)

    logger.warn("Core bootstrap failed — running degraded mode")
  }
}
