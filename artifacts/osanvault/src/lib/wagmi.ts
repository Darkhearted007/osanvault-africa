import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const polygonAmoy = defineChain({
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-amoy.polygon.technology"] },
    public: { http: ["https://rpc-amoy.polygon.technology"] },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "OsanVault Africa",
  projectId: "b86f11c788305f48bcdea105398e43bd",
  chains: [polygonAmoy],
  ssr: false,
});
