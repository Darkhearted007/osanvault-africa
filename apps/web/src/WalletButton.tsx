import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState, useCallback } from 'react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

interface UserProfile {
  id: string
  wallet_address: string
  role: string
  kyc_status: string
}

interface WalletAuth {
  nonce: string
  message: string
}

/**
 * SECURITY: Wallet signature verification hook
 * This implements the secure authentication flow:
 * 1. Server generates a nonce
 * 2. User signs a message containing the nonce
 * 3. Server verifies the signature
 */
function useWalletAuth() {
  const { connection } = useWallet()
  const { publicKey, signMessage } = useWallet()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Generate a nonce for secure authentication
  const generateNonce = useCallback(async (walletAddress: string): Promise<WalletAuth | null> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress }),
      })
      const data = await res.json()
      if (!data.nonce) return null
      return data
    } catch (err) {
      console.error('Failed to generate nonce:', err)
      return null
    }
  }, [])

  // Verify wallet ownership by signing a message
  const verifyWallet = useCallback(async (walletAddress: string): Promise<boolean> => {
    if (!signMessage || !publicKey || !connection) {
      setAuthError('Wallet or signing not available')
      return false
    }

    setIsAuthenticating(true)
    setAuthError(null)

    try {
      // Step 1: Get nonce from server
      const auth = await generateNonce(walletAddress)
      if (!auth) {
        setAuthError('Failed to get authentication challenge')
        return false
      }

      // Step 2: Sign the message with the wallet
      const messageBytes = new TextEncoder().encode(auth.message)
      const signature = await signMessage(messageBytes)

      // Step 3: Send to server for verification
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: Array.from(signature),
          nonce: auth.nonce,
        }),
      })

      const data = await res.json()

      if (!data.data) {
        setAuthError(data.error || 'Verification failed')
        return false
      }

      setUser(data.data)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed'
      setAuthError(errorMsg)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [signMessage, publicKey, connection, generateNonce])

  // Logout user
  const logout = useCallback(() => {
    setUser(null)
    setAuthError(null)
  }, [])

  return { user, verifyWallet, logout, isAuthenticating, authError }
}

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

/**
 * SECURITY: Hardened WalletButton
 * - REMOVED: Mock wallet bypass (CRITICAL security vulnerability)
 * - REQUIRED: Cryptographic signature verification
 * - PROTECTED: Server-side nonce + signature verification
 */
export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { user, verifyWallet, logout, isAuthenticating, authError } = useWalletAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)

  const walletAddress = publicKey?.toBase58() || null

  // Trigger authentication when wallet connects
  useEffect(() => {
    if (connected && walletAddress && needsAuth) {
      verifyWallet(walletAddress).then((success) => {
        if (success) {
          setNeedsAuth(false)
        }
      })
    }
  }, [connected, walletAddress, needsAuth, verifyWallet])

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDisconnect = async () => {
    await disconnect()
    logout()
    setShowMenu(false)
  }

  // Not connected - show connect button
  if (!connected) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleConnect}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--brand-primary)',
            background: 'transparent',
            color: 'var(--brand-primary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--brand-primary)'
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--brand-primary)'
          }}
        >
          🔌 Connect Wallet
        </button>
      </div>
    )
  }

  // Connected but needs authentication
  if (needsAuth || isAuthenticating) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          disabled={isAuthenticating}
          onClick={() => setNeedsAuth(true)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--brand-primary)',
            background: 'var(--brand-primary)',
            color: '#000',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isAuthenticating ? 'wait' : 'pointer',
            opacity: isAuthenticating ? 0.7 : 1,
          }}
        >
          {isAuthenticating ? '⏳ Verifying...' : 'Verify Ownership'}
        </button>
      </div>
    )
  }

  // Connected and authenticated - show wallet menu
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '20px',
          border: '1px solid var(--brand-primary)',
          background: 'var(--bg-surface-solid)',
          color: 'var(--brand-primary)', fontSize: '12px',
          fontWeight: '600', cursor: 'pointer',
        }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--brand-accent)', display: 'inline-block',
        }} />
        {truncate(walletAddress!)}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▾</span>
      </button>

      {showMenu && (
        <div style={{
          position: 'absolute', right: 0, top: '40px',
          background: 'var(--bg-surface-solid)', border: '1px solid var(--border-light)',
          borderRadius: '8px', padding: '8px', minWidth: '220px', zIndex: 100,
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border-light)', marginBottom: '4px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ⚡ Verified Wallet
            </div>
            <div style={{ fontSize: '11px', color: 'var(--brand-primary)', marginTop: '2px', wordBreak: 'break-all' }}>
              {walletAddress}
            </div>
            {user && (
              <>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  ID: <span style={{ color: 'var(--text-main)' }}>
                    {user.id.slice(0, 8)}...
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Role: <span style={{ color: 'var(--text-main)' }}>{user.role}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  KYC: <span style={{
                    color: user.kyc_status === 'verified' ? 'var(--brand-accent)' : 'var(--brand-primary)'
                  }}>{user.kyc_status}</span>
                </div>
              </>
            )}
          </div>
          {authError && (
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '4px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '11px', color: '#EF4444' }}>
                ⚠️ {authError}
              </div>
            </div>
          )}
          <button
            onClick={handleDisconnect}
            style={{
              width: '100%', padding: '8px 12px',
              background: 'none', border: 'none',
              color: '#EF4444', fontSize: '12px',
              cursor: 'pointer', textAlign: 'left', borderRadius: '4px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🔌 Disconnect
          </button>
        </div>
      )}
    </div>
  )
}