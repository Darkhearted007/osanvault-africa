import { useEffect, useState } from 'react'
import { PropertyCard } from '../components/PropertyCard'
import { getProperties } from '../api'
import type { Property } from '../types'

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

const COUNTRIES = ['All', 'Nigeria', 'Ghana', 'Kenya', 'South Africa']

export default function AssetsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getProperties()
      .then((res: unknown) => {
        const { data } = res as { data: Property[] }
        if (data?.length) {
          setProperties(data)
        } else {
          setProperties(MOCK_PROPERTIES)
        }
      })
      .catch(() => setProperties(MOCK_PROPERTIES))
      .finally(() => setLoading(false))
  }, [])

  const filtered = properties.filter(p => {
    const matchesCountry = filter === 'All' || p.country === filter
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchesCountry && matchesSearch
  })

  return (
    <div className="page page--assets">
      <div className="page-header">
        <h1 className="page-title">Asset Marketplace</h1>
        <p className="page-subtitle">
          Browse and invest in tokenized African real estate, REITs, and mineral assets
        </p>
      </div>

      <div className="filters">
        <div className="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="country-filter">
          {COUNTRIES.map(c => (
            <button
              key={c}
              className={`filter-chip ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="properties-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="property-card property-card--skeleton">
                <div className="skeleton skeleton--image" />
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--text" />
              </div>
            ))
          : filtered.map(p => (
              <PropertyCard key={p.id} p={p} onSelect={() => {}} connected={false} />
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <h3>No assets found</h3>
          <p>Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}