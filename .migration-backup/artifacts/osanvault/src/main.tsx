import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
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

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: "40px",
          fontFamily: "system-ui, sans-serif",
          color: "#ffffff",
          background: "#0d1f0f",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}>
          <h1 style={{ color: "#d4a017", margin: 0 }}>OsanVault failed to load</h1>
          <p style={{ color: "#aaa", margin: 0 }}>
            Please refresh the page. If the problem persists, try clearing your browser cache.
          </p>
          <pre style={{
            color: "#d4a017",
            background: "rgba(0,0,0,0.4)",
            padding: "16px",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            maxWidth: "800px",
            fontSize: "12px",
            border: "1px solid rgba(212,160,23,0.3)",
          }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={rainbowTheme} locale="en-US">
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);
