/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_CLUSTER: string
  readonly VITE_SOLANA_RPC_URL: string
  readonly VITE_API_URL: string
  readonly VITE_PUTER_WORKER_URL: string
  readonly VITE_USE_PUTER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}