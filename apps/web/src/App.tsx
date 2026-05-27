import React, { useState, useEffect } from "react"
import { useWallet } from "./WalletProvider"
import { Property, Tab } from "./types"
import { MOCK_PROPERTIES, MOCK_PORTFOLIO, MOCK_LEDGER, PROPERTY_ICONS } from "./constants"
import { fmt, fundedPct } from "./utils"
import { Layout } from "./components/Layout"
import { PortfolioCard } from "./components/PortfolioCard"
import { StatCard } from "./components/StatCard"
import { PropertyCard } from "./components/PropertyCard"
import { LedgerRows } from "./components/LedgerRows"
import { StakingTab } from "./components/StakingTab"
import { GovernanceTab } from "./components/GovernanceTab"
import { getDashboardSummary, getLedger, getProperties } from "./api"
import "./index.css"

interface PortfolioData {
  osanvBalance: number
  osanvUSD: number
  activeInvestments: number
  totalValue: number
}

interface LedgerEntry {
  type: string
  id: string
  timestamp: string
  description: string
  amount: number
  status: string
}

export default function App() {
  const { publicKey, connected } = useWallet()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioData>(MOCK_PORTFOLIO)
  const [ledger, setLedger] = useState<LedgerEntry[]>(MOCK_LEDGER)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProperties()
      .then(d => { if (d?.data?.length) setProperties(d.data) })
      .catch(() => {
        setProperties(MOCK_PROPERTIES)
      })
  }, [])

  useEffect(() => {
    if (!connected || !publicKey) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const summaryData = await getDashboardSummary()
        if (summaryData?.data) {
          setPortfolio({
            osanvBalance: summaryData.data.osanv_balance || 0,
            osanvUSD: summaryData.data.osanv_usd || 0,
            activeInvestments: summaryData.data.active_investments || 0,
            totalValue: summaryData.data.total_invested || 0
          })
        }

        const ledgerData = await getLedger()
        if (ledgerData?.data?.length) {
          setLedger(ledgerData.data)
        }
      } catch (err) {
        console.error("Failed to fetch portfolio data:", err)
        setError("Failed to load portfolio data. Using cached values.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [connected, publicKey])

  const shortAddr = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null

  // SPV Detail view (Could also be extracted to a separate page component)
  if (selectedProperty) {
    const p = selectedProperty
    const funded = fundedPct(p.tokens_sold, p.total_tokens)
    return (
      <div className="app">
        <header className="topbar">
          <button className="back-btn" onClick={() => setSelectedProperty(null)}>← Back</button>
          <h1 className="topbar-title">SPV Explorer</h1>
          <div style={{ width: 48 }} />
        </header>
        <div className="spv-detail">
          <div className="spv-hero-icon">{PROPERTY_ICONS[p.title] || "🏢"}</div>
          <div className="spv-body">
            <h2 className="spv-title">{p.title}</h2>
            <p className="spv-location">📍 {p.location} · {p.country}</p>
            <div className="spv-stats-row">
              <div className="spv-stat"><p className="spv-stat-label">Target</p><p className="spv-stat-value">₦{fmt(Number(p.total_value))}</p></div>
              <div className="spv-stat"><p className="spv-stat-label">Yield</p><p className="spv-stat-value">{p.annual_yield}% APY</p></div>
              <div className="spv-stat"><p className="spv-stat-label">Slots Left</p><p className="spv-stat-value">{p.total_tokens - p.tokens_sold}</p></div>
            </div>
            <div className="property-progress-wrap">
              <div className="property-progress-bar">
                <div className="property-progress-fill" style={{ width: `${funded}%` }} />
              </div>
              <div className="property-progress-labels">
                <span>₦{fmt(Math.round(p.tokens_sold * Number(p.token_price)))}</span>
                <span className="funded-pct">{funded}% funded</span>
                <span>₦{fmt(Number(p.total_value))}</span>
              </div>
            </div>
            <div className="spv-benefits">
              {["Priority access to new deals","Discounted transaction fees","Earn staking rewards","On-chain dividend distribution"].map((b,i) => (
                <div key={i} className="tier-benefit-row"><span className="tier-check">✓</span><span>{b}</span></div>
              ))}
            </div>
            <div className="spv-actions">
              <button className="btn-primary" disabled={!connected}>{connected ? "Buy OSANV to Invest" : "Connect Wallet First"}</button>
              <button className="btn-secondary" onClick={() => {setSelectedProperty(null); setTab("governance")}}>Vote on Proposal</button>
            </div>
          </div>
        </div>
        <nav className="bottom-nav">
          {(["dashboard","explore","staking","governance"] as Tab[]).map(t => {
            const icons: Record<Tab,string> = { dashboard:"🏠", explore:"🧭", staking:"⚡", governance:"🗳" }
            const labels: Record<Tab,string> = { dashboard:"Home", explore:"Explore", staking:"Staking", governance:"Governance" }
            return (
               <button key={t} className={`nav-item ${tab===t?"active":""}`} onClick={() => { setSelectedProperty(null); setTab(t) }}>
                <span className="nav-icon">{icons[t]}</span>
                <span className="nav-label">{labels[t]}</span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  return (
    <Layout
      connected={connected}
      shortAddr={shortAddr}
      tab={tab}
      setTab={setTab}
      setSelectedProperty={setSelectedProperty}
    >
      {tab === "dashboard" && (
        <div className="tab-content">
          <p className="welcome">Welcome back{shortAddr ? `, ${shortAddr}` : ""}! 👋</p>
          {loading && <p className="section-sub">Loading portfolio...</p>}
          {error && (
            <div style={{
              padding: "0.75rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}
          <PortfolioCard data={portfolio} />
          <div className="stats-grid">
            <StatCard label="OSANV Balance" value={fmt(portfolio.osanvBalance)} sub={`$${fmt(portfolio.osanvUSD)} USD`} accent="var(--primary-600)" />
            <StatCard label="Active SPVs" value={String(portfolio.activeInvestments)} sub="Investments" accent="var(--gold-500)" />
          </div>
          <div className="cta-row">
            <button className="btn-primary" style={{flex:1}} onClick={() => setTab("staking")}>Stake OSANV</button>
            <button className="btn-secondary" style={{flex:1}}>Buy OSANV</button>
          </div>
          <p className="section-title">Investment Opportunities</p>
          {properties.map((p) => (
            <PropertyCard key={p.id} p={p} connected={connected} onSelect={setSelectedProperty} />
          ))}
          <button className="btn-outline" style={{width:"100%"}} onClick={() => setTab("explore")}>Explore All Opportunities →</button>
          <p className="section-title">Recent Activity</p>
          <LedgerRows entries={ledger} />
        </div>
      )}

      {tab === "explore" && (
        <div className="tab-content">
          <p className="section-title">All SPV Opportunities</p>
          <p className="section-sub">Pan-African real estate & asset tokenization</p>
          {properties.map((p) => (
            <PropertyCard key={p.id} p={p} connected={connected} onSelect={setSelectedProperty} />
          ))}
          <div className="coming-soon-banner">🌍 Ghana · Kenya · South Africa — Coming 2026</div>
        </div>
      )}

      {tab === "staking" && <StakingTab balance={portfolio.osanvBalance} />}
      {tab === "governance" && <GovernanceTab />}
    </Layout>
  )
}
