import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { StatCard } from '../components/StatCard'
import type { DashboardStats, Investment, Dividend } from '../types'

const MOCK_STATS: DashboardStats = {
  totalProperties: 3,
  activeProperties: 2,
  totalInvestors: 342,
  totalTvl: 4_800_000,
  totalDividendsPaid: 142_000,
  completedMilestones: 24,
}

const MOCK_INVESTMENTS: Investment[] = []

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const [stats] = useState<DashboardStats>(MOCK_STATS)
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS)
  const [dividends] = useState<Dividend[]>([])

  if (!connected) {
    return (
      <div className="page page--dashboard page--empty">
        <div className="empty-state">
          <div className="empty-state__icon">👛</div>
          <h2>Connect Your Wallet</h2>
          <p>Connect your Solana wallet to view your portfolio and dividends.</p>
          <p className="empty-state__address">Wallet: {publicKey?.toBase58() || 'Not connected'}</p>
        </div>
      </div>
    )
  }

  const totalInvested = investments.reduce((s, i) => s + i.amount_paid, 0)
  const totalTokens = investments.reduce((s, i) => s + i.tokens_purchased, 0)

  return (
    <div className="page page--dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Portfolio</h1>
          <p className="page-subtitle address-display">
            {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
          </p>
        </div>
      </div>

      <div className="stats-grid stats-grid--3">
        <StatCard label="Total Invested" value={`$${totalInvested.toLocaleString()}`} />
        <StatCard label="OSANV Tokens" value={totalTokens.toLocaleString()} />
        <StatCard label="Dividends Earned" value="$0" sub="No dividends yet" />
      </div>

      {investments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <h2>No Investments Yet</h2>
          <p>Browse our asset marketplace to start building your portfolio.</p>
          <a href="/assets" className="btn btn--primary">
            Explore Assets
          </a>
        </div>
      ) : (
        <div className="investments-list">
          {investments.map(inv => (
            <div key={inv.id} className="investment-row">
              <div className="investment-row__info">
                <span className="investment-row__property">{inv.property_id}</span>
                <span className="investment-row__date">
                  {new Date(inv.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="investment-row__tokens">{inv.tokens_purchased} tokens</div>
              <div className="investment-row__amount">${inv.amount_paid.toFixed(2)}</div>
              <span className={`investment-row__status status--${inv.status}`}>{inv.status}</span>
            </div>
          ))}
        </div>
      )}

      {dividends.length > 0 && (
        <div className="section">
          <h2 className="section-title">Dividend History</h2>
          {dividends.map(d => (
            <div key={d.id} className="dividend-row">
              <span>{new Date(d.distributed_at).toLocaleDateString()}</span>
              <span className="gradient-text">${d.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}