import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'properties', label: 'Tokenized Real Estate', icon: '⌂' },
  { id: 'lend', label: 'ÒsánVault Lend', icon: '◈' },
  { id: 'reits', label: 'REITs', icon: '▦' },
  { id: 'minerals', label: 'Minerals', icon: '◆' },
  { id: 'carbon', label: 'ÒsánCarbon', icon: '❋' },
  { id: 'landbank', label: 'LandBank', icon: '⬟' },
]

interface Property {
  id: string
  title: string
  location: string
  country: string
  total_value: string
  token_price: string
  total_tokens: number
  tokens_sold: number
  annual_yield: string
  status: string
}

function formatCurrency(value: string) {
  return '$' + parseFloat(value).toLocaleString()
}

function PropertyCard({ property }: { property: Property }) {
  const pct = Math.round((property.tokens_sold / property.total_tokens) * 100)
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '20px', transition: 'border-color 0.15s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{
          fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
          background: 'var(--surface-3)', color: 'var(--green)',
        }}>{property.status.toUpperCase()}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{property.country}</span>
      </div>
      <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
        {property.title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        📍 {property.location}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Value</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(property.total_value)}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Annual Yield</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--green)' }}>
            {property.annual_yield}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Token Price</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>${property.token_price}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Min. Investment</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>$10</div>
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Funding Progress</span>
          <span style={{ fontSize: '11px', color: 'var(--gold)' }}>{pct}%</span>
        </div>
        <div style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'var(--gold)', width: `${pct}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
      <button style={{
        width: '100%', marginTop: '12px', padding: '10px',
        background: 'var(--gold)', color: '#000', border: 'none',
        borderRadius: '8px', fontWeight: '700', fontSize: '13px',
        cursor: 'pointer',
      }}>
        Invest with OSANV →
      </button>
    </div>
  )
}

function Dashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/properties?limit=3')
      .then(r => r.json())
      .then(d => { setProperties(d.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Assets Tokenized', value: '$3.57M', change: '5 Properties' },
    { label: 'OSANV Token Supply', value: '500M', change: 'Solana SPL' },
    { label: 'Active Markets', value: '3', change: 'NG · KE · GH' },
    { label: 'Min. Investment', value: '$10', change: 'Fractional Entry' },
  ]

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '24px',
      }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '4px' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>Featured Properties</div>
        <button onClick={() => onNavigate('properties')} style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
          padding: '6px 12px', color: 'var(--gold)', fontSize: '12px', cursor: 'pointer',
        }}>View All →</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading properties...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  )
}

function PropertiesView() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState('')

  useEffect(() => {
    const url = country
      ? `http://localhost:3001/api/properties?country=${country}`
      : 'http://localhost:3001/api/properties'
    fetch(url)
      .then(r => r.json())
      .then(d => { setProperties(d.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [country])

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['', 'Nigeria', 'Kenya', 'Ghana', 'South Africa'].map(c => (
          <button key={c} onClick={() => setCountry(c)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: country === c ? 'var(--gold)' : 'var(--border)',
            background: country === c ? 'var(--gold)' : 'transparent',
            color: country === c ? '#000' : 'var(--text-muted)',
            fontSize: '12px', cursor: 'pointer', fontWeight: country === c ? '600' : '400',
          }}>{c || 'All Markets'}</button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  )
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '300px', color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '13px' }}>This vertical is under construction · OSANV Powered</div>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <Dashboard onNavigate={setActive} />
      case 'properties': return <PropertiesView />
      default: return <ComingSoon label={NAV_ITEMS.find(i => i.id === active)?.label ?? ''} />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--obsidian)' }}>
      <aside style={{
        width: sidebarOpen ? '260px' : '64px',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{
          padding: '24px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'var(--gold)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', color: '#000', fontSize: '16px',
          }}>Ò</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--gold)' }}>ÒsánVault</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Africa</div>
            </div>
          )}
        </div>
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '12px', padding: '10px 12px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', marginBottom: '4px',
              background: active === item.id ? 'var(--surface-3)' : 'transparent',
              color: active === item.id ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: active === item.id ? '600' : '400',
              borderLeft: active === item.id ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={{
            margin: '12px', padding: '12px', background: 'var(--surface-2)',
            borderRadius: '8px', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>OSANV Token</div>
            <div style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600' }}>500,000,000 Supply</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Solana SPL · 6 Tranches</div>
          </div>
        )}
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: '60px', padding: '0 24px',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '18px', padding: '4px',
            }}>☰</button>
            <span style={{ fontSize: '15px', fontWeight: '600' }}>
              {NAV_ITEMS.find(i => i.id === active)?.label ?? 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '6px 14px', borderRadius: '20px',
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              fontSize: '12px', color: 'var(--text-muted)',
            }}>🔴 Wallet Not Connected</div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--gold)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: '#000',
            }}>OA</div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
