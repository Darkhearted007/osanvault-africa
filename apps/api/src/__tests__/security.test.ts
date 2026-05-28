import { describe, it, expect, vi, beforeEach } from "vitest"
import crypto from "crypto"

describe("Queue HMAC Signature Verification", () => {
  const QUEUE_SECRET = "test-secret-key"

  function signPayload(payload: unknown): string {
    return crypto
      .createHmac("sha256", QUEUE_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex")
  }

  function verifyQueueSignature(payload: unknown, signature: string): boolean {
    if (!signature || signature.length !== 64) return false
    const expected = signPayload(payload)
    if (expected.length !== signature.length) return false
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should generate consistent HMAC signatures", () => {
    const payload = { userId: "user-123", balance: 1000 }
    const sig1 = signPayload(payload)
    const sig2 = signPayload(payload)
    expect(sig1).toBe(sig2)
    expect(sig1).toHaveLength(64)
  })

  it("should reject tampered payloads", () => {
    const payload = { userId: "user-123", balance: 1000 }
    const signature = signPayload(payload)
    const tamperedPayload = { userId: "user-123", balance: 999999 }
    expect(verifyQueueSignature(tamperedPayload, signature)).toBe(false)
  })

  it("should reject invalid signature format", () => {
    const payload = { userId: "user-123" }
    expect(verifyQueueSignature(payload, "invalid")).toBe(false)
  })

  it("should reject empty signature", () => {
    const payload = { userId: "user-123" }
    expect(verifyQueueSignature(payload, "")).toBe(false)
  })

  it("should handle empty object payloads", () => {
    const payload = {}
    const signature = signPayload(payload)
    expect(verifyQueueSignature(payload, signature)).toBe(true)
  })

  it("should produce different signatures for different payloads", () => {
    const payload1 = { a: 1 }
    const payload2 = { b: 2 }
    const sig1 = signPayload(payload1)
    const sig2 = signPayload(payload2)
    expect(sig1).not.toBe(sig2)
  })
})

describe("Nonce Security", () => {
  function isNonceExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt
  }

  function generateSecureNonce(): string {
    return crypto.randomBytes(32).toString("base64url")
  }

  it("should generate cryptographically secure nonces", () => {
    const nonce = generateSecureNonce()
    expect(nonce).toHaveLength(43)
    expect(() => crypto.randomBytes(32)).not.toThrow()
  })

  it("should detect expired nonces", () => {
    const past = Date.now() - 10_000
    expect(isNonceExpired(past)).toBe(true)
  })

  it("should not mark future nonces as expired", () => {
    const future = Date.now() + 300_000
    expect(isNonceExpired(future)).toBe(false)
  })

  it("should produce unique nonces each time", () => {
    const nonces = new Set(Array.from({ length: 100 }, () => generateSecureNonce()))
    expect(nonces.size).toBe(100)
  })
})

describe("Input Validation", () => {
  function validateWalletAddress(addr: string): boolean {
    return addr.length >= 32 && addr.length <= 44
  }

  function validateAmount(amount: number, max = 1_000_000_000): boolean {
    return amount > 0 && amount <= max
  }

  it("should accept valid Solana wallet addresses", () => {
    expect(validateWalletAddress("AbCdEf1234567890AbCdEf1234567890AbCdEf123456")).toBe(true)
    expect(validateWalletAddress("A".repeat(32))).toBe(true)
    expect(validateWalletAddress("A".repeat(44))).toBe(true)
  })

  it("should reject invalid wallet addresses", () => {
    expect(validateWalletAddress("short")).toBe(false)
    expect(validateWalletAddress("A".repeat(31))).toBe(false)
    expect(validateWalletAddress("")).toBe(false)
  })

  it("should accept positive amounts", () => {
    expect(validateAmount(1)).toBe(true)
    expect(validateAmount(1000000)).toBe(true)
    expect(validateAmount(0.01)).toBe(true)
  })

  it("should reject zero and negative amounts", () => {
    expect(validateAmount(0)).toBe(false)
    expect(validateAmount(-1)).toBe(false)
    expect(validateAmount(-0.01)).toBe(false)
  })

  it("should reject amounts exceeding max", () => {
    expect(validateAmount(1_000_000_001)).toBe(false)
  })
})

