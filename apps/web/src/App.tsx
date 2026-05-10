import { useState, useEffect } from "react"
import { useWallet } from "./WalletProvider"
import { WalletButton } from "./WalletButton"
import "./index.css"

// ── Types ──────────────────────────────────────────────────────────────────
type Property = {
  id: string
  title: string
  location: string
  country: string
  total_value: string
  token_price: string
  total_tokens: number
  tokens_sold: number
  annual_yield: string
  status?: "Active" | "Coming Soon" | "Funded"
}

type LedgerEntry = {
  id: string
  type: "CREDIT" | "DEBIT"
  token: string
  amount: number
  reason: string
  createdAt: string
}

type Tab = "dashboard" | "explore" | "staking" | "governance"

// ── Staking tiers ──────────────────────────────────────────────────────────
const TIERS = [
  {
    key: "bronze",
    name: "Bronze",
    minOSANV: 50_000,
    apy: 8.5,
    fee: "0.5%",
    gradient: "linear-gradient(135deg,#a0522d,#7a3e22)",
    benefits: ["Basic governance weight", "Standard trading fees (0.5%)", "Access to public deals"],
  },
  {
    key: "silver",
    name: "Silver",
    minOSANV: 100_000,
    apy: 12.5,
    fee: "0.3%",
    gradient: "linear-gradient(135deg,#64748b,#475569)",
    benefits: ["Enhanced governance", "Reduced trading fees (0.3%)", "Priority support"],
  },
  {
    key: "gold",
    name: "Gold",
    minOSANV: 200_000,
    apy: 18.0,
    fee: "0.1%",
    gradient: "linear-gradient(135deg,#d4a017,#b8860b)",
    benefits: ["Max governance weight", "Premium fees (0.1%)", "Early deal access", "Account manager"],
  },
  {
    key: "platinum",
    name: "Platinum",
    minOSANV: 500_000,
    apy: 25.0,
    fee: "0%",
    gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)",
    benefits: ["Zero trading fees", "Veto governance rights", "Exclusive deal access", "Dedicated team"],
  },
]

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_PORTFOLIO = {
  totalNGN: 2_045_000,
  totalUSD: 6_300,
  dailyChangePct: 29.46,
  osanvBalance: 12_500,
  osanvUSD: 6_875,
  stakedOSANV: 200_000,
  stakingTier: "gold",
  activeInvestments: 3,
}

const MOCK_PROPERTIES: Property[] = [
  { id: "1", title: "Ekiti LandBank Phase 1", location: "Ekiti Growth Corridor", country: "Nigeria", total_value: "400000", token_price: "470", total_tokens: 850, tokens_sold: 530, annual_yield: "18", status: "Active" },
  { id: "2", title: "Solar Energy SPV", location: "Lagos State", country: "Nigeria", total_value: "550000", token_price: "550", total_tokens: 1000, tokens_sold: 458, annual_yield: "15", status: "Active" },
  { id: "3", title: "Oyo LandBank SPV", location: "Oyo State", country: "Nigeria", total_value: "480000", token_price: "480", total_tokens: 1000, tokens_sold: 385, annual_yield: "16", status: "Coming Soon" },
]

