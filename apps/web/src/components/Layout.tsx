import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import { useEffect } from 'react'

const SUPPORT_EMAIL = 'Olugbenga1000@gmail.com'
const SUPPORT_PHONE = '+2347065056103'
const WEBSITE = 'https://osanvaultafrica.com'

export const SUPPORT_CONTACT = {
  email: SUPPORT_EMAIL,
  phone: SUPPORT_PHONE,
  website: WEBSITE,
  twitter: '@Osanvault',
  telegram: '@OsanvaultAfrica'
}

interface LayoutProps {
  title?: string
  hideNav?: boolean
}

export function Layout({ title, hideNav }: LayoutProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — ÒsánVault Africa`
    }
  }, [title])

  return (
    <div className="app-shell">
      {!hideNav && <Nav />}

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-mark" />
            <span>ÒsánVault Africa</span>
          </div>

          <div className="footer-links">
            <a href={WEBSITE} target="_blank" rel="noreferrer">Website</a>
            <a href="https://github.com/Darkhearted007/osanvault-africa" target="_blank" rel="noreferrer">GitHub</a>
            <a href={`mailto:${SUPPORT_EMAIL}`}>Contact Support</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>

          <div className="footer-contact">
            <span>📧 {SUPPORT_EMAIL}</span>
            <span>📞 {SUPPORT_PHONE}</span>
          </div>

          <div className="footer-copy">
            © 2026 ÒsánVault Africa — Built on Solana
          </div>
        </div>
      </footer>
    </div>
  )
}