import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  Building2, Coins, Leaf, TrendingUp, TrendingDown, Activity,
  Shield, Users, Globe, Zap, Map, Landmark, BarChart3, ArrowRight,
  RefreshCw, ChevronRight, Vote, Wallet,
} from "lucide-react";
import {
  MOCK_PROPERTIES, STAKING_TIERS, PLATFORM_STATS,
  formatNgn, formatOsanv, fundingPct,
} from "@/lib/mock-data";
import { useGetPlatformStats, useListProperties, useListActivity } from "@workspace/api-client-react";
import { shortenAddress } from "@/lib/contract";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";

/** Format activity event amounts.
 *  - purchases  → use amountNgn (NGN value) when set
 *  - staked/retired/vote → raw string is an 18-decimal token amount; convert
 *    by stripping the last 18 digits and format with K/M suffix + unit label
 */
function formatActivityAmount(
  type: string,
  amount: string,
  amountNgn?: number | null,
): string {
  if (amountNgn && amountNgn > 0) return formatNgn(amountNgn);

  // Detect 18-decimal on-chain value (string longer than ~15 digits)
  if (amount.length > 15) {
    const intPart = amount.length > 18 ? amount.slice(0, amount.length - 18) : "0";
    const n = Number(intPart);
    const formatted =
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000   ? `${(n / 1_000).toFixed(0)}K`
      : n.toFixed(0);
    const unit =
      type === "staked" || type === "unstaked" ? " OSANV"
      : type === "retired"                     ? " tCO₂e"
      : type === "vote"                        ? " votes"
      : "";
    return `${formatted}${unit}`;
  }

  // Small number — plain token count
  const n = Number(amount);
  return isNaN(n) ? amount : `${n.toLocaleString()} tokens`;
}

const TVL_HISTORY = [
  { month: "Dec", tvl: 2_800_000_000 },
  { month: "Jan", tvl: 3_400_000_000 },
  { month: "Feb", tvl: 4_200_000_000 },
  { month: "Mar", tvl: 4_900_000_000 },
  { month: "Apr", tvl: 6_100_000_000 },
  { month: "May", tvl: 7_400_000_000 },
  { month: "Jun", tvl: 9_200_000_000 },
];

const GEO_DATA = [
  { country: "Nigeria", value: 81, color: "#0E7C66" },
  { country: "Kenya", value: 10, color: "#D4AF37" },
  { country: "Ghana", value: 6, color: "#34d399" },
  { country: "Other", value: 3, color: "#818cf8" },
];

const ASSET_CLASS = [
  { name: "Residential", value: 38, color: "#0E7C66" },
  { name: "Commercial", value: 31, color: "#D4AF37" },
  { name: "LandBank", value: 18, color: "#34d399" },
  { name: "Mixed", value: 9, color: "#818cf8" },
  { name: "Industrial", value: 4, color: "#60a5fa" },
];

const PROTOCOL_METRICS = [
  { month: "Jan", revenue: 28_000_000, stakers: 1_240 },
  { month: "Feb", revenue: 34_000_000, stakers: 1_480 },
  { month: "Mar", revenue: 31_500_000, stakers: 1_620 },
  { month: "Apr", revenue: 44_000_000, stakers: 1_890 },
  { month: "May", revenue: 52_000_000, stakers: 2_140 },
  { month: "Jun", revenue: 67_000_000, stakers: 2_550 },
];

const MOCK_POSITIONS = [
  { propertyId: 1, tokens: 500 },
  { propertyId: 2, tokens: 1000 },
  { propertyId: 5, tokens: 200 },
];

