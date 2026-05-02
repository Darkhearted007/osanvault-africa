import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { SolanaWalletProvider } from './WalletProvider'
import { Layout } from './components/Layout'

import HomePage from './pages/Home'
import AssetsPage from './pages/Assets'
import PropertyDetailPage from './pages/PropertyDetail'
import DashboardPage from './pages/Dashboard'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaWalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="assets/:id" element={<PropertyDetailPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SolanaWalletProvider>
  </StrictMode>
)
