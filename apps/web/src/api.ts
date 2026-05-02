import { API_ROUTES } from "@osanvault/shared"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"
const PUTER_WORKER = import.meta.env.VITE_PUTER_WORKER_URL || null
const USE_PUTER = import.meta.env.VITE_USE_PUTER === "true"

function getBaseUrl(): string {
  if (USE_PUTER && PUTER_WORKER) return PUTER_WORKER
  return BASE_URL
}

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown }> {
  const base = getBaseUrl()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

export async function getProperties() {
  const { data } = await apiFetch(API_ROUTES.properties)
  return data
}

export async function getProperty(id: string) {
  const { data } = await apiFetch(`${API_ROUTES.properties}/${id}`)
  return data
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

export async function getDashboardSummary() {
  const { data } = await apiFetch("/api/dashboard/summary")
  return data
}

export async function getDashboardProperties() {
  const { data } = await apiFetch("/api/dashboard/properties-overview")
  return data
}

export async function requestNonce(wallet_address: string) {
  const { status, data } = await apiFetch("/api/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ wallet_address }),
  })
  return { status, data }
}

export async function verifyWallet(
  wallet_address: string,
  signature: number[],
  nonce: string
) {
  const { status, data } = await apiFetch("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ wallet_address, signature, nonce }),
  })
  return { status, data }
}

export async function getOraclePrice(asset: string) {
  const { data } = await apiFetch(`/api/oracle/${asset}`)
  return data
}

export async function getCircuitStatus() {
  const { data } = await apiFetch("/api/health/circuits")
  return data
}

export { BASE_URL, PUTER_WORKER, USE_PUTER }