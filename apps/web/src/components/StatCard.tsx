import React from "react"

export function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={accent ? { color: accent } : {}}>{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  )
}