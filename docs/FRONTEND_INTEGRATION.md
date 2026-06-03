# Frontend Integration Guide — OsanVault

## Wallet Connection (wagmi + viem)

```bash
cd frontend
npm install wagmi viem @web3modal/wagmi @web3modal/modal
```

**components/WalletConnect.tsx**
```tsx
import { useAccount, useConnect } from 'wagmi';
import { metaMaskConnector } from 'wagmi/connectors/metaMask';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect({ connector: metaMaskConnector() })}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

---

## API Integration (React Query)

```bash
npm install @tanstack/react-query axios
```

**hooks/useMarketplace.ts**
```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => API.get('/api/properties').then(r => r.data),
  });
}

export function useBuyProperty() {
  return useMutation({
    mutationFn: (data) => API.post('/api/investments/buy', data),
  });
}

export function usePortfolio(address: string) {
  return useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => API.get(`/api/users/${address}/portfolio`).then(r => r.data),
    enabled: !!address,
  });
}
```

---

## Contract Interaction (ethers.js)

**utils/contracts.ts**
```ts
import { ethers } from 'ethers';
import ROUTER_ABI from './abis/OsanVaultRouter.json';

const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS!;

export function getRouterContract(signer: ethers.Signer) {
  return new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
}

export async function buyProperty(
  signer: ethers.Signer,
  listingId: number,
  amount: number,
) {
  const router = getRouterContract(signer);
  const tx = await router.buyProperty(
    await router.marketplace(),
    listingId,
    amount,
    ethers.ZeroAddress,
    0,
  );
  return tx.wait();
}

export async function claimYield(signer: ethers.Signer, revenueId: string) {
  const router = getRouterContract(signer);
  const tx = await router.claimYield(revenueId);
  return tx.wait();
}
```

---

## State Management (Zustand)

```bash
npm install zustand
```

**store/useApp.ts**
```ts
import { create } from 'zustand';

interface AppState {
  wallet: string | null;
  portfolio: any;
  setWallet: (wallet: string) => void;
  setPortfolio: (portfolio: any) => void;
}

export const useApp = create<AppState>((set) => ({
  wallet: null,
  portfolio: null,
  setWallet: (wallet) => set({ wallet }),
  setPortfolio: (portfolio) => set({ portfolio }),
}));
```

---

## UI Components

**components/PropertyCard.tsx**
```tsx
import { useBuyProperty } from '@/hooks/useMarketplace';
import { useAccount, useSigner } from 'wagmi';

export function PropertyCard({ property }: { property: any }) {
  const { address } = useAccount();
  const { buyProperty } = useBuyProperty();
  
  return (
    <div className="border rounded p-4">
      <h3>{property.title}</h3>
      <p>{property.location}</p>
      <p>Price: ${property.price}</p>
      <p>Risk Score: {property.risk_score}/100</p>
      <button 
        onClick={() => buyProperty({ 
          buyer: address, 
          propertyId: property.id,
          amount: 1,
        })}
      >
        Buy Now
      </button>
    </div>
  );
}
```

---

## Config

**.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_ROUTER_ADDRESS=0x...
```

---

## Pages

**app/page.tsx** — Homepage / Property Marketplace  
**app/portfolio/** — User portfolio & holdings  
**app/admin/** — Admin dashboard (property listings, risk scores)

Done! 🚀
