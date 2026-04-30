import { logger, securityAlert, auditEvent } from "../logger"
import { pool } from "../db"

export interface GnosisSafeConfig {
  safeAddress: string
  network: "mainnet" | "testnet"
}

export interface MultisigTransaction {
  to: string
  value: string
  data: string
  nonce: number
}

export interface SafeBalance {
  total: number
  breakdown: Array<{ token: string; balance: number }>
}

const SAFE_API_BASE: Record<string, string> = {
  mainnet: "https://safe-transaction.gnosis.io/api/v1",
  testnet: "https://safe-testnet.gnosis.io/api/v1",
}

function getSafeConfig(): GnosisSafeConfig {
  const network = (process.env.SAFE_NETWORK as "mainnet" | "testnet") || "testnet"
  return {
    safeAddress: process.env.SAFE_TREASURY_ADDRESS || "",
    network,
  }
}

function getApiBase(): string {
  return SAFE_API_BASE[getSafeConfig().network]
}

export async function getSafeBalances(): Promise<SafeBalance> {
  const config = getSafeConfig()
  if (!config.safeAddress) {
    return { total: 0, breakdown: [] }
  }

  try {
    const response = await fetch(
      `${getApiBase()}/safes/${config.safeAddress}/balances/`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!response.ok) {
      throw new Error(`Safe API error: ${response.status}`)
    }
    const json = await response.json() as {
      items: Array<{ token: string; balance: string }>
    }
    const breakdown = (json.items || []).map(item => ({
      token: item.token || "native",
      balance: parseFloat(item.balance),
    }))
    const total = breakdown.reduce((sum, t) => sum + t.balance, 0)
    return { total, breakdown }
  } catch (err) {
    logger.error(`Failed to fetch Safe balances: ${err}`)
    return { total: 0, breakdown: [] }
  }
}

export async function proposeTransaction(
  tx: MultisigTransaction
): Promise<{ queueId: string; status: string }> {
  const config = getSafeConfig()
  if (!config.safeAddress) {
    throw new Error("Treasury address not configured")
  }

  const body = {
    to: tx.to,
    value: tx.value,
    data: tx.data,
    operation: "0",
    nonce: tx.nonce,
  }

  const response = await fetch(
    `${getApiBase()}/safes/${config.safeAddress}/multisig-transactions/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to propose transaction: ${response.status}`)
  }

  const result = await response.json() as { safeTxHash: string }
  auditEvent("safe_tx_proposed", {
    to: tx.to,
    value: tx.value,
    safeTxHash: result.safeTxHash,
  })

  return { queueId: result.safeTxHash, status: "pending" }
}

export async function confirmTransaction(safeTxHash: string): Promise<void> {
  const config = getSafeConfig()
  if (!config.safeAddress) {
    throw new Error("Treasury address not configured")
  }

  const response = await fetch(
    `${getApiBase()}/safes/${config.safeAddress}/multisig-transactions/${safeTxHash}/confirmations/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to confirm transaction: ${response.status}`)
  }

  auditEvent("safe_tx_confirmed", { safeTxHash })
}

export async function executeTransaction(safeTxHash: string): Promise<{ txHash: string }> {
  const config = getSafeConfig()
  if (!config.safeAddress) {
    throw new Error("Treasury address not configured")
  }

  const response = await fetch(
    `${getApiBase()}/safes/${config.safeAddress}/multisig-transactions/${safeTxHash}/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to execute transaction: ${response.status}`)
  }

  const result = await response.json() as { txHash?: string }
  auditEvent("safe_tx_executed", { safeTxHash, txHash: result.txHash })

  return { txHash: result.txHash || "" }
}

export async function getTransactionHistory(limit = 20): Promise<Array<Record<string, unknown>>> {
  const config = getSafeConfig()
  if (!config.safeAddress) {
    return []
  }

  try {
    const response = await fetch(
      `${getApiBase()}/safes/${config.safeAddress}/multisig-transactions/?pageUrl=`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!response.ok) return []
    const json = await response.json() as {
      results: Array<Record<string, unknown>>
    }
    return (json.results || []).slice(0, limit)
  } catch {
    return []
  }
}

export async function requiresMultisig(amount: number): boolean {
  return amount >= parseInt(process.env.SAFE_MULTISIG_THRESHOLD || "10000", 10)
}