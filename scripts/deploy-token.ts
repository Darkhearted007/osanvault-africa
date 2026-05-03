#!/usr/bin/env node
/**
 * OSANV Token Deployment Script
 * Supports multiple deployment methods
 */

const OSANV_CONFIG = {
  name: 'OSANV',
  symbol: 'OSANV',
  decimals: 9,
  totalSupply: 500_000_000,
  mintAuthority: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
  freezeAuthority: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           OSANV TOKEN DEPLOYMENT                            ║
╠══════════════════════════════════════════════════════════════╣
║ Token: ${OSANV_CONFIG.name} (${OSANV_CONFIG.symbol})                              ║
║ Supply: ${OSANV_CONFIG.totalSupply.toLocaleString()} tokens                            ║
║ Decimals: ${OSANV_CONFIG.decimals}                                                  ║
║ Mint Auth: ${OSANV_CONFIG.mintAuthority.slice(0,8)}...                                  ║
╚══════════════════════════════════════════════════════════════╝

METHOD 1: Solana CLI (Recommended for mainnet)
─────────────────────────────────────────────────────────────
Run these commands in your terminal:

  # 1. Create token
  solana config set --url https://api.mainnet-beta.solana.com
  spl-token create-token --decimals 9

  # 2. Get the Mint Address from the output, then:
  export MINT=<MINT_ADDRESS>

  # 3. Mint all tokens
  spl-token mint $MINT ${OSANV_CONFIG.totalSupply}

  # 4. Disable minting (irrevocable)
  spl-token authorize $MINT mint ${OSANV_CONFIG.mintAuthority}

  # 5. Create token account for wallet
  spl-token create-account $MINT

  # 6. Verify
  spl-token supply $MINT
  spl-token balance $MINT


METHOD 2: Development Wallet (requires private key)
─────────────────────────────────────────────────────────────
Set these environment variables:

  export RPC_URL="https://api.mainnet-beta.solana.com"
  export DEPLOYER_PRIVATE_KEY="<your-base58-private-key>"

Then run: npx ts-node scripts/deploy-OSANV.ts


METHOD 3: Swap (Use existing DEX)
─────────────────────────────────────────────────────────────
For existing OSANV tokens, add liquidity via:
  - Raydium: https://raydium.io/swap/
  - Jupiter: https://jup.ag/


REQUIREMENTS:
─────────────────────────────────────────────────────────────
• Wallet with ~2 SOL for rent + transaction fees
• If deploying via CLI, ensure you have your recovery phrase
• Token will be SPL token on Solana blockchain
`)

console.log('\nWant me to proceed with a specific wallet?')
console.log('Provide your private key (base58) and I can deploy directly.')