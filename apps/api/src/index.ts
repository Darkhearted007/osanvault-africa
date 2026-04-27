import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDB } from './db'
import { connectRedis } from './db/redis'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './logger'

import healthRouter from './routes/health'
import propertiesRouter from './routes/properties'
import tokensRouter from './routes/tokens'
import lendRouter from './routes/lend'
import milestonesRouter from './routes/milestones'
import dashboardRouter from './routes/dashboard'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(requestLogger)

app.use('/health', healthRouter)
app.use('/api/properties', propertiesRouter)
app.use('/api/properties/:id/milestones', milestonesRouter)
app.use('/api/tokens', tokensRouter)
app.use('/api/lend', lendRouter)
app.use('/api/dashboard', dashboardRouter)

app.use(errorHandler)

async function bootstrap() {
  try {
    await connectDB()
    await connectRedis()
  } catch {
    logger.warn('Starting without database/redis — some endpoints will be degraded')
  }

  app.listen(PORT, () => {
    logger.info(`ÒsánVault API running on http://localhost:${PORT}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

bootstrap()
