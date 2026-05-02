#!/usr/bin/env ts-node
import { Connection, PublicKey } from '@solana/web3.js'

const OSANV_TOKEN_DECIMALS = 9
const OSANV_TOTAL_SUPPLY = 500_000_000
const OSANV_MINT_AUTHORITY = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
const OSANV_FREEZE_AUTH = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'

const OSANV_TOKEN_CONFIG = {
  name: 'OSANV',
  symbol: 'OSANV',
  decimals: OSANV_TOKEN_DECIMALS,
  totalSupply: OSANV_TOTAL_SUPPLY,
  mintAuthority: OSANV_MINT_AUTHORITY.toBase58(),
  freezeAuthority: OSANV_FREEZE_AUTH.toBase58(),
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss6VQEg',
}

console.log('╔═══════════════════════════════════════════════════════════════╗')
console.log('║                 OSANV TOKEN DEPLOYMENT CONFIG                  ║')
console.log('╠═══════════════════════════════════════════════════════════════╣')
console.log(`║ Token Name:     ${OSANV_TOKEN_CONFIG.name.padEnd(45)}║`)
console.log(`║ Symbol:         ${OSANV_TOKEN_CONFIG.symbol.padEnd(45)}║`)
console.log(`║ Decimals:       ${OSANV_TOKEN_CONFIG.decimals.toString().padEnd(45)}║`)
console.log(`║ Total Supply:   ${OSANV_TOKEN_CONFIG.totalSupply.toLocaleString().padEnd(45)}║`)
console.log(`║ Mint Auth:      ${OSANV_TOKEN_CONFIG.mintAuthority.slice(0, 10)}...${OSANV_TOKEN_CONFIG.mintAuthority.slice(-8).padEnd(26)}║`)
console.log('╠═══════════════════════════════════════════════════════════════╣')
console.log('║                     DEPLOYMENT STEPS                           ║')
console.log('╠═══════════════════════════════════════════════════════════════╣')
console.log('║ 1. Install dependencies:                                     ║')
console.log('║    npm install @solana/web3.js @solana/spl-token              ║')
console.log('║ 2. Set private key in .env:                                    ║')
console.log('║    DEPLOYER_PRIVATE_KEY=<base58_key>                         ║')
console.log('║ 3. Fund wallet with ~2 SOL for rent + fees                   ║')
console.log('║ 4. Run: ts-node scripts/deploy-OSANV.ts                      ║')
console.log('╠═══════════════════════════════════════════════════════════════╣')
console.log('║  Alternative - Use Solana CLI:                                ║')
console.log('║  spl-token create-token --decimals 9                          ║')
console.log('║  spl-token authorize <MINT> mint <AUTHORITY>                  ║')
console.log('║  spl-token mint <MINT> 500000000                              ║')
console.log('╚═══════════════════════════════════════════════════════════════╝')

async function verifyConnection() {
  const connection = new Connection(RPC_URL, 'confirmed')
  try {
    const version = await connection.getVersion()
    console.log(`\n✅ Connected to Solana (version: ${version.solanaCore})`)
    return true
  } catch (e) {
    console.log('\n⚠️  Could not connect to RPC - CLI deployment still works')
    return false
  }
}

verifyConnection()