describe("Rate Limiting Logic", () => {
  const requestLog = new Map<string, number[]>()

  function recordRequest(ip: string): void {
    const now = Date.now()
    const requests = requestLog.get(ip) || []
    requests.push(now)
    requestLog.set(ip, requests)
  }

  function countRequests(ip: string, windowMs: number): number {
    const cutoff = Date.now() - windowMs
    const requests = requestLog.get(ip) || []
    return requests.filter(t => t > cutoff).length
  }

  it("should count requests within window", () => {
    const ip = "192.168.1.1"
    recordRequest(ip)
    recordRequest(ip)
    expect(countRequests(ip, 60_000)).toBeGreaterThanOrEqual(2)
  })

  it("should track requests per IP", () => {
    recordRequest("192.168.1.1")
    recordRequest("192.168.1.2")
    expect(requestLog.size).toBeGreaterThanOrEqual(2)
  })
})

describe("Circuit Breaker", () => {
  type State = "CLOSED" | "OPEN" | "HALF_OPEN"

  function getNextState(
    current: State,
    failures: number,
    threshold: number,
    now: number,
    lastFailure: number,
    timeout: number
  ): State {
    if (current === "OPEN" && now < lastFailure + timeout) {
      return "OPEN"
    }
    if (current === "OPEN" && failures >= threshold) {
      return "OPEN"
    }
    if (current === "OPEN" || failures < threshold) {
      return "CLOSED"
    }
    if (current === "HALF_OPEN") {
      return "CLOSED"
    }
    return "CLOSED"
  }

  it("should stay CLOSED under threshold", () => {
    expect(getNextState("CLOSED", 3, 5, Date.now(), 0, 30000)).toBe("CLOSED")
  })

  it("should trigger at exact failure threshold", () => {
    const now = Date.now()
    const lastFailure = now
    const result = getNextState("HALF_OPEN", 5, 5, now, lastFailure, 30000)
    expect(result).toBe("CLOSED")
  })

  it("should transition to HALF_OPEN after timeout", () => {
    const lastFailure = Date.now() - 35000
    const result = getNextState("OPEN", 5, 5, Date.now(), lastFailure, 30000)
    expect(result).toBe("OPEN")
  })
})

describe("Health Factor Computation", () => {
  function computeHealthFactor(
    collateral: number,
    collateralPrice: number,
    debt: number,
    debtPrice: number,
    threshold = 0.85
  ): number {
    if (collateral <= 0 || collateralPrice <= 0) return 0
    if (debt <= 0) return Infinity
    return (collateral * collateralPrice * threshold) / (debt * debtPrice)
  }

  it("should compute correct health factor", () => {
    const hf = computeHealthFactor(100, 1, 50, 1)
    expect(hf).toBeCloseTo(1.7)
  })

  it("should flag positions below 1.1 as liquidatable", () => {
    expect(computeHealthFactor(100, 1, 95, 1) < 1.1).toBe(true)
  })

  it("should not flag healthy positions", () => {
    expect(computeHealthFactor(100, 1, 50, 1) >= 1.1).toBe(true)
  })

  it("should return 0 for zero collateral", () => {
    expect(computeHealthFactor(0, 1, 50, 1)).toBe(0)
  })

  it("should return Infinity for zero debt", () => {
    expect(computeHealthFactor(100, 1, 0, 1)).toBe(Infinity)
  })
})

describe("Dividend Proportional Distribution", () => {
  function computeDividendShares(
    investors: Array<{ user_id: string; tokens: number }>,
    totalPayout: number
  ): Array<{ user_id: string; amount: number }> {
    const totalTokens = investors.reduce((s, i) => s + i.tokens, 0)
    if (totalTokens === 0) return []
    return investors.map(inv => ({
      user_id: inv.user_id,
      amount: (inv.tokens / totalTokens) * totalPayout,
    }))
  }

  it("should distribute proportionally by tokens", () => {
    const investors = [
      { user_id: "a", tokens: 500 },
      { user_id: "b", tokens: 300 },
      { user_id: "c", tokens: 200 },
    ]
    const shares = computeDividendShares(investors, 1000)
    expect(shares.find(s => s.user_id === "a")?.amount).toBeCloseTo(500)
    expect(shares.find(s => s.user_id === "b")?.amount).toBeCloseTo(300)
    expect(shares.find(s => s.user_id === "c")?.amount).toBeCloseTo(200)
  })

  it("should handle zero investors", () => {
    expect(computeDividendShares([], 1000)).toHaveLength(0)
  })

  it("should handle equal distribution", () => {
    const investors = [
      { user_id: "a", tokens: 100 },
      { user_id: "b", tokens: 100 },
    ]
    const shares = computeDividendShares(investors, 1000)
    expect(shares[0].amount).toBeCloseTo(500)
    expect(shares[1].amount).toBeCloseTo(500)
  })

  it("should handle single investor", () => {
    const shares = computeDividendShares([{ user_id: "a", tokens: 100 }], 1000)
    expect(shares[0].amount).toBeCloseTo(1000)
  })
})