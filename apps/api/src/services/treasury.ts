import { pool } from "../db"

/**
 * Treasury Snapshot = system-wide financial health view
 */

export type TreasurySnapshot = {
  totalCredits: number
  totalDebits: number
  netPosition: number
  ledgerCount: number
}

/**
 * Reads ledger and computes system-wide financial state
 */
export async function getTreasurySnapshot(): Promise<TreasurySnapshot> {
  const result = await pool.query(`
    SELECT
      COUNT(*) as ledger_count,
      COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) as total_credits,
      COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) as total_debits
    FROM ledger
  `)

  const row = result.rows[0]

  const totalCredits = Number(row.total_credits)
  const totalDebits = Number(row.total_debits)

  return {
    ledgerCount: Number(row.ledger_count),
    totalCredits,
    totalDebits,
    netPosition: totalCredits - totalDebits,
  }
}
