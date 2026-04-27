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

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(requestLogger)

// Routes
app.use('/health', healthRouter)
app.use('/api/properties', propertiesRouter)
app.use('/api/tokens', tokensRouter)
app.use('/api/lend', lendRouter)

// Error handler
app.use(errorHandler)

// Boot
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