const MOCK_LEDGER: LedgerEntry[] = [
  { id: "1", type: "CREDIT", token: "OSANV", amount: 5000,  reason: "Staking reward",    createdAt: "2026-05-07T14:23:00Z" },
  { id: "2", type: "DEBIT",  token: "OSANV", amount: 200,   reason: "Platform fee",      createdAt: "2026-05-07T11:01:00Z" },
  { id: "3", type: "CREDIT", token: "OSANV", amount: 1250,  reason: "Yield dividend",    createdAt: "2026-05-06T09:15:00Z" },
]

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-NG")
const fundedPct = (sold: number, total: number) => Math.round((sold / total) * 100)
const timeAgo = (iso: string) => {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return "just now"
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
const PROPERTY_ICONS: Record<string, string> = {
  "Ekiti LandBank Phase 1": "🌳",
  "Solar Energy SPV": "☀️",
  "Oyo LandBank SPV": "🏘️",
}

// ── Components ─────────────────────────────────────────────────────────────

function PortfolioCard({ data }: { data: typeof MOCK_PORTFOLIO }) {
  const tier = TIERS.find(t => t.key === data.stakingTier)!
  return (
    <div className="portfolio-card">
      <div className="portfolio-bg" />
      <div className="portfolio-content">
        <p className="portfolio-label">Portfolio Value</p>
        <h2 className="portfolio-value">₦{fmt(data.totalNGN)}</h2>
        <p className="portfolio-sub">
          ${fmt(data.totalUSD)} USD &nbsp;·&nbsp;
          <span className="portfolio-change">▲ {data.dailyChangePct}%</span>
        </p>
        <div className="tier-badge" style={{ background: tier.gradient }}>
          ⭐ {tier.name} Tier · {tier.apy}% APY
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={accent ? { color: accent } : {}}>{value}</p>
      <p className="stat-sub">{sub}</p>
    </div>
  )
}

function PropertyCard({ p, onSelect }: { p: Property; onSelect: (p: Property) => void }) {
  const connected = false
  const funded = fundedPct(p.tokens_sold, p.total_tokens)
  const statusColors: Record<string, string> = {
    Active: "#2e7d32", "Coming Soon": "#f59e0b", Funded: "#0284c7",
  }
  const status = p.status || "Active"

  return (
    <div className="property-card" onClick={() => onSelect(p)}>
      <div className="property-header">
        <div className="property-icon">{PROPERTY_ICONS[p.title] || "🏢"}</div>
        <div className="property-info">
          <h3 className="property-title">{p.title}</h3>
          <p className="property-location">📍 {p.location} · {p.country}</p>
        </div>
        <span className="property-status-badge" style={{ color: statusColors[status], background: statusColors[status] + "18" }}>
          {status}
        </span>
      </div>
      <div className="property-progress-wrap">
        <div className="property-progress-bar">
          <div className="property-progress-fill" style={{ width: `${funded}%` }} />
        </div>
        <div className="property-progress-labels">
          <span>₦{fmt(Math.round(p.tokens_sold * Number(p.token_price)))}</span>
          <span className="funded-pct">{funded}%</span>
          <span>₦{fmt(Number(p.total_value))}</span>
        </div>
      </div>
      <div className="property-footer">
        <span className="property-yield">🏆 {p.annual_yield}% APY</span>
        <button
          className="btn-invest"
          disabled={!connected || status === "Coming Soon"}
          onClick={e => e.stopPropagation()}
        >
          {status === "Coming Soon" ? "Coming Soon" : connected ? "Invest Now" : "Connect Wallet"}
        </button>
      </div>
    </div>
  )
}

function StakingTab({ balance }: { balance: number }) {
  const [active, setActive] = useState("gold")
  const tier = TIERS.find(t => t.key === active)!
  const progress = Math.min(100, Math.round((balance / tier.minOSANV) * 100))

  return (
    <div className="tab-content">
      <div className="staking-summary">
        <div className="staking-token-row">
          <span className="solana-icon">◎</span>
          <div>
            <p className="staking-token-name">OSANV Token</p>
            <p className="staking-token-sub">Solana SPL · 500M Supply</p>
          </div>
          <span className="staking-balance-badge">{fmt(balance)} held</span>
        </div>
      </div>

      <p className="section-title">Choose Your Tier</p>
      <div className="tier-tabs">
        {TIERS.map(t => (
          <button
            key={t.key}
            className={`tier-tab ${active === t.key ? "active" : ""}`}
            style={active === t.key ? { background: t.gradient, color: "#fff", border: "none" } : {}}
            onClick={() => setActive(t.key)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="tier-card">
        <div className="tier-card-header" style={{ background: tier.gradient }}>
          <div>
            <p className="tier-card-label">Tier</p>
            <h3 className="tier-card-name">{tier.name}</h3>
          </div>
          <div>
            <p className="tier-card-label">APY</p>
            <h3 className="tier-apy-value">{tier.apy}%</h3>
          </div>
        </div>
        <div className="tier-card-body">
          <div className="tier-stat-row">
            <span>Min. OSANV Required</span>
            <strong>{fmt(tier.minOSANV)} OSANV</strong>
          </div>
          <div className="tier-stat-row">
            <span>Trading Fee Discount</span>
            <strong>{tier.fee}</strong>
          </div>
          <div className="tier-progress-section">
            <div className="tier-progress-labels">
              <span>Your progress</span>
              <span>{progress}%</span>
            </div>
            <div className="tier-progress-bar">
              <div className="tier-progress-fill" style={{ width: `${progress}%`, background: tier.gradient }} />
            </div>
          </div>
          <p className="tier-benefits-title">Benefits</p>
          {tier.benefits.map((b, i) => (
            <div key={i} className="tier-benefit-row">
              <span className="tier-check">✓</span>
              <span>{b}</span>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: 16 }}>
            Stake OSANV → {tier.name}
          </button>
        </div>
      </div>
    </div>
  )
}

function LedgerRows({ entries }: { entries: LedgerEntry[] }) {
  return (
    <>
      {entries.map(e => (
        <div key={e.id} className={`ledger-row ${e.type === "CREDIT" ? "credit" : "debit"}`}>
          <div className="ledger-dot" />
          <div className="ledger-info">
            <p className="ledger-reason">{e.reason}</p>
            <p className="ledger-time">{timeAgo(e.createdAt)}</p>
          </div>
          <div className="ledger-amount">
            {e.type === "CREDIT" ? "+" : "-"}{fmt(e.amount)} {e.token}
          </div>
        </div>
      ))}
    </>
  )
}

function GovernanceTab() {
  const proposals = [
    { id: 1, title: "Expand to Ghana LandBank SPV", votes: 67, status: "Active" },
    { id: 2, title: "Increase staking rewards by 2%", votes: 82, status: "Passed" },
    { id: 3, title: "Add Minerals SPV to platform", votes: 54, status: "Active" },
  ]
  return (
    <div className="tab-content">
      <p className="section-title">Governance Proposals</p>
      <p className="section-sub">Vote with your staked OSANV</p>
      {proposals.map(p => (
        <div key={p.id} className="gov-card">
          <div className="gov-header">
            <h4 className="gov-title">{p.title}</h4>
            <span className={`gov-status-badge ${p.status === "Passed" ? "passed" : "active"}`}>{p.status}</span>
          </div>
          <div className="gov-progress-bar">
            <div className="gov-progress-fill" style={{ width: `${p.votes}%` }} />
          </div>
          <div className="gov-footer">
            <span className="gov-votes">{p.votes}% in favor</span>
            {p.status === "Active" && (
              <div className="gov-actions">
                <button className="btn-vote-yes">Yes</button>
                <button className="btn-vote-no">No</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const { publicKey, connected } = useWallet()
  const [tab, setTab] = useState<Tab>("dashboard")
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const portfolio = MOCK_PORTFOLIO

  useEffect(() => {
    fetch("/api/properties")
      .then(r => r.json())
      .then(d => { if (d?.data?.length) setProperties(d.data) })
      .catch(() => {})
  }, [])

  const shortAddr = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null

  // SPV Detail view
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
              <button className="btn-secondary" onClick={() => setTab("governance")}>Vote on Proposal</button>
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
    <div className="app">
      {/* TOPBAR */}
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

      {/* MAIN */}
      <main className="main">

        {tab === "dashboard" && (
          <div className="tab-content">
            <p className="welcome">Welcome back{shortAddr ? `, ${shortAddr}` : ""}! 👋</p>
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
            {properties.map(p => <PropertyCard key={p.id} p={p} onSelect={setSelectedProperty} />)}
            <button className="btn-outline" style={{width:"100%"}} onClick={() => setTab("explore")}>Explore All Opportunities →</button>
            <p className="section-title">Recent Activity</p>
            <LedgerRows entries={MOCK_LEDGER} />
          </div>
        )}

        {tab === "explore" && (
          <div className="tab-content">
            <p className="section-title">All SPV Opportunities</p>
            <p className="section-sub">Pan-African real estate & asset tokenization</p>
            {properties.map(p => <PropertyCard key={p.id} p={p} onSelect={setSelectedProperty} />)}
            <div className="coming-soon-banner">🌍 Ghana · Kenya · South Africa — Coming 2026</div>
          </div>
        )}

        {tab === "staking" && <StakingTab balance={portfolio.osanvBalance} />}
        {tab === "governance" && <GovernanceTab />}

      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {(["dashboard","explore","staking","governance"] as Tab[]).map(t => {
          const icons: Record<Tab,string> = { dashboard:"🏠", explore:"🧭", staking:"⚡", governance:"🗳" }
          const labels: Record<Tab,string> = { dashboard:"Home", explore:"Explore", staking:"Staking", governance:"Governance" }
          return (
            <button key={t} className={`nav-item ${tab===t?"active":""}`} onClick={() => setTab(t)}>
              <span className="nav-icon">{icons[t]}</span>
              <span className="nav-label">{labels[t]}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
