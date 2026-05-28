import "@rainbow-me/rainbowkit/styles.css";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import App from "./App";
import { wagmiConfig } from "./lib/wagmi";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rainbowTheme = lightTheme({
  accentColor: "hsl(127, 38%, 37%)",
  accentColorForeground: "white",
  borderRadius: "medium",
  fontStack: "system",
});

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={rainbowTheme} locale="en-US">
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
