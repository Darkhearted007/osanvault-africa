import React, { useState } from "react"
import { TIERS } from "../constants"
import { fmt } from "../utils"

export function StakingTab({ balance }: { balance: number }) {
  const [active, setActive] = useState("gold")
  const tier = TIERS.find(t => t.key === active)!
  const progress = Math.min(100, Math.round((balance / tier.minOSANV) * 100))

  return (
    <div className="tab-content">
      <div className="staking-summary">
        <div className="staking-token-row">
          <span className="solana-icon">◎</span>
          <div>
            <p className="staking-token-name">OSANV Token</p>
            <p className="staking-token-sub">Solana SPL · 500M Supply</p>
          </div>
          <span className="staking-balance-badge">{fmt(balance)} held</span>
        </div>
      </div>

      <p className="section-title">Choose Your Tier</p>
      <div className="tier-tabs">
        {TIERS.map(t => (
          <button
            key={t.key}
            className={`tier-tab ${active === t.key ? "active" : ""}`}
            style={active === t.key ? { background: t.gradient, color: "#fff", border: "none" } : {}}
            onClick={() => setActive(t.key)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="tier-card">
        <div className="tier-card-header" style={{ background: tier.gradient }}>
          <div>
            <p className="tier-card-label">Tier</p>
            <h3 className="tier-card-name">{tier.name}</h3>
          </div>
          <div>
            <p className="tier-card-label">APY</p>
            <h3 className="tier-apy-value">{tier.apy}%</h3>
          </div>
        </div>
        <div className="tier-card-body">
          <div className="tier-stat-row">
            <span>Min. OSANV Required</span>
            <strong>{fmt(tier.minOSANV)} OSANV</strong>
          </div>
          <div className="tier-stat-row">
            <span>Trading Fee Discount</span>
            <strong>{tier.fee}</strong>
          </div>
          <div className="tier-progress-section">
            <div className="tier-progress-labels">
              <span>Your progress</span>
              <span>{progress}%</span>
            </div>
            <div className="tier-progress-bar">
              <div className="tier-progress-fill" style={{ width: `${progress}%`, background: tier.gradient }} />
            </div>
          </div>
          <p className="tier-benefits-title">Benefits</p>
          {tier.benefits.map((b, i) => (
            <div key={i} className="tier-benefit-row">
              <span className="tier-check">✓</span>
              <span>{b}</span>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: 16 }}>
            Stake OSANV → {tier.name}
          </button>
        </div>
      </div>
    </div>
  )
}
