import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link } from './Link'

export function Nav() {
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
        <WalletMultiButton />
      </div>
    </nav>
  )
}
