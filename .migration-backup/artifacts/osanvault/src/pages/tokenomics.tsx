import { motion } from "framer-motion";
import { Link } from "wouter";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Coins, TrendingUp, Lock, Flame, Users, BarChart3, ArrowRight, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const TOTAL_SUPPLY = 1_000_000_000;

const TOKEN_ALLOCATION = [
  { name: "Ecosystem & Rewards", pct: 35, tokens: 350_000_000, color: "#0E7C66", desc: "Staking rewards, liquidity mining, yield distributions" },
  { name: "Treasury Reserve", pct: 20, tokens: 200_000_000, color: "#D4AF37", desc: "Protocol-owned reserves, managed by DAO governance" },
  { name: "Team & Advisors", pct: 15, tokens: 150_000_000, color: "#818cf8", desc: "4-year vesting, 1-year cliff" },
  { name: "Private Sale", pct: 12, tokens: 120_000_000, color: "#fb923c", desc: "Institutional investors, 18-month vesting" },
  { name: "Public Sale", pct: 8, tokens: 80_000_000, color: "#34d399", desc: "Community token sale, no lockup" },
  { name: "Liquidity", pct: 6, tokens: 60_000_000, color: "#f472b6", desc: "DEX liquidity provision" },
  { name: "Partnerships", pct: 4, tokens: 40_000_000, color: "#60a5fa", desc: "Strategic integrations and collaborations" },
];

const STAKING_TIERS_DATA = [
  { tier: "Bronze", lock: "30d", apr: 8, min: "50K", color: "#b45309" },
  { tier: "Silver", lock: "90d", apr: 12, min: "100K", color: "#94a3b8" },
  { tier: "Gold", lock: "180d", apr: 18, min: "200K", color: "#d97706" },
  { tier: "Platinum", lock: "365d", apr: 22, min: "500K", color: "#7c3aed" },
];

const EMISSION_SCHEDULE = [
  { year: "Y1", released: 180_000_000 },
  { year: "Y2", released: 150_000_000 },
  { year: "Y3", released: 120_000_000 },
  { year: "Y4", released: 90_000_000 },
  { year: "Y5", released: 70_000_000 },
];

const USE_CASES = [
  { icon: BarChart3, title: "Governance Voting", desc: "1 OSANV = 1 vote. 100K to propose, 5M OSANV quorum, 7-day voting, 2-day timelock." },
  { icon: Lock, title: "Staking Rewards", desc: "Lock OSANV for 30–365 days to earn 8–22% APR from protocol fee distributions." },
  { icon: Shield, title: "Platform Access", desc: "Higher OSANV holdings unlock premium features, early access to new property SPVs, and priority allocation." },
  { icon: Flame, title: "Deflationary Burn", desc: "20% of all platform fees automatically burn OSANV, reducing circulating supply permanently." },
];

export default function TokenomicsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p custom={0} variants={fadeUp} initial="hidden" animate="visible" className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Tokenomics</motion.p>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="font-display text-4xl sm:text-5xl font-bold text-white mb-5">
            OSANV Token
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-white/45 max-w-xl mx-auto leading-relaxed">
            The native governance and utility token of the ÒsánVault Africa protocol. ERC-20 on Polygon. Total supply: 1,000,000,000 OSANV.
          </motion.p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Supply", value: "1B OSANV", icon: Coins, color: "text-primary" },
            { label: "Current Price", value: "$0.042", icon: TrendingUp, color: "text-amber-400" },
            { label: "Market Cap", value: "$42M", icon: BarChart3, color: "text-blue-400" },
            { label: "Staked", value: "42.5M OSANV", icon: Lock, color: "text-violet-400" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-card border border-card-border rounded-xl p-5 text-center"
            >
              <Icon className={`h-5 w-5 ${color} mx-auto mb-2.5`} />
              <div className={`font-display text-xl font-bold ${color} mb-0.5`}>{value}</div>
              <div className="text-xs text-white/35">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Allocation + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pie chart */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Token Distribution</h2>
            <p className="text-xs text-white/35 mb-6">1,000,000,000 OSANV total supply</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <PieChart width={180} height={180}>
                  <Pie data={TOKEN_ALLOCATION} cx={85} cy={85} innerRadius={54} outerRadius={84} paddingAngle={2} dataKey="pct">
                    {TOKEN_ALLOCATION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2 flex-1">
                {TOKEN_ALLOCATION.map(({ name, pct, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-white/50 truncate">{name}</span>
                    </div>
                    <span className="font-semibold text-white ml-2 shrink-0">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emission schedule */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Emission Schedule</h2>
            <p className="text-xs text-white/35 mb-6">Tokens released per year</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={EMISSION_SCHEDULE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  formatter={(v: number) => [`${(v / 1_000_000).toFixed(0)}M OSANV`, "Released"]}
                />
                <Bar dataKey="released" fill="#0E7C66" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-display font-semibold text-white">Full Allocation Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Allocation", "%", "Tokens", "Vesting", "Purpose"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOKEN_ALLOCATION.map(({ name, pct, tokens, color, desc }) => (
                  <tr key={name} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="font-medium text-white">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{pct}%</td>
                    <td className="px-6 py-4 font-mono text-white/60 text-xs">{(tokens / 1_000_000).toFixed(0)}M</td>
                    <td className="px-6 py-4 text-white/40 text-xs">
                      {name.includes("Team") ? "4yr / 1yr cliff" : name.includes("Private") ? "18 months" : name.includes("Ecosystem") ? "Protocol-controlled" : "—"}
                    </td>
                    <td className="px-6 py-4 text-white/35 text-xs max-w-xs">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Utility */}
        <div className="mb-12">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Token Utility</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-8">What OSANV does.</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {USE_CASES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card border border-card-border rounded-xl p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Staking tiers */}
        <div className="mb-12">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Staking Tiers</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-8">Lock longer, earn more.</motion.h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAKING_TIERS_DATA.map(({ tier, lock, apr, min, color }, i) => (
              <motion.div
                key={tier}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card border border-card-border rounded-xl p-6 text-center"
                style={{ boxShadow: `0 0 20px ${color}15` }}
              >
                <div className="font-display text-lg font-bold mb-1" style={{ color }}>{tier}</div>
                <div className="font-display text-3xl font-bold text-white mb-0.5">{apr}%</div>
                <div className="text-xs text-white/35 mb-4">APR</div>
                <div className="space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-white/35">Lock period</span>
                    <span className="text-white font-medium">{lock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/35">Minimum</span>
                    <span className="text-white font-medium">{min} OSANV</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-white/[0.05]">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="font-display text-2xl font-bold text-white mb-3">Stake OSANV. Govern the protocol.</h2>
            <p className="text-white/40 text-sm mb-7">Join 3,841 stakers already earning on the ÒsánVault protocol.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/staking">
                <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_24px_rgba(14,124,102,0.35)]">
                  Stake OSANV <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/governance">
                <button className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/60 hover:text-white px-6 py-3 rounded-xl text-sm transition-all">
                  View Governance
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
