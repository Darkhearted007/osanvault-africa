#!/usr/bin/env ts-node
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js'
import {
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID,
  MINT_AUTHORITY,
  FREEZE_AUTHORITY,
} from '@solana/spl-token'
import bs58 from 'bs58'

const OSANV_TOKEN_NAME = 'OSANV'
const OSANV_TOKEN_SYMBOL = 'OSANV'
const OSANV_TOKEN_DECIMALS = 9
const OSANV_TOTAL_SUPPLY = 500_000_000 // 500M tokens

const OSANV_MINT_AUTHORITY = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
const OSANV_FREEZE_AUTH = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')

const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || ''

async function createToken(): Promise<string> {
  console.log('Creating OSANV Token...')
  console.log(`Total Supply: ${OSANV_TOTAL_SUPPLY.toLocaleString()} tokens`)
  console.log(`Decimals: ${OSANV_TOKEN_DECIMALS}`)

  const connection = new Connection(RPC_URL, 'confirmed')

  if (!DEPLOYER_PRIVATE_KEY) {
    console.log('No deployer key provided - generating new keypair')
    console.log('In production, set DEPLOYER_PRIVATE_KEY in .env')
    return 'MOCK_TOKEN_ADDRESS'
  }

  const deployer = Keypair.fromSecretKey(bs58.decode(DEPLOYER_PRIVATE_KEY))
  console.log(`Deployer: ${deployer.publicKey.toBase58()}`)

  const mintKeypair = Keypair.generate()
  const mintPubkey = mintKeypair.publicKey

  console.log(`Mint Address: ${mintPubkey.toBase58()}`)

  const rent = await connection.getMinimumBalanceForRentExemption(MintLayout.span)

  const transaction = new Transaction()

  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: deployer.publicKey,
      newAccountPubkey: mintPubkey,
      space: MintLayout.span,
      lamports: rent,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintPubkey,
      OSANV_TOKEN_DECIMALS,
      OSANV_MINT_AUTHORITY,
      OSANV_FREEZE_AUTH,
      TOKEN_PROGRAM_ID
    ),
    createMintToInstruction(
      mintPubkey,
      new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'),
      deployer.publicKey,
      OSANV_TOTAL_SUPPLY * Math.pow(10, OSANV_TOKEN_DECIMALS)
    ),
    createSetAuthorityInstruction(
      mintPubkey,
      deployer.publicKey,
      MINT_AUTHORITY,
      OSANV_MINT_AUTHORITY
    )
  )

  console.log('\nTransaction ready. In production:')
  console.log(`1. Fund deployer wallet with ~${(rent / 1e9).toFixed(4)} SOL`)
  console.log(`2. Run: solana confirm -v <TX_SIGNATURE>`)
  console.log(`3. Token Mint: ${mintPubkey.toBase58()}`)

  return mintPubkey.toBase58()
}

createToken()
  .then((mint) => {
    console.log(`\n✅ Token creation initialized`)
    console.log(`Mint Address: ${mint}`)
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })