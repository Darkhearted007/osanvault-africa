import React from "react"
import { LedgerEntry } from "../types"
import { fmt, timeAgo } from "../utils"

export function LedgerRows({ entries }: { entries: LedgerEntry[] }) {
  return (
    <>
      {entries.map(e => (
        <div key={e.id} className={`ledger-row ${e.type === "CREDIT" ? "credit" : "debit"}`}>
          <div className="ledger-dot" />
          <div className="ledger-info">
            <p className="ledger-reason">{e.reason}</p>
            <p className="ledger-time">{timeAgo(e.createdAt)}</p>
          </div>
          <div className="ledger-amount">
            {e.type === "CREDIT" ? "+" : "-"}{fmt(e.amount)} {e.token}
          </div>
        </div>
      ))}
    </>
  )
}
