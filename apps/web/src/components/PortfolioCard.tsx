import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Investment, Property } from '../types'

interface PortfolioCardProps {
  investment: Investment
  property?: Property
}

export const PortfolioCard: FC<PortfolioCardProps> = ({ investment, property }) => {
  const navigate = useNavigate()
  
  const fundingPct = property && property.total_tokens > 0
    ? Math.round((property.tokens_sold / property.total_tokens) * 100)
    : 0

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Active',
    failed: 'Failed'
  }

  const statusColors = {
    pending: 'var(--muted)',
    confirmed: 'var(--accent)',
    failed: '#ef4444'
  }

  return (
    <article
      className="portfolio-card"
      onClick={() => navigate(`/assets/${investment.property_id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="portfolio-card__header">
        <div className="portfolio-card__property-info">
          <h3 className="portfolio-card__title">
            {property?.title || `Property #${investment.property_id.slice(0, 8)}`}
          </h3>
          <span 
            className="portfolio-card__status"
            style={{ background: statusColors[investment.status] }}
          >
            {statusLabels[investment.status]}
          </span>
        </div>
        <span className="portfolio-card__date">
          {new Date(investment.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="portfolio-card__details">
        <div className="portfolio-card__detail">
          <span className="portfolio-card__label">Tokens</span>
          <span className="portfolio-card__value">
            {investment.tokens_purchased.toLocaleString()}
          </span>
        </div>
        <div className="portfolio-card__detail">
          <span className="portfolio-card__label">Invested</span>
          <span className="portfolio-card__value">
            ${investment.amount_paid.toLocaleString()}
          </span>
        </div>
        {property && (
          <div className="portfolio-card__detail">
            <span className="portfolio-card__label">Property Value</span>
            <span className="portfolio-card__value">
              ${property.total_value.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {property && (
        <div className="portfolio-card__progress">
          <div className="portfolio-card__progress-header">
            <span>Funding Progress</span>
            <span className="highlight">{fundingPct}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar__fill" 
              style={{ width: `${fundingPct}%` }} 
            />
          </div>
        </div>
      )}

      <div className="portfolio-card__actions">
        <button 
          className="btn btn--secondary"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/assets/${investment.property_id}`)
          }}
        >
          View Property
        </button>
      </div>
    </article>
  )
}