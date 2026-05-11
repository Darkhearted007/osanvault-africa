export type Property = {
  id: string
  title: string
  location: string
  country: string
  total_value: string | number
  token_price: string | number
  total_tokens: number
  tokens_sold: number
  annual_yield: string | number
  status?: "Active" | "Coming Soon" | "Funded" | "active" | string
}

export type LedgerEntry = {
  id: string
  type: "CREDIT" | "DEBIT"
  token: string
  amount: number
  reason: string
  createdAt: string
}

export type Tab = "dashboard" | "explore" | "staking" | "governance"

export type StakingTier = {
  key: string
  name: string
  minOSANV: number
  apy: number
  fee: string
  gradient: string
  benefits: string[]
}

export type Portfolio = {
  totalNGN: number
  totalUSD: number
  dailyChangePct: number
  osanvBalance: number
  osanvUSD: number
  stakedOSANV: number
  stakingTier: string
  activeInvestments: number
}

export type DashboardStats = {
  totalValue?: number
  totalInvestors?: number
  totalProperties?: number
  osanvPrice?: number
  dailyChange?: number
  activeProperties?: number
  totalTvl?: number
  totalDividendsPaid?: number
  completedMilestones?: number
}

export type Investment = {
  id: string
  propertyId: string
  investor: string
  amount: number
  tokens: number
  date: string
  status: string
}

export type Dividend = {
  id: string
  investor: string
  amount: number
  yield: number
  date: string
}