import dotenv from "dotenv"
import path from "path"

// ALWAYS load API .env FIRST (absolute safety)
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
})

import express from "express"
import cors from "cors"
import helmet from "helmet"

import { bootstrapCore } from "./core/bootstrap"
import { startWorkers } from "./workers"

import { requestLogger } from "./middleware/requestLogger"
import { errorHandler } from "./middleware/errorHandler"
import { logger } from "./logger"

import healthRouter from "./routes/health"
import propertiesRouter from "./routes/properties"
import tokensRouter from "./routes/tokens"
import lendRouter from "./routes/lend"
import milestonesRouter from "./routes/milestones"
import dashboardRouter from "./routes/dashboard"
import authRouter from "./routes/auth"
import queueRouter from "./routes/queues"

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}))

app.use(express.json())
app.use(requestLogger)

// routes
app.use("/health", healthRouter)
app.use("/api/auth", authRouter)
app.use("/api/properties", propertiesRouter)
app.use("/api/properties/:id/milestones", milestonesRouter)
app.use("/api/tokens", tokensRouter)
app.use("/api/lend", lendRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/queue", queueRouter)
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString()
  }
}))

app.use(errorHandler)

async function bootstrap() {
  try {
    await bootstrapCore()

    startWorkers()

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`ÒsánVault API running on http://localhost:${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (err) {
    console.error("❌ BOOT ERROR:", err)
  }
}

bootstrap()
