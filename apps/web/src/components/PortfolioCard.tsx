import React from "react"
import { Portfolio } from "../types"
import { TIERS } from "../constants"
import { fmt } from "../utils"

export function PortfolioCard({ data }: { data: Portfolio }) {
  const tier = TIERS.find(t => t.key === data.stakingTier)!
  return (
    <div className="portfolio-card">
      <div className="portfolio-bg" />
      <div className="portfolio-content">
        <p className="portfolio-label">Portfolio Value</p>
        <h2 className="portfolio-value">₦{fmt(data.totalNGN)}</h2>
        <p className="portfolio-sub">
          ${fmt(data.totalUSD)} USD &nbsp;·&nbsp;
          <span className="portfolio-change">▲ {data.dailyChangePct}%</span>
        </p>
        <div className="tier-badge" style={{ background: tier.gradient }}>
          ⭐ {tier.name} Tier · {tier.apy}% APY
        </div>
      </div>
    </div>
  )
}
