import React from "react"
import { WalletButton } from "../WalletButton"
import { Tab } from "../types"

interface LayoutProps {
  children: React.ReactNode
  connected: boolean
  shortAddr: string | null
  tab: Tab
  setTab: (t: Tab) => void
  setSelectedProperty: (p: any) => void
}

export function Layout({ children, connected, shortAddr, tab, setTab, setSelectedProperty }: LayoutProps) {
  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "dashboard", icon: "🏠", label: "Home" },
    { key: "explore", icon: "🧭", label: "Explore" },
    { key: "staking", icon: "⚡", label: "Staking" },
    { key: "governance", icon: "🗳", label: "Governance" },
  ]

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">🏛</span>
          <span className="brand-name">ÒsánVault <span className="brand-africa">Africa</span></span>
        </div>
        <div className="topbar-right">
          {connected && shortAddr && <span className="wallet-chip">{shortAddr}</span>}
          <WalletButton />
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <nav className="bottom-nav">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`nav-item ${tab === t.key ? "active" : ""}`}
            onClick={() => {
              setSelectedProperty(null)
              setTab(t.key)
            }}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}