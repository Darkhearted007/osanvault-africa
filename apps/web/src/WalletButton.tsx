import { useWallet } from './WalletProvider'
import { useState, useRef, useEffect } from 'react'
import { requestNonce, verifyWallet, setStoredJWT, clearStoredJWT, getStoredJWT, getKycStatus } from './api'

export function WalletButton() {
  const { publicKey, disconnect, connected, connecting, select, signMessage } = useWallet()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState<string>("")
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

  // Authenticate with backend after wallet connection
  useEffect(() => {
    if (!connected || !publicKey || getStoredJWT()) return

    const authenticate = async () => {
      try {
        setAuthStatus("Authenticating...")
        const walletAddr = publicKey.toBase58()

        // Get nonce
        const nonceResult = await requestNonce(walletAddr)
        const nonceData = nonceResult.data
        if (!nonceData?.nonce) {
          setAuthStatus("Failed to get nonce")
          return
        }

        // Sign message
        if (!signMessage) {
          setAuthStatus("Wallet doesn't support signing")
          return
        }

        const message = nonceData.message
        const encoded = new TextEncoder().encode(message)
        const sig = await signMessage(encoded)
        const sigArray = Array.from(sig)

        // Verify with backend
        const verifyResult = await verifyWallet(walletAddr, sigArray, nonceData.nonce)
        const verifyData = verifyResult.data
        if (verifyData?.token) {
          setStoredJWT(verifyData.token)
          setAuthStatus("Authenticated")

          // Check KYC status
          const kycResult = await getKycStatus(walletAddr)
          if (kycResult?.data?.data?.kyc_status === "pending") {
            setAuthStatus("KYC required")
          }
        } else {
          setAuthStatus("Verification failed")
        }
      } catch (err) {
        console.error("Auth error:", err)
        setAuthStatus("Auth error")
      }
    }

    authenticate()
  }, [connected, publicKey, signMessage])

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
                clearStoredJWT()
                disconnect().catch(console.error)
                setMenuOpen(false)
                setAuthStatus("")
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
          await select('Phantom' as unknown as Parameters<typeof select>[0])
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