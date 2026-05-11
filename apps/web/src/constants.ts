import { Property, LedgerEntry, Portfolio, StakingTier } from "./types"

export const TIERS: StakingTier[] = [
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

export const MOCK_PORTFOLIO: Portfolio = {
  totalNGN: 2_045_000,
  totalUSD: 6_300,
  dailyChangePct: 29.46,
  osanvBalance: 12_500,
  osanvUSD: 6_875,
  stakedOSANV: 200_000,
  stakingTier: "gold",
  activeInvestments: 3,
}

export const MOCK_PROPERTIES: Property[] = [
  { id: "1", title: "Ekiti LandBank Phase 1", location: "Ekiti Growth Corridor", country: "Nigeria", total_value: "400000", token_price: "470", total_tokens: 850, tokens_sold: 530, annual_yield: "18", status: "Active" },
  { id: "2", title: "Solar Energy SPV", location: "Lagos State", country: "Nigeria", total_value: "550000", token_price: "550", total_tokens: 1000, tokens_sold: 458, annual_yield: "15", status: "Active" },
  { id: "3", title: "Oyo LandBank SPV", location: "Oyo State", country: "Nigeria", total_value: "480000", token_price: "480", total_tokens: 1000, tokens_sold: 385, annual_yield: "16", status: "Coming Soon" },
]

export const MOCK_LEDGER: LedgerEntry[] = [
  { id: "1", type: "CREDIT", token: "OSANV", amount: 5000,  reason: "Staking reward",    createdAt: "2026-05-07T14:23:00Z" },
  { id: "2", type: "DEBIT",  token: "OSANV", amount: 200,   reason: "Platform fee",      createdAt: "2026-05-07T11:01:00Z" },
  { id: "3", type: "CREDIT", token: "OSANV", amount: 1250,  reason: "Yield dividend",    createdAt: "2026-05-06T09:15:00Z" },
]

export const PROPERTY_ICONS: Record<string, string> = {
  "Ekiti LandBank Phase 1": "🌳",
  "Solar Energy SPV": "☀️",
  "Oyo LandBank SPV": "🏘️",
}
