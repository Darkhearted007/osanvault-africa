import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  wallet_address: string
  role: string
  kyc_status: string
}

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Dev mock wallet address for testing without Phantom extension
const MOCK_WALLET = 'DevWa11et' + Math.random().toString(36).substring(2, 15).toUpperCase() + 'osanvAfrica'

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [mockConnected, setMockConnected] = useState(false)
  const [mockAddress] = useState(MOCK_WALLET)

  const isDev = import.meta.env.DEV
  const isConnected = connected || mockConnected
  const displayAddress = publicKey?.toBase58() || (mockConnected ? mockAddress : null)

  // Register wallet with API on connect
  useEffect(() => {
    if (displayAddress && isConnected) {
      fetch('http://localhost:3001/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: displayAddress }),
      })
        .then(r => r.json())
        .then(d => setUser(d.data))
        .catch(console.error)
    } else {
      setUser(null)
    }
  }, [isConnected, displayAddress])

  const handleConnect = () => {
    if (isDev && !connected) {
      // In dev mode, offer mock connection
      setMockConnected(true)
    } else {
      setVisible(true)
    }
  }

  const handleDisconnect = () => {
    if (mockConnected) {
      setMockConnected(false)
    } else {
      disconnect()
    }
    setShowMenu(false)
    setUser(null)
  }

  if (!isConnected) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleConnect}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--gold)',
            background: 'transparent',
            color: 'var(--gold)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--gold)'
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--gold)'
          }}
        >
          🔌 Connect Wallet
        </button>
        {isDev && (
          <button
            onClick={() => setMockConnected(true)}
            style={{
              padding: '6px 10px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Dev Mock
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '20px',
          border: '1px solid var(--gold)',
          background: 'var(--surface-2)',
          color: 'var(--gold)', fontSize: '12px',
          fontWeight: '600', cursor: 'pointer',
        }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--green)', display: 'inline-block',
        }} />
        {truncate(displayAddress!)}
        {mockConnected && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[dev]</span>}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▾</span>
      </button>

      {showMenu && (
        <div style={{
          position: 'absolute', right: 0, top: '40px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '8px', minWidth: '220px', zIndex: 100,
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border)', marginBottom: '4px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {mockConnected ? '🔧 Dev Mock Wallet' : 'Connected Wallet'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gold)', marginTop: '2px', wordBreak: 'break-all' }}>
              {displayAddress}
            </div>
            {user && (
              <>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  ID: <span style={{ color: 'var(--text-primary)' }}>
                    {user.id.slice(0, 8)}...
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Role: <span style={{ color: 'var(--text-primary)' }}>{user.role}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  KYC: <span style={{
                    color: user.kyc_status === 'verified' ? 'var(--green)' : 'var(--gold)'
                  }}>{user.kyc_status}</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              width: '100%', padding: '8px 12px',
              background: 'none', border: 'none',
              color: 'var(--red)', fontSize: '12px',
              cursor: 'pointer', textAlign: 'left', borderRadius: '4px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🔌 Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
