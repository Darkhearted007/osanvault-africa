export interface Property {
  id: string
  title: string
  location: string
  country: string
  total_value: number
  token_price: number
  total_tokens: number
  tokens_sold: number
  annual_yield: number
  ipfs_hash?: string
  image_url?: string
  status: 'pending' | 'active' | 'fully_funded' | 'closed'
  created_at?: string
}

export interface Investment {
  id: string
  property_id: string
  user_id: string
  tokens_purchased: number
  amount_paid: number
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
}

export interface Dividend {
  id: string
  property_id: string
  amount: number
  distributed_at: string
}

export interface User {
  id: string
  wallet_address: string
  role: 'investor' | 'admin' | 'property_manager'
  kyc_status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

export interface DashboardStats {
  totalProperties: number
  activeProperties: number
  totalInvestors: number
  totalTvl: number
  totalDividendsPaid: number
  completedMilestones: number
}

export interface ApiResponse<T> {
  data: T
  success?: boolean
  error?: string
}