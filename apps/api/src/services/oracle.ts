import { logger, securityAlert } from "../logger"
import { pythBreaker } from "../middleware/circuitBreaker"

const PYTH_RPC = process.env.PYTH_RPC_URL || "https://pythrpc.helius.xyz"
const SWITCHBOARD_RPC = process.env.SWITCHBOARD_RPC_URL || "https://witchboard-v2.helius.xyz"

export interface PriceData {
  price: number
  confidence: number
  exponent: number
  publishTime: number
  prevPrice: number
}

export interface OracleResult {
  price: number
  source: "pyth" | "switchboard"
  confidence: number
  staleness: number
  fetchTime: number
}

const priceCache = new Map<string, { data: PriceData; fetchedAt: number }>()
const CACHE_TTL_MS = 30_000

function cacheKey(asset: string, source: string): string {
  return `${source}:${asset}`
}

export function getCachedPrice(asset: string, source: "pyth" | "switchboard"): PriceData | null {
  const key = cacheKey(asset, source)
  const cached = priceCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) {
    priceCache.delete(key)
    return null
  }
  return cached.data
}

export function setCachedPrice(asset: string, source: "pyth" | "switchboard", data: PriceData): void {
  priceCache.set(cacheKey(asset, source), { data, fetchedAt: Date.now() })
}

async function fetchPythPrice(asset: string): Promise<PriceData | null> {
  try {
    const response = await fetch(`${PYTH_RPC}/api/v1/price/${asset}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null
    const json = await response.json() as {
      data?: { price?: string; conf?: string; expo?: number; ts?: number }
    }
    const priceStr = json.data?.price
    if (!priceStr) return null
    const price = parseFloat(priceStr)
    const conf = parseFloat(json.data?.conf || "0")
    return {
      price: isNaN(price) ? 0 : price,
      confidence: isNaN(conf) ? 0 : conf,
      exponent: json.data?.expo ?? -8,
      publishTime: json.data?.ts ?? Date.now() / 1000,
      prevPrice: 0,
    }
  } catch {
    return null
  }
}

async function fetchSwitchboardPrice(asset: string): Promise<PriceData | null> {
  try {
    const response = await fetch(`${SWITCHBOARD_RPC}/v1/feed/${asset}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null
    const json = await response.json() as {
      result?: { value?: string; stdDev?: string; timestamp?: number }
    }
    const value = parseFloat(json.result?.value || "0")
    const stdDev = parseFloat(json.result?.stdDev || "0")
    return {
      price: isNaN(value) ? 0 : value,
      confidence: isNaN(stdDev) ? 0 : stdDev,
      exponent: -8,
      publishTime: json.result?.timestamp ?? Date.now() / 1000,
      prevPrice: 0,
    }
  } catch {
    return null
  }
}

export async function getPrice(asset: string): Promise<OracleResult> {
  const cachedPyth = getCachedPrice(asset, "pyth")
  if (cachedPyth) {
    return {
      price: cachedPyth.price,
      source: "pyth",
      confidence: cachedPyth.confidence,
      staleness: Date.now() / 1000 - cachedPyth.publishTime,
      fetchTime: Date.now(),
    }
  }

  try {
    const pythData = await pythBreaker(() => fetchPythPrice(asset))
    if (pythData && pythData.price > 0) {
      setCachedPrice(asset, "pyth", pythData)
      return {
        price: pythData.price,
        source: "pyth",
        confidence: pythData.confidence,
        staleness: Date.now() / 1000 - pythData.publishTime,
        fetchTime: Date.now(),
      }
    }
  } catch {
    logger.warn(`Pyth fetch failed for ${asset}`)
  }

  try {
    const sbData = await pythBreaker(() => fetchSwitchboardPrice(asset))
    if (sbData && sbData.price > 0) {
      setCachedPrice(asset, "switchboard", sbData)
      return {
        price: sbData.price,
        source: "switchboard",
        confidence: sbData.confidence,
        staleness: Date.now() / 1000 - sbData.publishTime,
        fetchTime: Date.now(),
      }
    }
  } catch {
    logger.warn(`Switchboard fetch failed for ${asset}`)
  }

  const cachedSB = getCachedPrice(asset, "switchboard")
  const lastCached = cachedSB || cachedPyth
  if (lastCached) {
    securityAlert("stale_oracle_price", {
      asset,
      staleness: Date.now() / 1000 - lastCached.publishTime,
    })
    return {
      price: lastCached.price,
      source: cachedSB ? "switchboard" : "pyth",
      confidence: lastCached.confidence,
      staleness: Date.now() / 1000 - lastCached.publishTime,
      fetchTime: Date.now(),
    }
  }

  throw new Error(`No oracle price available for ${asset}`)
}

export async function validateOraclePrice(asset: string, maxStaleness = 60): Promise<boolean> {
  const result = await getPrice(asset)
  if (result.staleness > maxStaleness) {
    securityAlert("oracle_staleness", {
      asset,
      staleness: result.staleness,
      threshold: maxStaleness,
    })
    return false
  }
  return true
}

export function clearPriceCache(): void {
  priceCache.clear()
}

export function getCacheStats(): { entries: Array<{ asset: string; source: string; age: number }>; count: number } {
  const now = Date.now()
  const entries: Array<{ asset: string; source: string; age: number }> = []
  for (const [key, val] of priceCache.entries()) {
    const colonIdx = key.indexOf(":")
    const source = key.substring(0, colonIdx)
    const asset = key.substring(colonIdx + 1)
    entries.push({ asset, source, age: now - val.fetchedAt })
  }
  return { entries, count: entries.length }
}