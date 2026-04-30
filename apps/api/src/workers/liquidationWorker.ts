import { runLiquidationCheck, getLiquidationStats } from "../services/liquidation"
import { logger } from "../logger"

const LIQUIDATION_INTERVAL_MS = 60_000

let liquidationInterval: ReturnType<typeof setInterval> | null = null

export function startLiquidationWorker(): void {
  if (liquidationInterval) return

  liquidationInterval = setInterval(async () => {
    try {
      const result = await runLiquidationCheck()
      if (result.liquidated > 0) {
        logger.info(`Liquidation worker: ${result.liquidated} positions liquidated`)
      }
    } catch (err) {
      logger.error(`Liquidation worker error: ${err}`)
    }
  }, LIQUIDATION_INTERVAL_MS)

  logger.info(`Liquidation worker started (interval: ${LIQUIDATION_INTERVAL_MS}ms)`)
}

export function stopLiquidationWorker(): void {
  if (liquidationInterval) {
    clearInterval(liquidationInterval)
    liquidationInterval = null
    logger.info("Liquidation worker stopped")
  }
}