import type { LedgerEntry } from "./ledger.js";

export function calculateBalance(entries: LedgerEntry[]) {
  return entries.reduce((sum: number, entry: LedgerEntry) => {
    return entry.type === "CREDIT"
      ? sum + entry.amount
      : sum - entry.amount;
  }, 0);
}
