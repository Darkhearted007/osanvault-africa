import { ReactNode, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

const CLUSTER = import.meta.env.VITE_SOLANA_CLUSTER as string || 'devnet'
const CLUSTER_URL = import.meta.env.VITE_SOLANA_RPC_URL as string || clusterApiUrl(CLUSTER)

interface Props {
  children: ReactNode
}

export function SolanaWalletProvider({ children }: Props) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new BackpackWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={CLUSTER_URL}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

export { useWallet, useConnection } from '@solana/wallet-adapter-react'