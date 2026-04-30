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
import { apiLimiter, authLimiter, propertyLimiter, investmentLimiter, verifyLimiter } from "./middleware/rateLimit"
import { inputValidator } from "./middleware/inputValidator"
import { requireAdmin, requireAuthenticated } from "./middleware/rbac"
import { logger } from "./logger"

import healthRouter from "./routes/health"
import propertiesRouter from "./routes/properties"
import tokensRouter from "./routes/tokens"
import lendRouter from "./routes/lend"
import milestonesRouter from "./routes/milestones"
import dashboardRouter from "./routes/dashboard"
import authRouter from "./routes/auth"
import queueRouter from "./routes/queues"
import oracleRouter from "./routes/oracle"
import treasuryRouter from "./routes/treasury"
import lpManagerRouter from "./routes/lpManager"
import dcaRouter from "./routes/dca"
import dividendDripRouter from "./routes/dividendDrip"
import portfolioRebalancerRouter from "./routes/portfolioRebalancer"

const app = express()
const PORT = parseInt(process.env.PORT || "3001", 10)

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}))

app.use(express.json())
app.use(requestLogger)

// Global security middleware
app.use(inputValidator)

// Apply rate limiters to routes
app.use("/health", healthRouter)
app.use("/api/auth", authLimiter, authRouter)
app.use("/api/properties", propertyLimiter, propertiesRouter)
app.use("/api/properties/:id/milestones", apiLimiter, milestonesRouter)
app.use("/api/tokens", apiLimiter, tokensRouter)
app.use("/api/lend", investmentLimiter, lendRouter)
app.use("/api/dashboard", apiLimiter, dashboardRouter)
app.use("/api/queue", apiLimiter, queueRouter)
app.use("/api/oracle", apiLimiter, oracleRouter)
app.use("/api/treasury", requireAdmin(), treasuryRouter)
app.use("/api/lp", requireAdmin(), lpManagerRouter)
app.use("/api/dca", requireAuthenticated(), dcaRouter)
app.use("/api/dividends", requireAdmin(), dividendDripRouter)
app.use("/api/portfolio", requireAuthenticated(), portfolioRebalancerRouter)

// Webhook routes need stricter limits
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
