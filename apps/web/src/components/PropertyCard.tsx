import React from "react"
import { Property } from "../types"
import { PROPERTY_ICONS } from "../constants"
import { fmt, fundedPct } from "../utils"

export function PropertyCard({ p, onSelect, connected }: { p: Property; onSelect: (p: Property) => void; connected: boolean }) {
  const funded = fundedPct(p.tokens_sold, p.total_tokens)
  const statusColors: Record<string, string> = {
    Active: "#2e7d32", "Coming Soon": "#f59e0b", Funded: "#0284c7",
  }
  const status = p.status || "Active"

  return (
    <div className="property-card" onClick={() => onSelect(p)}>
      <div className="property-header">
        <div className="property-icon">{PROPERTY_ICONS[p.title] || "🏢"}</div>
        <div className="property-info">
          <h3 className="property-title">{p.title}</h3>
          <p className="property-location">📍 {p.location} · {p.country}</p>
        </div>
        <span className="property-status-badge" style={{ color: statusColors[status], background: statusColors[status] + "18" }}>
          {status}
        </span>
      </div>
      <div className="property-progress-wrap">
        <div className="property-progress-bar">
          <div className="property-progress-fill" style={{ width: `${funded}%` }} />
        </div>
        <div className="property-progress-labels">
          <span>₦{fmt(Math.round(p.tokens_sold * Number(p.token_price)))}</span>
          <span className="funded-pct">{funded}%</span>
          <span>₦{fmt(Number(p.total_value))}</span>
        </div>
      </div>
      <div className="property-footer">
        <span className="property-yield">🏆 {p.annual_yield}% APY</span>
        <button
          className="btn-invest"
          disabled={!connected || status === "Coming Soon"}
          onClick={e => e.stopPropagation()}
        >
          {status === "Coming Soon" ? "Coming Soon" : connected ? "Invest Now" : "Connect Wallet"}
        </button>
      </div>
    </div>
  )
}