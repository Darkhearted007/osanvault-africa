import { startPayoutWorker } from "./payoutWorker.js"
import { logger } from "../logger.js"

interface WorkerInstance {
  name: string
  worker: unknown
  restartCount: number
}

const activeWorkers: WorkerInstance[] = []

async function startWithRetry(
  name: string,
  startFn: () => unknown,
  maxRetries = 3
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const worker = startFn()
      activeWorkers.push({ name, worker, restartCount: 0 })
      logger.info(`Worker ${name} started successfully`)
      return
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
      logger.warn(`Failed to start ${name}, retrying in ${delay}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  logger.error(`Failed to start worker ${name} after ${maxRetries} attempts`)
}

export async function startWorkers() {
  logger.info("Starting background workers...")

  await startWithRetry("payout-worker", startPayoutWorker)

  logger.info(`All workers started. Active: ${activeWorkers.length}`)
}

export function stopWorkers() {
  logger.info("Stopping all workers...")
  activeWorkers.forEach(w => {
    logger.info(`Stopping ${w.name}`)
  })
  activeWorkers.length = 0
}
