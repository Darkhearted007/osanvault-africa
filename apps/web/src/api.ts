const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"
const PUTER_WORKER = import.meta.env.VITE_PUTER_WORKER_URL || null
const USE_PUTER = import.meta.env.VITE_USE_PUTER === "true"

const JWT_KEY = "osanv_jwt"

export function getStoredJWT(): string | null {
  return localStorage.getItem(JWT_KEY)
}

export function setStoredJWT(token: string): void {
  localStorage.setItem(JWT_KEY, token)
}

export function clearStoredJWT(): void {
  localStorage.removeItem(JWT_KEY)
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  [key: string]: unknown
}

export interface DashboardSummary {
  osanv_balance: number
  osanv_usd: number
  active_investments: number
  total_invested: number
}

export interface NonceResponse {
  nonce: string
  message: string
  expires: number
}

export interface VerifyResponse {
  id: string
  wallet_address: string
  role: string
  kyc_status: string
  created_at: string
  token: string
}

export interface LedgerEntry {
  type: string
  id: string
  timestamp: string
  description: string
  amount: number
  status: string
}

export interface GovernanceProposal {
  id: string
  title: string
  description: string
  proposal_type: string
  status: string
  votes_for: number
  votes_against: number
  votes_abstain: number
  voting_start: string
  voting_end: string
  created_at: string
}

export interface KycStatus {
  kyc_status: string
  created_at: string
  updated_at: string
}

export interface PropertyData {
  id: string
  title: string
  location: string
  country: string
  total_value: string | number
  token_price: string | number
  total_tokens: number
  tokens_sold: number
  annual_yield: string | number
  status?: string
}

const API_ROUTES = {
  properties: "/api/properties",
  dashboard: "/api/dashboard",
  auth: {
    nonce: "/api/auth/nonce",
    verify: "/api/auth/verify",
  },
  oracle: "/api/oracle",
  governance: "/api/governance",
  kyc: "/api/kyc",
  staking: "/api/tokens",
} as const

type API_ROUTES = typeof API_ROUTES

function getBaseUrl(): string {
  if (USE_PUTER && PUTER_WORKER) return PUTER_WORKER
  return BASE_URL
}

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown }> {
  const base = getBaseUrl()
  const token = getStoredJWT()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

export async function getProperties(): Promise<ApiResponse<PropertyData[]>> {
  const { status, data } = await apiFetch(API_ROUTES.properties)
  return { status, data: data as PropertyData[] }
}

export async function getProperty(id: string): Promise<ApiResponse<PropertyData>> {
  const { status, data } = await apiFetch(`${API_ROUTES.properties}/${id}`)
  return { status, data: data as PropertyData }
}

export async function getHealth() {
  const { data } = await apiFetch("/api/health")
  return data
}

export async function getTokenInfo() {
  const { data } = await apiFetch("/api/tokens/osanv")
  return data
}

export async function getDashboard() {
  const { data } = await apiFetch("/api/dashboard")
  return data
}

export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  const { status, data } = await apiFetch("/api/dashboard/summary")
  return { status, data: data as DashboardSummary }
}

export async function getDashboardProperties() {
  const { data } = await apiFetch("/api/dashboard/properties-overview")
  return data
}

export async function requestNonce(wallet_address: string): Promise<ApiResponse<NonceResponse>> {
  const { status, data } = await apiFetch("/api/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ wallet_address }),
  })
  return { status, data: data as NonceResponse }
}

export async function verifyWallet(
  wallet_address: string,
  signature: number[],
  nonce: string
): Promise<ApiResponse<VerifyResponse>> {
  const { status, data } = await apiFetch("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ wallet_address, signature, nonce }),
  })
  return { status, data: data as VerifyResponse }
}

export async function getOraclePrice(asset: string) {
  const { data } = await apiFetch(`/api/oracle/${asset}`)
  return data
}

export async function getCircuitStatus() {
  const { data } = await apiFetch("/api/health/circuits")
  return data
}

export async function getLedger(): Promise<ApiResponse<LedgerEntry[]>> {
  const { status, data } = await apiFetch("/api/dashboard/ledger")
  return { status, data: data as LedgerEntry[] }
}

export async function getGovernanceProposals(): Promise<ApiResponse<GovernanceProposal[]>> {
  const { status, data } = await apiFetch("/api/governance/proposals")
  return { status, data: data as GovernanceProposal[] }
}

export async function createGovernanceProposal(
  wallet_address: string,
  title: string,
  description: string,
  proposal_type: string,
  voting_days: number = 7
) {
  const { status, data } = await apiFetch("/api/governance/proposals", {
    method: "POST",
    body: JSON.stringify({ wallet_address, title, description, proposal_type, voting_days }),
  })
  return { status, data }
}

export async function castVote(
  wallet_address: string,
  proposal_id: string,
  vote: string,
  osanv_weight: number
) {
  const { status, data } = await apiFetch("/api/governance/vote", {
    method: "POST",
    body: JSON.stringify({ wallet_address, proposal_id, vote, osanv_weight }),
  })
  return { status, data }
}

export async function getStakingStatus(wallet_address: string) {
  const { data } = await apiFetch(`/api/tokens/staking-status?wallet=${wallet_address}`)
  return data
}

export async function stakeOsanv(wallet_address: string, amount: number) {
  const { status, data } = await apiFetch("/api/tokens/stake", {
    method: "POST",
    body: JSON.stringify({ wallet_address, amount }),
  })
  return { status, data }
}

export async function getKycStatus(wallet_address: string): Promise<ApiResponse<{ data: KycStatus }>> {
  const { status, data } = await apiFetch(`/api/kyc/status/${wallet_address}`)
  return { status, data: data as { data: KycStatus } }
}

export async function submitKyc(
  wallet_address: string,
  full_name: string,
  document_type: string,
  document_number: string
) {
  const { status, data } = await apiFetch("/api/kyc/submit", {
    method: "POST",
    body: JSON.stringify({ wallet_address, full_name, document_type, document_number }),
  })
  return { status, data }
}

export { BASE_URL, PUTER_WORKER, USE_PUTER }