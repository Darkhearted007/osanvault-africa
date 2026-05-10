import dotenv from "dotenv"
import path from "path"

// ALWAYS load API .env FIRST (absolute safety)
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
})

import express from "express"
import cors from "cors"
import helmet from "helmet"

import { bootstrapCore } from "./core/bootstrap.js"
import { startWorkers } from "./workers/index.js"

import { requestLogger } from "./middleware/requestLogger.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { apiLimiter, authLimiter, propertyLimiter, investmentLimiter, verifyLimiter } from "./middleware/rateLimit.js"
import { inputValidator } from "./middleware/inputValidator.js"
import { requireAdmin, requireAuthenticated } from "./middleware/rbac.js"
import { logger } from "./logger.js"

import healthRouter from "./routes/health.js"
import propertiesRouter from "./routes/properties.js"
import tokensRouter from "./routes/tokens.js"
import lendRouter from "./routes/lend.js"
import milestonesRouter from "./routes/milestones.js"
import dashboardRouter from "./routes/dashboard.js"
import authRouter from "./routes/auth.js"
import queueRouter from "./routes/queues.js"
import oracleRouter from "./routes/oracle.js"
import treasuryRouter from "./routes/treasury.js"
import lpManagerRouter from "./routes/lpManager.js"
import dcaRouter from "./routes/dca.js"
import dividendDripRouter from "./routes/dividendDrip.js"
import portfolioRebalancerRouter from "./routes/portfolioRebalancer.js"
import supportRouter from "./routes/support.js"

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
app.use("/api/support", supportRouter)

// Webhook routes need stricter limits
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString()
  }
}))

app.use(errorHandler)

async function bootstrap() {
  try {
    await bootstrapCore();

    app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`ÒsánVault API running on http://localhost:${PORT}`);
      logger.info(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );
    });
  } catch (err: unknown) {
    console.error("❌ BOOT ERROR:", err);
  }
}

bootstrap();
