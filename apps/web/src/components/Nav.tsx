import type { FC, ReactNode } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link } from './Link'

interface NavProps {
  children?: ReactNode
}

export const Nav: FC<NavProps> = () => {
  const { connected } = useWallet()

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <span className="logo-mark" />
        <span className="logo-text">ÒsánVault</span>
      </Link>

      <div className="nav-links">
        <Link href="/">Dashboard</Link>
        <Link href="/assets">Assets</Link>
        <Link href="/minerals">Minerals</Link>
        <Link href="/reits">REITs</Link>
        <Link href="/dashboard">Portfolio</Link>
      </div>

      <div className="nav-actions">
        {connected ? (
          <WalletMultiButton />
        ) : (
          <WalletMultiButton />
        )}
      </div>
    </nav>
  )
}