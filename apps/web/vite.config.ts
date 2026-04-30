import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // SECURITY: Production security headers
  server: {
    headers: {
      // Content Security Policy - restrict sources
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://*",
        "frame-ancestors 'none'",
        "form-action 'self'",
      ].join('; '),
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      // Prevent MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      // XSS protection
      'X-XSS-Protection': '1; mode=block',
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Permissions policy
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  preview: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.mainnet-beta.solana.com",
        "frame-ancestors 'none'",
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
