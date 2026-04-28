import { getLedger } from "./ledger"

export function getUserBalance(userId: string) {
  const entries = getLedger(userId)

  return entries.reduce((sum, entry) => {
    if (entry.type === "CREDIT") return sum + entry.amount
    return sum - entry.amount
  }, 0)
}
