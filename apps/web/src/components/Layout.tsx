import { FC, ReactNode } from 'react'
import { Nav } from './Nav'

interface LayoutProps {
  children: ReactNode
  title?: string
  hideNav?: boolean
}

export const Layout: FC<LayoutProps> = ({ children, title, hideNav }) => {
  if (title) {
    document.title = `${title} — ÒsánVault Africa`
  }

  return (
    <div className="app-shell">
      {!hideNav && <Nav />}
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-mark" />
            <span>ÒsánVault Africa</span>
          </div>
          <div className="footer-links">
            <a href="https://osanvault.africa" target="_blank" rel="noopener">Website</a>
            <a href="https://github.com/Darkhearted007/osanvault-africa" target="_blank" rel="noopener">GitHub</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <div className="footer-copy">
            © 2026 ÒsánVault Africa — Built on Solana
          </div>
        </div>
      </footer>
    </div>
  )
}