import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  Wallet, Building2, Coins, Leaf, TrendingUp,
  ArrowRight, ExternalLink, Shield,
} from "lucide-react";
import {
  MOCK_PROPERTIES, MOCK_CARBON_PROJECTS, STAKING_TIERS,
  formatNgn, formatOsanv, formatCredits, fundingPct,
} from "@/lib/mock-data";
import { shortenAddress, explorerAddress } from "@/lib/contract";
import Layout from "@/components/layout/Layout";

const MOCK_PROPERTY_HOLDINGS = [
  { propertyId: 1, tokens: 500 },
  { propertyId: 2, tokens: 1000 },
  { propertyId: 5, tokens: 200 },
];

const MOCK_CARBON_HOLDINGS = [
  { projectId: 2, balance: BigInt("15000000000000000000000") },
  { projectId: 4, balance: BigInt("8500000000000000000000") },
];

const MOCK_STAKE = {
  tier: 1,
  amount: 150_000,
  rewards: 4_250,
  unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 62),
};

const MOCK_TRANSACTIONS = [
  { type: "purchase", description: "Bought 500 fractions — Ekiti LandBank Phase 1", amount: "₦500,000", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), txHash: "0xprop001" },
  { type: "purchase", description: "Bought 1,000 fractions — Lagos Solar Energy SPV", amount: "₦1,000,000", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), txHash: "0xprop002" },
  { type: "staked", description: "Staked 150,000 OSANV — Silver Tier (90d)", amount: "150,000 OSANV", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21), txHash: "0xstake001" },
  { type: "retired", description: "Retired carbon credits — Lagos Solar Energy Credits", amount: "5,000 tCO₂e", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), txHash: "0xcret001" },
];

