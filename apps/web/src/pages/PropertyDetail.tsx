import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useWallet } from '@solana/wallet-adapter-react'
import type { Property } from '../types'

const MOCK_PROPERTY: Property = {
  id: 'PROP-LAGOS-001',
  title: 'Lagos Infinity Smart Home',
  location: 'Ikoyi, Lagos',
  country: 'Nigeria',
  total_value: 1_250_000,
  token_price: 10,
  total_tokens: 125_000,
  tokens_sold: 85_000,
  annual_yield: 14.5,
  status: 'active',
}

const MILESTONES = [
  { name: 'Land Acquisition', status: 'completed', pct: 100 },
  { name: 'Architectural Design', status: 'completed', pct: 100 },
  { name: 'Foundation & Structure', status: 'completed', pct: 100 },
  { name: 'Electrical & Plumbing', status: 'in_progress', pct: 65 },
  { name: 'Interior Finishing', status: 'not_started', pct: 0 },
  { name: 'Final Inspection & Handover', status: 'not_started', pct: 0 },
]

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { connected } = useWallet()
  const [property] = useState<Property>(MOCK_PROPERTY)
  const [tokens, setTokens] = useState(100)
  const [loading, setLoading] = useState(false)

  const pct = Math.round((property.tokens_sold / property.total_tokens) * 100)
  const availableTokens = property.total_tokens - property.tokens_sold
  const totalCost = tokens * property.token_price
  const estimatedReturn = (totalCost * property.annual_yield) / 100

  const handleInvest = async () => {
    if (!connected) return
    setLoading(true)
    navigate(`/assets/${id}/invest`, { state: { property, tokens } })
  }

  const milestoneStatusColor: Record<string, string> = {
    completed: 'var(--accent)',
    in_progress: 'var(--brand-primary)',
    not_started: 'var(--muted)',
  }

  return (
    <div className="page page--detail">
      <button className="btn btn--ghost" onClick={() => navigate('/assets')}>
        ← Back to Assets
      </button>

      <div className="detail-grid">
        <div className="detail-main">
          <img
            src={`https://placehold.co/800x500/16161a/F59E0B?text=${encodeURIComponent(property.title)}`}
            alt={property.title}
            className="detail-image"
          />
          <div className="detail-section">
            <h2 className="detail-section__title">About This Asset</h2>
            <p className="detail-section__text">
              Premium residential property in {property.location}, {property.country}.
              This tokenized property offers investors fractional ownership
              with quarterly dividend distributions powered by OSANV on Solana.
            </p>
          </div>
          <div className="detail-section">
            <h2 className="detail-section__title">Construction Milestones</h2>
            <div className="milestones">
              {MILESTONES.map(m => (
                <div key={m.name} className="milestone">
                  <div className="milestone__header">
                    <span
                      className="milestone__dot"
                      style={{ background: milestoneStatusColor[m.status] }}
                    />
                    <span className="milestone__name">{m.name}</span>
                    <span className="milestone__pct">{m.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{
                        width: `${m.pct}%`,
                        background: milestoneStatusColor[m.status],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="invest-card">
            <div className="invest-card__header">
              <span className="invest-card__badge">{property.country}</span>
              <span className="invest-card__status">{property.status}</span>
            </div>
            <h1 className="invest-card__title">{property.title}</h1>
            <p className="invest-card__location">{property.location}</p>

            <div className="invest-card__metrics">
              <div className="invest-card__metric">
                <span className="invest-card__metric-label">Asset Value</span>
                <span className="invest-card__metric-value">
                  ${Number(property.total_value).toLocaleString()}
                </span>
              </div>
              <div className="invest-card__metric">
                <span className="invest-card__metric-label">Token Price</span>
                <span className="invest-card__metric-value gradient-text">
                  ${Number(property.token_price).toFixed(2)}
                </span>
              </div>
              <div className="invest-card__metric">
                <span className="invest-card__metric-label">Est. APY</span>
                <span className="invest-card__metric-value gradient-text">
                  {property.annual_yield}%
                </span>
              </div>
            </div>

            <div className="invest-card__progress">
              <div className="invest-card__progress-header">
                <span>Funding Progress</span>
                <span className="highlight">{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="invest-card__progress-footer">
                <span>{availableTokens.toLocaleString()} tokens available</span>
              </div>
            </div>

            <div className="invest-card__form">
              <label className="invest-card__label">
                Number of Tokens
                <span className="invest-card__available">
                  {availableTokens.toLocaleString()} available
                </span>
              </label>
              <input
                type="range"
                min={10}
                max={Math.min(availableTokens, 10000)}
                step={10}
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                className="invest-card__slider"
              />
              <div className="invest-card__slider-value">
                <span>{tokens} OSANV tokens</span>
                <span className="gradient-text">${totalCost.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="invest-card__estimate">
              <span className="invest-card__estimate-label">Estimated Annual Return</span>
              <span className="invest-card__estimate-value gradient-text">
                ${estimatedReturn.toFixed(2)}
              </span>
            </div>

            <button
              className="btn btn--primary btn--lg btn--full"
              disabled={!connected || loading || tokens > availableTokens}
              onClick={handleInvest}
            >
              {!connected ? 'Connect Wallet to Invest' : loading ? 'Processing...' : 'Invest Now'}
            </button>

            <p className="invest-card__note">
              Dividends distributed quarterly. Powered by OSANV on Solana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}