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

const WC_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "b86f11c788305f48bcdea105398e43bd";

export const wagmiConfig = getDefaultConfig({
  appName:        "OsanVault Africa",
  appDescription: "Africa's institutional-grade real estate tokenization platform on Polygon.",
  appUrl:         "https://osanvaultafrica.com",
  appIcon:        "https://osanvaultafrica.com/favicon.png",
  projectId:      WC_PROJECT_ID,
  chains:         [polygonAmoy],
  ssr:            false,
});
