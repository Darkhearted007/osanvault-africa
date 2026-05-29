import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  Shield, TrendingUp, Coins, Zap, ExternalLink,
  Lock, BarChart3, ArrowRight,
} from "lucide-react";
import { formatNgn, formatOsanv, PLATFORM_STATS } from "@/lib/mock-data";
import { IS_CONTRACT_DEPLOYED, POLYGONSCAN_BASE } from "@/lib/contract";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";

const TREASURY_RESERVES = [
  { asset: "Stable Reserves", value: 2_400_000_000, pct: 48, color: "#0E7C66" },
  { asset: "Property Collateral", value: 1_200_000_000, pct: 24, color: "#D4AF37" },
  { asset: "OSANV Token", value: 800_000_000, pct: 16, color: "#818cf8" },
  { asset: "Carbon Credits", value: 400_000_000, pct: 8, color: "#34d399" },
  { asset: "Operational", value: 200_000_000, pct: 4, color: "#fb923c" },
];

const REVENUE_HISTORY = [
  { month: "Jan", fees: 18_000_000, staking: 12_000_000 },
  { month: "Feb", fees: 22_000_000, staking: 14_000_000 },
  { month: "Mar", fees: 19_000_000, staking: 13_500_000 },
  { month: "Apr", fees: 28_000_000, staking: 18_000_000 },
  { month: "May", fees: 32_000_000, staking: 21_000_000 },
  { month: "Jun", fees: 41_000_000, staking: 26_000_000 },
];

const TVL_HISTORY = [
  { month: "Jan", tvl: 3_200_000_000 },
  { month: "Feb", tvl: 4_100_000_000 },
  { month: "Mar", tvl: 4_800_000_000 },
  { month: "Apr", tvl: 5_600_000_000 },
  { month: "May", tvl: 7_200_000_000 },
  { month: "Jun", tvl: 8_600_000_000 },
];

const FEE_DISTRIBUTION = [
  { label: "Staking Rewards", pct: 40, color: "#D4AF37", desc: "Distributed to OSANV stakers proportionally" },
  { label: "Treasury Reserve", pct: 30, color: "#0E7C66", desc: "Long-term protocol reserve and stability fund" },
  { label: "Token Burn", pct: 20, color: "#f43f5e", desc: "OSANV burned to reduce circulating supply" },
  { label: "Operations", pct: 10, color: "#818cf8", desc: "Team, audits, infrastructure, compliance" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>{p.name}: {formatNgn(p.value)}</p>
      ))}
    </div>
  );
}

export default function TreasuryPage() {
  const totalTreasury = TREASURY_RESERVES.reduce((a, r) => a + r.value, 0);

  return (
    <Layout>
      <CinematicPageHeader
        icon={Shield}
        eyebrow="Protocol Treasury"
        title="Treasury Vault"
        subtitle="Protocol reserves, fee distribution flows, and timelocked vault management"
        imageUrl="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
        kbVariant={1}
        imagePosition="center 40%"
        stats={[
          { label: "Total Reserves", value: "₦5B", color: "text-amber-400" },
          { label: "Fee Burn", value: "20%", color: "text-rose-400" },
          { label: "Staking Pool", value: "40%", color: "text-emerald-400" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Protocol Treasury</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Treasury Dashboard</h1>
              <p className="text-white/40 text-sm mt-1">Protocol reserves, fee distribution, and liquidity metrics.</p>
            </div>
            {IS_CONTRACT_DEPLOYED && (
              <a
                href={`${POLYGONSCAN_BASE}/address/0x0000000000000000000000000000000000000000`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors border border-white/[0.08] px-3 py-2 rounded-lg"
              >
                TreasuryVault.sol <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Treasury", value: formatNgn(totalTreasury), icon: Shield, color: "text-primary", glow: "shadow-[0_0_20px_rgba(14,124,102,0.12)]" },
            { label: "Protocol TVL", value: formatNgn(PLATFORM_STATS.tvlNgn), icon: BarChart3, color: "text-amber-400", glow: "" },
            { label: "Monthly Revenue", value: formatNgn(41_000_000), icon: TrendingUp, color: "text-emerald-400", glow: "" },
            { label: "OSANV Burned", value: `${(4_200_000).toLocaleString()}`, icon: Coins, color: "text-violet-400", glow: "" },
          ].map(({ label, value, icon: Icon, color, glow }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`bg-card border border-card-border rounded-xl p-5 ${glow}`}
            >
              <div className="h-9 w-9 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3">
                <Icon className={`h-4.5 w-4.5 ${color}`} />
              </div>
              <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/35 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* TVL chart */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-white">TVL Growth</h2>
                <p className="text-xs text-white/35">Total value locked (6 months)</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">+169% 6M</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TVL_HISTORY}>
                <defs>
                  <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7C66" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0E7C66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1_000_000_000).toFixed(1)}B`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  formatter={(v: number) => [formatNgn(v), "TVL"]}
                />
                <Area type="monotone" dataKey="tvl" stroke="#0E7C66" strokeWidth={2} fill="url(#tvlGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Reserve allocation pie */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Reserve Allocation</h2>
            <p className="text-xs text-white/35 mb-4">By asset class</p>
            <div className="flex justify-center mb-4">
              <PieChart width={140} height={140}>
                <Pie data={TREASURY_RESERVES} cx={65} cy={65} innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value">
                  {TREASURY_RESERVES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-1.5">
              {TREASURY_RESERVES.map(({ asset, pct, color }) => (
                <div key={asset} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-white/45">{asset}</span>
                  </div>
                  <span className="font-semibold text-white">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue chart + Fee distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Monthly Protocol Revenue</h2>
            <p className="text-xs text-white/35 mb-5">Platform fees + staking income</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={REVENUE_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="fees" name="Platform Fees" fill="#0E7C66" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="staking" name="Staking Income" fill="#D4AF37" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FeeRouter distribution */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Fee Distribution</h2>
            <p className="text-xs text-white/35 mb-5">
              Via <span className="font-mono text-white/40">FeeRouter.sol</span> — auto-split on every transaction
            </p>
            <div className="space-y-4">
              {FEE_DISTRIBUTION.map(({ label, pct, color, desc }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                  <p className="text-xs text-white/30">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reserve table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-display font-semibold text-white">Reserve Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Asset", "Value (₦)", "Allocation", "Type"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TREASURY_RESERVES.map((r) => (
                  <tr key={r.asset} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                        <span className="font-medium text-white">{r.asset}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white tabular-nums">{formatNgn(r.value)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                        </div>
                        <span className="text-white/50 text-xs">{r.pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/35 text-xs capitalize">On-chain</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/[0.06] bg-white/[0.02]">
                  <td className="px-6 py-3 font-semibold text-white text-xs">Total</td>
                  <td className="px-6 py-3 font-bold text-primary">{formatNgn(totalTreasury)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-3 text-xs text-white/25 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <Lock className="h-4 w-4 shrink-0 text-white/20" />
          <span>
            Treasury managed by <span className="font-mono text-white/35">TreasuryVault.sol</span> — 2-day timelock, ₦50K daily withdrawal limit.
            All allocations shown are projected; live data posts at mainnet launch.
          </span>
        </div>
      </div>
    </Layout>
  );
}
