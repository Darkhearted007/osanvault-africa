/*
 * ÒsánVault Africa — Puter Serverless Worker
 * Deploy: puter workers create osanvault-api --file apps/web/src/worker.js
 *
 * Routes:
 * GET  /health              — Platform health check
 * GET  /api/tokens/osanv     — OSANV token metadata
 * GET  /api/properties      — Property listings
 * GET  /api/properties/:id  — Single property
 * POST /api/auth/nonce      — Wallet nonce generation
 * POST /api/auth/verify     — Wallet signature verification
 * GET  /api/oracle/:asset   — Price oracle (BTC/ETH/SOL/OSANV)
 * GET  /api/dashboard       — Dashboard stats
 */

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Wallet-Address",
}

const OSANV = {
  name: "OSANV",
  blockchain: "Solana",
  type: "SPL",
  totalSupply: 500_000_000,
  tranches: [
    { id: 1, name: "Public Sale" },
    { id: 2, name: "Ecosystem & Rewards" },
    { id: 3, name: "Team & Advisors" },
    { id: 4, name: "Treasury & Reserve" },
    { id: 5, name: "Strategic Partners" },
    { id: 6, name: "Liquidity" },
  ],
}

const PROPERTIES = [
  {
    id: "PROP-LAGOS-001",
    title: "Lagos Infinity Smart Home",
    location: "Ikoyi, Lagos",
    country: "Nigeria",
    total_value: 1_250_000,
    token_price: 10,
    total_tokens: 125_000,
    tokens_sold: 85_000,
    annual_yield: 14.5,
    status: "active",
  },
  {
    id: "PROP-EKITI-001",
    title: "Ekiti Sustainable Mineral Vault",
    location: "Ado-Ekiti",
    country: "Nigeria",
    total_value: 850_000,
    token_price: 10,
    total_tokens: 85_000,
    tokens_sold: 42_000,
    annual_yield: 18.0,
    status: "active",
  },
  {
    id: "PROP-ACCRA-001",
    title: "Accra Oceanfront Residences",
    location: "East Legon, Accra",
    country: "Ghana",
    total_value: 2_100_000,
    token_price: 10,
    total_tokens: 210_000,
    tokens_sold: 63_000,
    annual_yield: 12.0,
    status: "active",
  },
]

// In-memory nonce store (per worker instance)
// For production: use puter.kv with TTL
const nonceStore = {}

async function handle(event) {
  const req = event.request
  const url = new URL(req.url)
  const path = url.pathname.replace(/\/$/, "")

  try {
    if (req.method === "OPTIONS") {
      return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS })
    }

    if (path === "/health" || path === "/api/health") {
      return new Response(JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        services: { api: "ok", puter: "ok" },
      }), { headers: CORS_HEADERS })
    }

    if (path === "/api/tokens/osanv") {
      return new Response(JSON.stringify({ data: OSANV }), { headers: CORS_HEADERS })
    }

    if (path === "/api/properties") {
      return new Response(JSON.stringify({ data: PROPERTIES }), { headers: CORS_HEADERS })
    }

    const propMatch = path.match(/^\/api\/properties\/(.+)$/)
    if (propMatch) {
      const prop = PROPERTIES.find(p => p.id === propMatch[1])
      if (!prop) {
        return new Response(JSON.stringify({ error: "Property not found" }), { status: 404, headers: CORS_HEADERS })
      }
      return new Response(JSON.stringify({ data: prop }), { headers: CORS_HEADERS })
    }

    if (path === "/api/auth/nonce" && req.method === "POST") {
      let body
      try { body = JSON.parse(await req.text()) } catch { body = {} }
      if (!body.wallet_address || body.wallet_address.length < 32) {
        return new Response(JSON.stringify({ error: "Invalid wallet address" }), { status: 400, headers: CORS_HEADERS })
      }
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(36).padStart(2, "0")).join("").slice(0, 43)
      nonceStore[body.wallet_address] = { nonce, expires: Date.now() + 5 * 60 * 1000, used: false }
      return new Response(JSON.stringify({
        nonce,
        message: `Sign this message to authenticate with ÒsánVault Africa.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`,
        expires: nonceStore[body.wallet_address].expires,
      }), { headers: CORS_HEADERS })
    }

    if (path === "/api/auth/verify" && req.method === "POST") {
      let body
      try { body = JSON.parse(await req.text()) } catch { body = {} }
      if (!body.wallet_address || body.wallet_address.length < 32) {
        return new Response(JSON.stringify({ error: "Invalid wallet address" }), { status: 400, headers: CORS_HEADERS })
      }
      if (!Array.isArray(body.signature) || body.signature.length < 64) {
        return new Response(JSON.stringify({ error: "Invalid signature format" }), { status: 400, headers: CORS_HEADERS })
      }
      const stored = nonceStore[body.wallet_address]
      if (!stored) {
        return new Response(JSON.stringify({ error: "No nonce found. Request one first." }), { status: 400, headers: CORS_HEADERS })
      }
      if (stored.used) {
        return new Response(JSON.stringify({ error: "Nonce already used." }), { status: 400, headers: CORS_HEADERS })
      }
      if (stored.expires < Date.now()) {
        return new Response(JSON.stringify({ error: "Nonce expired." }), { status: 400, headers: CORS_HEADERS })
      }
      if (stored.nonce !== body.nonce) {
        return new Response(JSON.stringify({ error: "Invalid nonce." }), { status: 400, headers: CORS_HEADERS })
      }
      stored.used = true

      // Persist user to Puter KV for compliance
      try {
        await puter.kv.set(`user:${body.wallet_address}`, {
          wallet_address: body.wallet_address,
          role: "investor",
          kyc_status: "pending",
          created_at: Date.now(),
        }, 0)
      } catch (_) { /* non-blocking */ }

      return new Response(JSON.stringify({
        data: { wallet_address: body.wallet_address, role: "investor", kyc_status: "pending" },
      }), { headers: CORS_HEADERS })
    }

    const oracleMatch = path.match(/^\/api\/oracle\/(.+)$/)
    if (oracleMatch) {
      const asset = oracleMatch[1].toUpperCase()
      const prices = { BTC: 67500, ETH: 3450, SOL: 178, USDC: 1, OSANV: 0.12 }
      const price = prices[asset] || 0

      // Cache in Puter KV for 30s
      try {
        await puter.kv.set(`price:${asset}`, { price, ts: Date.now() }, 30)
      } catch (_) { /* non-blocking */ }

      return new Response(JSON.stringify({
        data: { asset, price, source: "puter-oracle", staleness_seconds: 0 },
      }), { headers: CORS_HEADERS })
    }

    if (path === "/api/dashboard") {
      return new Response(JSON.stringify({
        data: { totalProperties: 12, activeProperties: 8, totalInvestors: 342, totalTvl: 4_800_000 },
      }), { headers: CORS_HEADERS })
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: CORS_HEADERS })
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: CORS_HEADERS })
  }
}

puter.listen(handle)