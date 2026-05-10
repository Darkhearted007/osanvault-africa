import { useWallet } from './WalletProvider'
import { useState, useRef, useEffect } from 'react'

export function WalletButton() {
  const { publicKey, disconnect, connected, connecting, select } = useWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const shortAddr = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null

  if (connecting) {
    return (
      <button className="wallet-connect-btn" disabled>
        <span className="wallet-spinner" />
        Connecting...
      </button>
    )
  }

  if (connected && publicKey && shortAddr) {
    return (
      <div className="wallet-menu-wrapper" ref={menuRef}>
        <button
          className="wallet-chip"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          <span className="wallet-dot" />
          {shortAddr}
        </button>
        {menuOpen && (
          <div className="wallet-dropdown">
            <div className="wallet-address-display">{publicKey.toBase58()}</div>
            <button
              className="wallet-dropdown-item"
              onClick={() => {
                navigator.clipboard.writeText(publicKey.toBase58())
                setMenuOpen(false)
              }}
            >
              Copy Address
            </button>
            <button
              className="wallet-dropdown-item danger"
              onClick={() => {
                disconnect().catch(console.error)
                setMenuOpen(false)
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      className="wallet-connect-btn"
      onClick={async () => {
        try {
          await select('Phantom')
        } catch {
          // Fallback - Phantom will auto-trigger modal via adapter
          const phantom = document.querySelector('[data-adapter="phantom"]') as HTMLElement
          if (phantom) phantom.click()
        }
      }}
    >
      Connect Wallet
    </button>
  )
}