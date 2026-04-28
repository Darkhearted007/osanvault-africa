import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "./WalletButton"
import "./index.css"

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
}

function StatCard({ title, value, sub }: any) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="value">{value}</p>
      <span className="sub">{sub}</span>
    </div>
  )
}

function PropertyCard({ p }: { p: Property }) {
  const { connected } = useWallet()

  const pct = Math.round((p.tokens_sold / p.total_tokens) * 100)

  return (
    <div className="propertyCard">
      <div className="propertyHeader">
        <h3>{p.title}</h3>
        <p>{p.location} • {p.country}</p>
      </div>

      <div className="propertyStats">
        <div>Value: ${p.total_value}</div>
        <div>Yield: {p.annual_yield}%</div>
        <div>Progress: {pct}%</div>
      </div>

      <button disabled={!connected}>
        {connected ? "Invest via NET" : "Connect Wallet"}
      </button>
    </div>
  )
}

export default function App() {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    fetch("http://localhost:3001/api/properties")
      .then(r => r.json())
      .then(d => setProperties(d.data || []))
  }, [])

  return (
    <div className="app">

      {/* HEADER */}
      <header className="topbar">
        <h1>ÒsánVault Africa</h1>
        <div className="nav">
          <a>Dashboard</a>
          <a>Assets</a>
          <a>Minerals</a>
          <a>REITs</a>
          <WalletButton />
        </div>
      </header>

      {/* EKITI CORE PANEL */}
      <section className="hero">
        <h2>Ekiti Digital Asset Command Center</h2>
        <p>LandBank • Minerals • Carbon • Real Estate — Powered by NET</p>
      </section>

      {/* STATS */}
      <section className="grid">
        <StatCard title="Total Vault Value" value="$2.45M" sub="All assets" />
        <StatCard title="Active Properties" value="12" sub="Tokenized units" />
        <StatCard title="Mineral Sites" value="3" sub="Ekiti pilot" />
        <StatCard title="NET Supply" value="1B" sub="SPL Token" />
      </section>

      {/* PROPERTIES */}
      <section className="section">
        <h2>Featured Assets</h2>

        <div className="gridCards">
          {properties.map(p => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* EKITI ALIGNMENT PANEL */}
      <section className="alignment">
        <h2>Ekiti Pilot Alignment</h2>
        <ul>
          <li>✔ LandBank Tokenization</li>
          <li>✔ Mineral Vault Smart Contracts</li>
          <li>✔ NET Yield Engine</li>
          <li>✔ DAO-lite Governance</li>
        </ul>
      </section>

      <footer>
        © 2026 ÒsánVault Africa — Built on Solana
      </footer>

    </div>
  )
}
