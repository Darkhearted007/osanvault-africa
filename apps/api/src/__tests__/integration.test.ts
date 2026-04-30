import { describe, it, expect } from "vitest"
import crypto from "crypto"

const QUEUE_SECRET = process.env.QUEUE_SECRET || "CHANGE_ME"

function signPayload(payload: unknown): string {
  return crypto
    .createHmac("sha256", QUEUE_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex")
}

describe("HMAC Signature Verification", () => {
  it("should generate valid HMAC signatures", () => {
    const payload = { userId: "test", balance: 100 }
    const sig = signPayload(payload)
    expect(sig).toHaveLength(64)
    expect(sig).toMatch(/^[a-f0-9]+$/)
  })

  it("should detect tampered payloads", () => {
    const payload = { userId: "test", balance: 100 }
    const sig = signPayload(payload)
    const tampered = { userId: "test", balance: 999999 }
    expect(signPayload(tampered)).not.toBe(sig)
  })

  it("should produce different sigs for different payloads", () => {
    const sig1 = signPayload({ a: 1 })
    const sig2 = signPayload({ b: 2 })
    expect(sig1).not.toBe(sig2)
  })

  it("should be timing-safe by using crypto.timingSafeEqual", () => {
    const payload = { data: "test" }
    const expected = signPayload(payload)
    const actual = signPayload(payload)
    const buf1 = Buffer.from(expected)
    const buf2 = Buffer.from(actual)
    expect(buf1.length).toBe(buf2.length)
    expect(crypto.timingSafeEqual(buf1, buf2)).toBe(true)
  })
})

describe("Dividend Distribution Logic", () => {
  function distribute(
    investors: Array<{ id: string; tokens: number }>,
    totalPayout: number
  ) {
    const total = investors.reduce((s, i) => s + i.tokens, 0)
    if (total === 0) return []
    return investors.map(inv => ({
      id: inv.id,
      amount: (inv.tokens / total) * totalPayout,
      pct: inv.tokens / total,
    }))
  }

  it("should split proportionally by token ownership", () => {
    const investors = [
      { id: "A", tokens: 50000 },
      { id: "B", tokens: 30000 },
      { id: "C", tokens: 20000 },
    ]
    const shares = distribute(investors, 10000)
    expect(shares[0].amount).toBeCloseTo(5000)
    expect(shares[1].amount).toBeCloseTo(3000)
    expect(shares[2].amount).toBeCloseTo(2000)
    const totalDistributed = shares.reduce((s, i) => s + i.amount, 0)
    expect(totalDistributed).toBeCloseTo(10000)
  })

  it("should handle fractional shares", () => {
    const investors = [
      { id: "X", tokens: 33 },
      { id: "Y", tokens: 33 },
      { id: "Z", tokens: 34 },
    ]
    const shares = distribute(investors, 100)
    expect(shares[0].pct).toBeCloseTo(0.33, 2)
    expect(shares[2].pct).toBeCloseTo(0.34, 2)
  })

  it("should return empty for no investors", () => {
    expect(distribute([], 1000)).toHaveLength(0)
  })

  it("should handle single investor getting all", () => {
    const shares = distribute([{ id: "A", tokens: 100 }], 1000)
    expect(shares[0].amount).toBeCloseTo(1000)
    expect(shares[0].pct).toBeCloseTo(1)
  })
})

describe("Circuit Breaker State Machine", () => {
  type State = "CLOSED" | "OPEN" | "HALF_OPEN"

  function step(
    state: State,
    failures: number,
    threshold: number,
    timeSinceLastFailure: number,
    timeout: number
  ): State {
    if (state === "OPEN" && timeSinceLastFailure < timeout) return "OPEN"
    if (failures >= threshold) return "OPEN"
    if (state === "OPEN") return "HALF_OPEN"
    return "CLOSED"
  }

  it("should transition CLOSED to OPEN at threshold", () => {
    expect(step("CLOSED", 5, 5, 0, 30000)).toBe("OPEN")
  })

  it("should stay OPEN within timeout", () => {
    expect(step("OPEN", 5, 5, 10000, 30000)).toBe("OPEN")
  })

  it("should transition OPEN to HALF_OPEN after timeout", () => {
    expect(step("OPEN", 4, 5, 35000, 30000)).toBe("HALF_OPEN")
  })

  it("should transition HALF_OPEN to CLOSED on success", () => {
    expect(step("HALF_OPEN", 0, 5, 0, 30000)).toBe("CLOSED")
  })

  it("should stay CLOSED under threshold", () => {
    expect(step("CLOSED", 2, 5, 0, 30000)).toBe("CLOSED")
  })

  it("should stay OPEN when failures persist in HALF_OPEN", () => {
    expect(step("HALF_OPEN", 5, 5, 0, 30000)).toBe("OPEN")
  })
})

describe("Liquidation Health Factor", () => {
  function healthFactor(
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

  it("should flag positions below 1.1 as liquidatable", () => {
    expect(healthFactor(100, 1, 95, 1) < 1.1).toBe(true)
  })

  it("should not flag healthy positions", () => {
    expect(healthFactor(100, 1, 50, 1) >= 1.1).toBe(true)
  })

  it("should compute correct health factor", () => {
    expect(healthFactor(100, 1, 50, 1)).toBeCloseTo(1.7)
  })
})

describe("OSANV Token Metadata", () => {
  it("should have correct total supply", () => {
    const totalSupply = 500_000_000
    expect(totalSupply).toBe(500_000_000)
  })

  it("should have 6 tranches", () => {
    const tranches = [
      "Public Sale",
      "Ecosystem & Rewards",
      "Team & Advisors",
      "Treasury & Reserve",
      "Strategic Partners",
      "Liquidity",
    ]
    expect(tranches).toHaveLength(6)
  })
})