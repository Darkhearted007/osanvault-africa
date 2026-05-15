import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SolanaWalletProvider } from './WalletProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SolanaWalletProvider>
          <App />
        </SolanaWalletProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
