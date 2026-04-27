import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'properties', label: 'Tokenized Real Estate', icon: '⌂' },
  { id: 'lend', label: 'ÒsánVault Lend', icon: '◈' },
  { id: 'reits', label: 'REITs', icon: '▦' },
  { id: 'minerals', label: 'Minerals', icon: '◆' },
  { id: 'carbon', label: 'ÒsánCarbon', icon: '❋' },
  { id: 'landbank', label: 'LandBank', icon: '⬟' },
]

const STATS = [
  { label: 'Total Assets Tokenized', value: '$0', change: '+0%' },
  { label: 'OSANV Price', value: '$0.00', change: '+0%' },
  { label: 'Active Investors', value: '0', change: '+0' },
  { label: 'Dividends Distributed', value: '$0', change: '+0%' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--obsidian)' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '64px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'var(--gold)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', color: '#000', fontSize: '16px',
          }}>Ò</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--gold)' }}>
                ÒsánVault
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Africa</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '12px', padding: '10px 12px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', marginBottom: '4px',
                background: active === item.id ? 'var(--surface-3)' : 'transparent',
                color: active === item.id ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: active === item.id ? '600' : '400',
                borderLeft: active === item.id ? '2px solid var(--gold)' : '2px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* OSANV Token Badge */}
        {sidebarOpen && (
          <div style={{
            margin: '12px', padding: '12px',
            background: 'var(--surface-2)',
            borderRadius: '8px', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              OSANV Token
            </div>
            <div style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600' }}>
              500,000,000 Supply
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Solana SPL · 6 Tranches
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          height: '60px', padding: '0 24px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '18px', padding: '4px',
              }}>☰</button>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {NAV_ITEMS.find(i => i.id === active)?.label ?? 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '6px 14px', borderRadius: '20px',
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              fontSize: '12px', color: 'var(--text-muted)',
            }}>
              🔴 Wallet Not Connected
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--gold)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: '#000',
            }}>OA</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px', marginBottom: '24px',
          }}>
            {STATS.map(stat => (
              <div key={stat.label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '20px',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--green)', marginTop: '4px' }}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Verticals Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {NAV_ITEMS.slice(1).map(vertical => (
              <div key={vertical.id}
                onClick={() => setActive(vertical.id)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '24px', cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{vertical.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  {vertical.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Coming Soon · OSANV Powered
                </div>
                <div style={{
                  marginTop: '16px', padding: '6px 12px', borderRadius: '6px',
                  background: 'var(--surface-2)', display: 'inline-block',
                  fontSize: '11px', color: 'var(--gold)',
                }}>
                  Launch Vertical →
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
