import { ReactNode, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger'
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase'
import { clusterApiUrl } from '@solana/web3.js'
import type { Cluster } from '@solana/web3.js'
const CLUSTER = (import.meta.env.VITE_SOLANA_CLUSTER || 'devnet') as Cluster
const CLUSTER_URL = import.meta.env.VITE_SOLANA_RPC_URL
  ? import.meta.env.VITE_SOLANA_RPC_URL
  : clusterApiUrl(CLUSTER)

interface Props {
  children: ReactNode
}

export function SolanaWalletProvider({ children }: Props) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={CLUSTER_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export { useWallet, useConnection } from '@solana/wallet-adapter-react'