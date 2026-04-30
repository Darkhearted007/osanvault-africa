import { FC } from 'react'
import { useNavigate } from 'react-router'
import { useWallet } from '@solana/wallet-adapter-react'
import type { Property } from '../types'

interface PropertyCardProps {
  property: Property
}

export const PropertyCard: FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate()
  const { connected } = useWallet()
  const pct = property.total_tokens > 0
    ? Math.round((property.tokens_sold / property.total_tokens) * 100)
    : 0

  const statusColor = {
    active: 'var(--accent)',
    pending: 'var(--muted)',
    fully_funded: '#6366F1',
    closed: 'var(--muted)',
  }[property.status] || 'var(--accent)'

  return (
    <article
      className="property-card"
      onClick={() => navigate(`/assets/${property.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/assets/${property.id}`)}
    >
      <div className="property-card__image-wrapper">
        <span className="property-card__badge">{property.country}</span>
        <span className="property-card__status" style={{ background: statusColor }}>
          {property.status.replace('_', ' ')}
        </span>
        <img
          src={property.image_url || `https://placehold.co/600x400/16161a/F59E0B?text=${encodeURIComponent(property.title)}`}
          alt={property.title}
          className="property-card__image"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://placehold.co/600x400/16161a/F59E0B?text=${encodeURIComponent(property.title)}`
          }}
        />
      </div>

      <div className="property-card__body">
        <h3 className="property-card__title">{property.title}</h3>
        <p className="property-card__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {property.location}
        </p>

        <div className="property-card__metrics">
          <div className="property-card__metric">
            <span className="property-card__metric-label">Asset Value</span>
            <span className="property-card__metric-value">
              ${Number(property.total_value).toLocaleString()}
            </span>
          </div>
          <div className="property-card__metric">
            <span className="property-card__metric-label">Est. Yield</span>
            <span className="property-card__metric-value gradient-text">
              {property.annual_yield}% APY
            </span>
          </div>
        </div>

        <div className="property-card__progress">
          <div className="property-card__progress-header">
            <span>Funding Progress</span>
            <span className="highlight">{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="property-card__progress-footer">
            <span>{Number(property.tokens_sold).toLocaleString()} tokens sold</span>
            <span>${Number(property.token_price).toFixed(2)} per token</span>
          </div>
        </div>

        <button
          className="btn btn--primary btn--full"
          disabled={!connected}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/assets/${property.id}`)
          }}
        >
          {!connected
            ? 'Connect Wallet to Invest'
            : property.status === 'active'
            ? 'Invest Now'
            : 'View Details'}
        </button>
      </div>
    </article>
  )
}