const MODULE_LINKS = [
  { href: "/properties", label: "Properties", sub: "6 live SPVs", icon: Building2, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { href: "/land-registry", label: "Land Registry", sub: "9 parcels", icon: Map, color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
  { href: "/government", label: "Government PPP", sub: "6 state partners", icon: Landmark, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { href: "/treasury", label: "Treasury", sub: "₦5B reserves", icon: BarChart3, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { href: "/staking", label: "Staking", sub: "4 APY tiers", icon: Coins, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { href: "/governance", label: "Governance", sub: "4 proposals", icon: Vote, color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
  { href: "/carbon", label: "Carbon Credits", sub: "57.4K tCO₂e", icon: Leaf, color: "text-teal-400", bg: "bg-teal-400/10 border-teal-400/20" },
  { href: "/admin", label: "Admin", sub: "Control center", icon: Shield, color: "text-white/50", bg: "bg-white/[0.05] border-white/[0.08]" },
];

function TvlTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="font-semibold text-primary">{formatNgn(payload[0]?.value)}</p>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>{p.name}: {p.dataKey === "revenue" ? formatNgn(p.value) : p.value.toLocaleString()}</p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [refreshing, setRefreshing] = useState(false);

  const { data: statsData } = useGetPlatformStats();
  const { data: propertiesData } = useListProperties();
  const { data: activityData } = useListActivity({ limit: 8 });

  const stats = statsData ?? PLATFORM_STATS;
  const allProperties = propertiesData ?? [];

  const holdings = MOCK_POSITIONS.map((h) => ({
    ...h,
    property: allProperties.find((p) => p.id === h.propertyId) ?? MOCK_PROPERTIES.find((p) => p.id === h.propertyId),
  })).filter((h) => h.property);

  const totalPortfolioValue = holdings.reduce((a, h) => a + h.tokens * (h.property?.tokenPrice ?? 0), 0);
  const totalYield = holdings.reduce((a, h) => a + h.tokens * (h.property?.tokenPrice ?? 0) * ((h.property?.yieldApy ?? 0) / 100), 0);

  return (
    <Layout>
      <CinematicPageHeader
        icon={BarChart3}
        eyebrow="Analytics"
        title="Analytics Dashboard"
        subtitle="Protocol-wide performance metrics — TVL, staking, governance and carbon activity"
        imageUrl="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
        kbVariant={1}
        imagePosition="center 40%"
        stats={[
          { label: "TVL", value: "₦9.2B", color: "text-amber-400" },
          { label: "Investors", value: "12,841" },
          { label: "Properties", value: "6", color: "text-primary" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Executive Overview</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Platform Intelligence</h1>
              <p className="text-white/40 text-sm mt-1">
                Real-time metrics across all OsanVault Africa programs and state partnerships.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 rounded-full px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · Polygon Amoy
              </div>
              <button
                onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
                className="p-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Platform KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Value Locked", value: formatNgn(stats.tvlNgn), sub: "NGN primary", icon: BarChart3, color: "text-primary", delta: "+12.4%", pos: true, glow: "shadow-[0_0_24px_rgba(14,124,102,0.12)]" },
            { label: "Active Properties", value: String(stats.propertiesLive), sub: "Live SPVs across Africa", icon: Building2, color: "text-sky-400", delta: "", pos: true, glow: "" },
            { label: "OSANV Staked", value: `${(stats.osanvStaked / 1_000_000).toFixed(1)}M`, sub: "Across all tiers", icon: Coins, color: "text-amber-400", delta: "+8.2%", pos: true, glow: "" },
            { label: "Carbon Offset", value: `${(stats.totalCarbonTonnes / 1000).toFixed(1)}K tCO₂e`, sub: "Verified credits", icon: Leaf, color: "text-emerald-400", delta: "", pos: true, glow: "" },
          ].map(({ label, value, sub, icon: Icon, color, delta, pos, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-card border border-card-border rounded-xl p-5 ${glow}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                {delta && (
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${pos ? "text-emerald-400" : "text-rose-400"}`}>
                    {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {delta}
                  </span>
                )}
              </div>
              <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
              <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Secondary KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Investors", value: stats.totalInvestors.toLocaleString(), icon: Users, color: "text-violet-400" },
            { label: "Avg Property Yield", value: `${stats.avgPropertyYield}% APY`, icon: TrendingUp, color: "text-emerald-400" },
            { label: "State Partners", value: "6", icon: Globe, color: "text-amber-400" },
            { label: "Monthly Revenue", value: formatNgn(67_000_000), icon: Activity, color: "text-primary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl px-5 py-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <div className={`font-display text-lg font-bold ${color}`}>{value}</div>
                <div className="text-xs text-white/35">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* TVL area chart */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-white">TVL Growth</h2>
                <p className="text-xs text-white/35">Total value locked — 7 months</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">+229% 6M</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TVL_HISTORY} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tvlGradExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7C66" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0E7C66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1_000_000_000).toFixed(1)}B`} />
                <Tooltip content={<TvlTooltip />} />
                <Area type="monotone" dataKey="tvl" stroke="#0E7C66" strokeWidth={2.5} fill="url(#tvlGradExec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Asset class pie */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Asset Classes</h2>
            <p className="text-xs text-white/35 mb-3">By tokenized value</p>
            <div className="flex justify-center mb-3">
              <PieChart width={140} height={140}>
                <Pie data={ASSET_CLASS} cx={65} cy={65} innerRadius={44} outerRadius={64} paddingAngle={2} dataKey="value">
                  {ASSET_CLASS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-1.5">
              {ASSET_CLASS.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-white/45">{name}</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Protocol metrics + Geo distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Protocol revenue + stakers bar chart */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-white">Protocol Activity</h2>
                <p className="text-xs text-white/35">Monthly revenue & staker growth</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PROTOCOL_METRICS} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rev" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(0)}M`} />
                <YAxis yAxisId="stk" orientation="right" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<RevenueTooltip />} />
                <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="#0E7C66" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="stk" dataKey="stakers" name="Stakers" fill="#D4AF37" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Geographic distribution */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-white/35" />
              <h2 className="font-display font-semibold text-white">Geographic Split</h2>
            </div>
            <div className="space-y-3 mb-4">
              {GEO_DATA.map(({ country, value, color }) => (
                <div key={country}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/50">{country}</span>
                    <span className="font-semibold text-white">{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value}%` }}
                      transition={{ duration: 0.7 }}
                      viewport={{ once: true }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-[10px] text-white/25">Pan-African expansion</span>
              <Link href="/government">
                <button className="text-[10px] text-primary flex items-center gap-0.5 hover:underline">
                  View PPP <ChevronRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Live activity feed + Module grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live activity */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-white/35" />
                <h2 className="font-display font-semibold text-white">Live Activity</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <div>
              {(activityData ?? []).slice(0, 6).map((event, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-b border-white/[0.04] last:border-0">
                  <div className="h-7 w-7 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
                    <Activity className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate capitalize">{event.type.replace(/_/g, " ")} — {event.propertyName ?? "Platform"}</p>
                    <p className="font-mono text-[10px] text-white/25">{event.address ? `${event.address.slice(0, 6)}...${event.address.slice(-4)}` : "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-emerald-400">{formatActivityAmount(event.type, event.amount, event.amountNgn)}</p>
                    <p className="text-[10px] text-white/25">{new Date(event.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!activityData || activityData.length === 0) && (
                <div className="py-10 text-center text-white/25 text-sm">No recent activity.</div>
              )}
            </div>
          </div>

          {/* Module shortcuts */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="font-display font-semibold text-white mb-4">Platform Modules</h2>
            <div className="grid grid-cols-2 gap-2">
              {MODULE_LINKS.map(({ href, label, sub, icon: Icon, color, bg }) => (
                <Link key={href} href={href}>
                  <div className={`border ${bg} rounded-xl p-3 hover:opacity-80 transition-opacity cursor-pointer`}>
                    <Icon className={`h-4 w-4 ${color} mb-2`} />
                    <div className="text-[11px] font-semibold text-white">{label}</div>
                    <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Personal portfolio (connected wallet only) ── */}
        {isConnected && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-white">Your Portfolio</h2>
                {address && <p className="font-mono text-[11px] text-white/30">{shortenAddress(address, 8)}</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{formatNgn(totalPortfolioValue)}</div>
                  <div className="text-[10px] text-white/30">Portfolio value</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400">{formatNgn(totalYield)}</div>
                  <div className="text-[10px] text-white/30">Est. annual yield</div>
                </div>
              </div>
            </div>
            <div>
              {holdings.map((h) => h.property && (
                <div key={h.propertyId} className="flex items-center gap-4 px-6 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <span className="text-lg">{h.property.flag}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/properties/${h.propertyId}`}>
                      <p className="text-sm font-medium text-white truncate hover:text-primary transition-colors cursor-pointer">{h.property.name}</p>
                    </Link>
                    <p className="text-[11px] text-white/30">{h.tokens.toLocaleString()} tokens · {fundingPct(h.property).toFixed(0)}% funded</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatNgn(h.tokens * (h.property.tokenPrice ?? 0))}</p>
                    <p className="text-[11px] text-emerald-400">{h.property.yieldApy}% APY</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <Link href="/portfolio">
                <button className="text-xs text-white/35 hover:text-primary transition-colors flex items-center gap-1">
                  Full portfolio <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
              <Link href="/properties">
                <button className="text-xs bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Invest More
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {!isConnected && (
          <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-display font-semibold text-white">Connect Wallet for Personal Analytics</div>
                <div className="text-sm text-white/40">View your portfolio, holdings, yield history, and staking positions.</div>
              </div>
            </div>
            <div className="shrink-0">
              <ConnectButton />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 text-xs text-white/20 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <Shield className="h-4 w-4 shrink-0 text-white/15" />
          <span>Platform metrics reflect live PostgreSQL data. On-chain positions simulate mainnet state pending Polygon deployment. SEC ARIP Sandbox · Polygon Network · Dual Land Verification · ERC-1155 Standard.</span>
        </div>
      </div>
    </Layout>
  );
}
