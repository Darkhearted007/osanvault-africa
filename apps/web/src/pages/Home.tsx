import { useEffect, useState } from 'react'
import { PropertyCard } from '../components/PropertyCard'
import { StatCard } from '../components/StatCard'
import { getProperties, getDashboard } from '../api'
import type { Property, DashboardStats } from '../types'

const MOCK_STATS: DashboardStats = {
  totalProperties: 12,
  activeProperties: 8,
  totalInvestors: 342,
  totalTvl: 4_800_000,
  totalDividendsPaid: 142_000,
  completedMilestones: 24,
}

const MOCK_PROPERTIES: Property[] = [
  {
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
  },
  {
    id: 'PROP-EKITI-001',
    title: 'Ekiti Sustainable Mineral Vault',
    location: 'Ado-Ekiti',
    country: 'Nigeria',
    total_value: 850_000,
    token_price: 10,
    total_tokens: 85_000,
    tokens_sold: 42_000,
    annual_yield: 18.0,
    status: 'active',
  },
  {
    id: 'PROP-ACCRA-001',
    title: 'Accra Oceanfront Residences',
    location: 'East Legon, Accra',
    country: 'Ghana',
    total_value: 2_100_000,
    token_price: 10,
    total_tokens: 210_000,
    tokens_sold: 63_000,
    annual_yield: 12.0,
    status: 'active',
  },
]

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES)
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getProperties().catch(() => ({ data: [] })),
      getDashboard().catch(() => ({ data: MOCK_STATS })),
    ]).then(([propRes, dashRes]) => {
      const propData = (propRes as { data: Property[] }).data
      const dashData = (dashRes as { data: DashboardStats }).data
      if (propData?.length) setProperties(propData)
      if (dashData) setStats(dashData)
      setLoading(false)
    })
  }, [])

  return (
    <div className="page page--home">
      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Nigeria SEC ARIP Sandbox Pathway
          </div>
          <h1 className="hero__title">
            Fractional African Assets on <span className="gradient-text">Solana</span>
          </h1>
          <p className="hero__subtitle">
            Access premium tokenized real estate, land banks, and mineral vaults
            across Africa starting from $10 equivalent. Powered by OSANV.
          </p>
          <div className="hero__actions">
            <a href="/assets" className="btn btn--primary btn--lg">
              Explore Assets
            </a>
            <a href="/dashboard" className="btn btn--ghost btn--lg">
              My Portfolio
            </a>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <StatCard
            label="Total Vault Value"
            value={`$${(stats.totalTvl / 1_000_000).toFixed(1)}M`}
            sub="Secured assets"
          />
          <StatCard
            label="Active Assets"
            value={String(stats.activeProperties)}
            sub={`of ${stats.totalProperties} total`}
          />
          <StatCard
            label="Total Investors"
            value={String(stats.totalInvestors)}
            sub="Verified wallets"
          />
          <StatCard
            label="Dividends Paid"
            value={`$${(stats.totalDividendsPaid / 1000).toFixed(0)}K`}
            sub="On-chain distribution"
          />
        </div>
      </section>

      <section className="properties-section">
        <div className="section-header">
          <h2 className="section-title">Featured Assets</h2>
          <a href="/assets" className="section-link">
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
        <div className="properties-grid">
          {loading && properties.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="property-card property-card--skeleton">
                  <div className="skeleton skeleton--image" />
                  <div className="skeleton skeleton--title" />
                  <div className="skeleton skeleton--text" />
                </div>
              ))
            : properties.slice(0, 3).map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
        </div>
      </section>

      <section className="token-section">
        <div className="token-card">
          <div className="token-card__header">
            <h2 className="gradient-text">OSANV Token</h2>
            <p>The utility token powering the ÒsánVault ecosystem</p>
          </div>
          <div className="token-card__body">
            <div className="token-card__supply">
              <span className="token-card__supply-value">500M</span>
              <span className="token-card__supply-label">Total Supply</span>
            </div>
            <div className="token-card__tranches">
              {['Public Sale', 'Ecosystem', 'Team', 'Treasury', 'Partners', 'Liquidity'].map((t, i) => (
                <div key={t} className="token-card__tranche">
                  <span className="token-card__tranche-name">{t}</span>
                  <div className="token-card__tranche-bar">
                    <div
                      className="token-card__tranche-fill"
                      style={{ width: ['30%', '20%', '15%', '15%', '10%', '10%'][i] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}