const TX_COLORS: Record<string, string> = {
  purchase: "bg-primary/10 text-primary",
  staked: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  retired: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

type Tab = "properties" | "carbon" | "staking" | "history";

function ConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-card-border rounded-2xl p-10 max-w-md w-full text-center shadow-lg"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 mx-auto">
          <Wallet className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Connect to view your property holdings, OSANV stake, carbon credits, and full transaction history.
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </motion.div>
    </div>
  );
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("properties");

  const propertyHoldings = MOCK_PROPERTY_HOLDINGS.map((h) => ({
    ...h,
    property: MOCK_PROPERTIES.find((p) => p.id === h.propertyId)!,
    valueNgn: h.tokens * (MOCK_PROPERTIES.find((p) => p.id === h.propertyId)?.tokenPrice ?? 0),
  })).filter((h) => !!h.property);

  const carbonHoldings = MOCK_CARBON_HOLDINGS.map((h) => ({
    ...h,
    project: MOCK_CARBON_PROJECTS.find((p) => p.id === h.projectId)!,
  })).filter((h) => !!h.project);

  const totalPropertyValue = propertyHoldings.reduce((a, h) => a + h.valueNgn, 0);
  const totalCarbonCredits = carbonHoldings.reduce((a, h) => a + h.balance, 0n);

  if (!isConnected) {
    return (
      <Layout>
        <ConnectPrompt />
      </Layout>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "properties", label: "Properties", icon: Building2 },
    { key: "carbon", label: "Carbon", icon: Leaf },
    { key: "staking", label: "Staking", icon: Coins },
    { key: "history", label: "History", icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
            {address && (
              <a
                href={explorerAddress(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 transition-colors"
              >
                {shortenAddress(address, 6)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <Link href="/properties">
            <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              <Building2 className="h-4 w-4" />
              Browse Properties
            </button>
          </Link>
        </div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Property Value", value: formatNgn(totalPropertyValue), icon: Building2, color: "bg-primary/10 text-primary" },
            { label: "Properties Held", value: `${propertyHoldings.length}`, icon: TrendingUp, color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
            { label: "Carbon Credits", value: `${formatCredits(totalCarbonCredits)} tCO₂e`, icon: Leaf, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
            { label: "OSANV Staked", value: formatOsanv(MOCK_STAKE.amount), icon: Coins, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl p-4 shadow-sm">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg mb-2.5 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "properties" && (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Property Holdings</h2>
              <span className="text-sm text-muted-foreground">{propertyHoldings.length} SPVs</span>
            </div>
            {propertyHoldings.length === 0 ? (
              <div className="py-14 text-center">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No property holdings yet.</p>
                <Link href="/properties">
                  <button className="mt-3 text-sm text-primary font-medium hover:underline flex items-center gap-1 mx-auto">
                    Browse Properties <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Value</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Yield APY</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Est. Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyHoldings.map((h) => {
                      const annualYield = h.valueNgn * h.property.yieldApy / 100;
                      const pct = fundingPct(h.property);
                      return (
                        <tr key={h.propertyId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{h.property.flag}</span>
                              <div>
                                <Link href={`/properties/${h.propertyId}`}>
                                  <span className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                                    {h.property.name}
                                  </span>
                                </Link>
                                <p className="text-xs text-muted-foreground">{h.property.location} · {pct.toFixed(0)}% funded</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground tabular-nums">
                            {h.tokens.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right hidden sm:table-cell font-medium text-foreground">
                            {formatNgn(h.valueNgn)}
                          </td>
                          <td className="px-6 py-4 text-right hidden md:table-cell">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{h.property.yieldApy}%</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{formatNgn(annualYield)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="px-6 py-3 text-xs font-semibold text-muted-foreground" colSpan={2}>Total</td>
                      <td className="px-6 py-3 text-right hidden sm:table-cell font-bold text-foreground">{formatNgn(totalPropertyValue)}</td>
                      <td className="px-6 py-3 hidden md:table-cell" />
                      <td className="px-6 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatNgn(propertyHoldings.reduce((a, h) => a + h.valueNgn * h.property.yieldApy / 100, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "carbon" && (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Carbon Credit Holdings</h2>
              <Link href="/carbon">
                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                  Retire Credits <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
            {carbonHoldings.length === 0 ? (
              <div className="py-14 text-center">
                <Leaf className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No carbon credits yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonHoldings.map((h) => (
                      <tr key={h.projectId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{h.project.flag}</span>
                            <div>
                              <p className="font-medium text-foreground">{h.project.name}</p>
                              <p className="text-xs text-muted-foreground">{h.project.methodology} · {h.project.region}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-foreground tabular-nums">
                          {formatCredits(h.balance)} tCO₂e
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/carbon">
                            <button className="text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20">
                              Retire
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "staking" && (
          <div className="space-y-4">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-foreground mb-1">Active Stake</h2>
                  <p className="text-xs text-muted-foreground">Staked in the StakingVault contract</p>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STAKING_TIERS[MOCK_STAKE.tier].bgClass} ${STAKING_TIERS[MOCK_STAKE.tier].textClass}`}>
                  {STAKING_TIERS[MOCK_STAKE.tier].emoji} {STAKING_TIERS[MOCK_STAKE.tier].name}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Amount Staked", value: formatOsanv(MOCK_STAKE.amount) },
                  { label: "APR", value: `${STAKING_TIERS[MOCK_STAKE.tier].apr}%` },
                  { label: "Pending Rewards", value: `+${MOCK_STAKE.rewards.toLocaleString()} OSANV` },
                  { label: "Unlock Date", value: MOCK_STAKE.unlockDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className="font-semibold text-foreground text-sm">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Link href="/staking">
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                    Manage Stake
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Transaction History</h2>
            </div>
            <div>
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${TX_COLORS[tx.type] ?? "bg-muted"}`}>
                    {tx.type === "purchase" ? <Building2 className="h-4 w-4" /> :
                     tx.type === "staked" ? <Coins className="h-4 w-4" /> :
                     <Leaf className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground text-sm">{tx.amount}</p>
                    <a
                      href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-0.5 ml-auto"
                    >
                      Tx <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 rounded-xl p-4">
          <Shield className="h-4 w-4 shrink-0" />
          <span>Portfolio data shown is for demonstration. Live on-chain balances will sync after mainnet deployment on Polygon.</span>
        </div>
      </div>
    </Layout>
  );
}
