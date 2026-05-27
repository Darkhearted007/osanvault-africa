import { pool } from "../db/index.js"
import { getPrice } from "./oracle.js"
import { logger, securityAlert } from "../logger.js"
import { withTransaction } from "../db/index.js"

export interface LiquidationCandidate {
  position_id: string
  user_id: string
  collateral_amount: number
  debt_amount: number
  collateral_token: string
  debt_token: string
  health_factor: number
  liquidation_bonus: number
}

export interface LiquidationResult {
  position_id: string
  liquidated: boolean
  collateral_seized: number
  debt_covered: number
  penalty: number
  tx_hash?: string
}

const HEALTH_FACTOR_THRESHOLD = 1.1
const LIQUIDATION_BONUS = 0.05
const DEBT_COVERAGE_RATIO = 0.5
const MAX_POSITIONS_PER_CHECK = 100

export async function checkLiquidationCandidates(): Promise<LiquidationCandidate[]> {
  const result = await pool.query(`
    SELECT
      lp.id as position_id,
      lp.user_id,
      lp.collateral_amount,
      lp.debt_amount,
      lp.collateral_token,
      lp.debt_token,
      lp.health_factor,
      lp.liquidation_bonus,
      lp.created_at
    FROM lending_positions lp
    WHERE lp.status = 'active'
      AND lp.health_factor < $1
      AND lp.debt_amount > 0
    ORDER BY lp.health_factor ASC
    LIMIT $2
  `, [HEALTH_FACTOR_THRESHOLD, MAX_POSITIONS_PER_CHECK])

  return result.rows as LiquidationCandidate[]
}

export async function computeHealthFactor(
  collateralAmount: number,
  collateralPrice: number,
  debtAmount: number,
  debtPrice: number,
  liquidationThreshold = 0.85
): Promise<number> {
  if (collateralAmount <= 0 || collateralPrice <= 0) return 0
  if (debtAmount <= 0) return Infinity

  const collateralValue = collateralAmount * collateralPrice * liquidationThreshold
  const debtValue = debtAmount * debtPrice
  return collateralValue / debtValue
}

export async function computeLiquidationParams(
  position: LiquidationCandidate
): Promise<{
  collateralToSeize: number
  debtToCover: number
  penalty: number
}> {
  const debtToCover = Math.min(
    position.debt_amount * DEBT_COVERAGE_RATIO,
    position.debt_amount
  )
  const penalty = debtToCover * LIQUIDATION_BONUS
  const collateralToSeize = debtToCover + penalty

  return {
    collateralToSeize,
    debtToCover,
    penalty,
  }
}

export async function executeLiquidation(
  position: LiquidationCandidate
): Promise<LiquidationResult> {
  return withTransaction(async (client) => {
    const params = await computeLiquidationParams(position)

    await client.query(
      `INSERT INTO liquidation_events
        (position_id, user_id, collateral_value, debt_value, liquidation_price, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [
        position.position_id,
        position.user_id,
        position.collateral_amount,
        position.debt_amount,
        0,
      ]
    )

    await client.query(
      `UPDATE lending_positions
       SET status = 'liquidated',
           updated_at = NOW()
       WHERE id = $1`,
      [position.position_id]
    )

    await client.query(
      `INSERT INTO audit_log
        (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'liquidation_executed', 'position', $2, $3)`,
      [
        position.user_id,
        position.position_id,
        JSON.stringify({
          collateral_seized: params.collateralToSeize,
          debt_covered: params.debtToCover,
          penalty: params.penalty,
        }),
      ]
    )

    return {
      position_id: position.position_id,
      liquidated: true,
      collateral_seized: params.collateralToSeize,
      debt_covered: params.debtToCover,
      penalty: params.penalty,
    }
  })
}

export async function runLiquidationCheck(): Promise<{
  candidates: number
  liquidated: number
  errors: number
}> {
  const candidates = await checkLiquidationCandidates()

  if (candidates.length === 0) {
    return { candidates: 0, liquidated: 0, errors: 0 }
  }

  let liquidated = 0
  let errors = 0

  for (const candidate of candidates) {
    try {
      const result = await executeLiquidation(candidate)
      if (result.liquidated) {
        liquidated++
        securityAlert("liquidation_executed", {
          position_id: candidate.position_id,
          user_id: candidate.user_id,
          collateral_seized: result.collateral_seized,
          debt_covered: result.debt_covered,
        })
      }
    } catch (err: unknown) {
      errors++
      logger.error(`Liquidation failed for ${candidate.position_id}: ${err}`)
    }
  }

  logger.info(`Liquidation check complete: ${candidates.length} candidates, ${liquidated} liquidated, ${errors} errors`)

  return { candidates: candidates.length, liquidated, errors }
}

export async function getLiquidationStats(): Promise<{
  total_positions: number
  at_risk: number
  healthy: number
  liquidated: number
}> {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE lp.status = 'active') as total_active,
      COUNT(*) FILTER (WHERE lp.status = 'active' AND lp.health_factor < $1) as at_risk,
      COUNT(*) FILTER (WHERE lp.status = 'active' AND lp.health_factor >= $1) as healthy,
      COUNT(*) FILTER (WHERE lp.status = 'liquidated') as liquidated
    FROM lending_positions lp
  `, [HEALTH_FACTOR_THRESHOLD])

  const row = result.rows[0]
  return {
    total_positions: Number(row.total_active),
    at_risk: Number(row.at_risk),
    healthy: Number(row.healthy),
    liquidated: Number(row.liquidated),
  }
}