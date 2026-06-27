import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Building2, TrendingUp, Coins, Shield, CheckCircle2, ChevronRight,
  Calculator, Zap, Globe, FileText, Users, Leaf, ArrowRight,
  Star, Lock, BadgeCheck, Sparkles, DollarSign, BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import { formatNgn } from "@/lib/mock-data";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";

/* ── Fee schedule ─────────────────────────────────────────── */
const TIERS = [
  {
    name: "Starter",
    badge: "Entry",
    badgeColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    listingFeePercent: 2.5,
    platformFeePercent: 2.0,
    yieldFeePercent: 8,
    deploymentFeeNgn: 500_000,
    complianceFeeNgn: 250_000,
    landVerifyFeeNgn: 150_000,
    minRaiseNgn: 50_000_000,
    maxRaiseNgn: 500_000_000,
    features: [
      "ERC-1155 token deployment",
      "SEC ARIP Sandbox registration",
      "KYC/AML onboarding",
      "Basic analytics dashboard",
      "OsanVault marketplace listing",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    listingFeePercent: 2.0,
    platformFeePercent: 1.5,
    yieldFeePercent: 6,
    deploymentFeeNgn: 500_000,
    complianceFeeNgn: 250_000,
    landVerifyFeeNgn: 150_000,
    minRaiseNgn: 500_000_000,
    maxRaiseNgn: 5_000_000_000,
    features: [
      "Everything in Starter",
      "Dual land verification (Govt + Indigenous)",
      "Carbon credit linkage",
      "Priority placement in marketplace",
      "Governance proposal rights",
      "Staking yield integration",
      "Dedicated compliance officer",
    ],
    highlight: true,
  },
  {
    name: "Institutional",
    badge: "Enterprise",
    badgeColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    listingFeePercent: 1.5,
    platformFeePercent: 1.0,
    yieldFeePercent: 4,
    deploymentFeeNgn: 500_000,
    complianceFeeNgn: 250_000,
    landVerifyFeeNgn: 150_000,
    minRaiseNgn: 5_000_000_000,
    maxRaiseNgn: Infinity,
    features: [
      "Everything in Growth",
      "Government PPP partnership track",
      "Custom SPV structure",
      "Multi-state land portfolio",
      "White-label investor portal",
      "Real-time oracle price feeds",
      "Direct treasury reserve integration",
      "SLA-backed support",
    ],
    highlight: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Submit Property", desc: "Upload land title, valuation report, and entity documents via our secure portal.", icon: FileText },
  { step: "02", title: "Dual Verification", desc: "Government ministry and indigenous authority verify the title on LandRegistry.sol.", icon: BadgeCheck },
  { step: "03", title: "SPV Structuring", desc: "OsanVault legal team structures the Special Purpose Vehicle and token economics.", icon: Building2 },
  { step: "04", title: "Token Deployment", desc: "ERC-1155 fractions minted on Polygon. Token price, supply, and yield set by you.", icon: Zap },
  { step: "05", title: "Investor Raise", desc: "Property listed on the OsanVault marketplace. Fractional investors fund the SPV.", icon: Users },
  { step: "06", title: "Yield Distribution", desc: "Rental income and capital returns distributed automatically on-chain via FeeRouter.sol.", icon: Coins },
];

const REVENUE_MULTIPLIERS = [
  { label: "Carbon Credits", desc: "Link your property to a carbon project and earn tCO₂e revenue on top of rental yield.", color: "text-emerald-400", icon: Leaf },
  { label: "Staking Incentives", desc: "OSANV stakers who hold your property tokens receive bonus APR, driving demand.", color: "text-amber-400", icon: TrendingUp },
  { label: "Governance Weight", desc: "Token holders vote on upgrade proposals — creating a community co-owner dynamic.", color: "text-violet-400", icon: Shield },
  { label: "Secondary Liquidity", desc: "Fractional tokens trade on secondary markets post-lockup, improving price discovery.", color: "text-sky-400", icon: BarChart3 },
];

/* ── Revenue calculator ───────────────────────────────────── */
function RevenueCalculator() {
  const [raiseNgn, setRaiseNgn] = useState(1_000_000_000);
  const [yieldApy, setYieldApy] = useState(14);
  const [holdYears, setHoldYears] = useState(3);
  const [tierIdx, setTierIdx] = useState(1);
  const tier = TIERS[tierIdx];

  const listingFee = raiseNgn * (tier.listingFeePercent / 100);
  const deployFee = tier.deploymentFeeNgn + tier.complianceFeeNgn + tier.landVerifyFeeNgn;
  const totalUpfrontCost = listingFee + deployFee;
  const netRaise = raiseNgn - totalUpfrontCost;

  const annualYieldPool = raiseNgn * (yieldApy / 100);
  const platformCutPerYear = annualYieldPool * (tier.yieldFeePercent / 100);
  const issuerNetPerYear = annualYieldPool - platformCutPerYear;
  const totalIssuerReturn = issuerNetPerYear * holdYears;
  const osanvaultTotalRevenue = listingFee + platformCutPerYear * holdYears;
  const roi = ((totalIssuerReturn - totalUpfrontCost) / totalUpfrontCost) * 100;

  const projectionData = Array.from({ length: holdYears + 1 }, (_, i) => ({
    year: `Y${i}`,
    issuer: Math.round(i * issuerNetPerYear / 1_000_000),
    platform: Math.round(i * platformCutPerYear / 1_000_000),
  }));

  const splitData = [
    { name: "Issuer Net", value: Math.round(issuerNetPerYear / 1_000_000), color: "#0E7C66" },
    { name: "Platform Fee", value: Math.round(platformCutPerYear / 1_000_000), color: "#D4AF37" },
  ];

  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-white">Revenue Calculator</h2>
        </div>
        <p className="text-sm text-white/40">Model your tokenization economics before you commit.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Tier selector */}
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block mb-2">Tokenization Tier</label>
            <div className="flex gap-2">
              {TIERS.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setTierIdx(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    tierIdx === i
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white/70"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Raise amount slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Target Raise</label>
              <span className="text-sm font-bold text-white">{formatNgn(raiseNgn)}</span>
            </div>
            <input
              type="range" min={50_000_000} max={10_000_000_000} step={50_000_000}
              value={raiseNgn}
              onChange={(e) => setRaiseNgn(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/[0.08] accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>₦50M</span><span>₦10B</span>
            </div>
          </div>

          {/* Yield APY slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Annual Yield (APY)</label>
              <span className="text-sm font-bold text-amber-400">{yieldApy}%</span>
            </div>
            <input
              type="range" min={6} max={25} step={0.5}
              value={yieldApy}
              onChange={(e) => setYieldApy(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/[0.08] accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>6%</span><span>25%</span>
            </div>
          </div>

          {/* Hold period */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Hold Period</label>
              <span className="text-sm font-bold text-sky-400">{holdYears} {holdYears === 1 ? "year" : "years"}</span>
            </div>
            <input
              type="range" min={1} max={10} step={1}
              value={holdYears}
              onChange={(e) => setHoldYears(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/[0.08] accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>1 yr</span><span>10 yrs</span>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 space-y-2.5">
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">One-Time Costs</div>
            {[
              { label: `Listing fee (${tier.listingFeePercent}% of raise)`, value: listingFee, color: "text-amber-400" },
              { label: "Contract deployment", value: tier.deploymentFeeNgn, color: "text-white/60" },
              { label: "Compliance & KYC", value: tier.complianceFeeNgn, color: "text-white/60" },
              { label: "Land verification", value: tier.landVerifyFeeNgn, color: "text-white/60" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-white/40">{label}</span>
                <span className={`font-semibold tabular-nums ${color}`}>{formatNgn(value)}</span>
              </div>
            ))}
            <div className="border-t border-white/[0.07] pt-2.5 flex justify-between text-sm">
              <span className="font-semibold text-white">Total Upfront</span>
              <span className="font-bold text-rose-400 tabular-nums">{formatNgn(totalUpfrontCost)}</span>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Net Raise", value: formatNgn(netRaise), color: "text-primary", sub: "After upfront fees" },
              { label: "Annual Issuer Yield", value: formatNgn(issuerNetPerYear), color: "text-emerald-400", sub: `After ${tier.yieldFeePercent}% platform cut` },
              { label: `${holdYears}Y Total Return`, value: formatNgn(totalIssuerReturn), color: "text-amber-400", sub: "Gross yield to issuer" },
              { label: "ROI on Costs", value: `${roi > 0 ? "+" : ""}${roi.toFixed(0)}%`, color: roi > 0 ? "text-emerald-400" : "text-rose-400", sub: `Over ${holdYears} years` },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className={`font-display text-lg font-bold ${color} tabular-nums`}>{value}</div>
                <div className="text-xs text-white/40 mt-0.5">{label}</div>
                <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* OsanVault revenue card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">OsanVault Total Revenue</span>
            </div>
            <div className="font-display text-2xl font-bold text-primary">{formatNgn(osanvaultTotalRevenue)}</div>
            <p className="text-xs text-white/35 mt-1">
              Platform earns {formatNgn(listingFee)} upfront + {formatNgn(platformCutPerYear)}/yr in yield fees over {holdYears} {holdYears === 1 ? "year" : "years"}.
            </p>
          </div>

          {/* Projection chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/35 uppercase tracking-widest">Cumulative Returns (₦M)</span>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-white/40">Issuer</span></div>
                <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span className="text-white/40">Platform</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="issuerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7C66" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0E7C66" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="platformGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v}M`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  formatter={(v: number) => [`₦${v}M`]}
                />
                <Area type="monotone" dataKey="issuer" name="Issuer" stroke="#0E7C66" strokeWidth={2} fill="url(#issuerGrad)" />
                <Area type="monotone" dataKey="platform" name="Platform" stroke="#D4AF37" strokeWidth={1.5} fill="url(#platformGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function IssuerPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Layout>
      <CinematicPageHeader
        eyebrow="Issuer Portal"
        icon={BadgeCheck}
        title="List a Property"
        subtitle="Tokenize your real estate asset and raise capital from fractional investors across Africa."
        imageUrl="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
        kbVariant={2}
        stats={[
          { label: "Min. Raise", value: "₦50M" },
          { label: "Avg APY", value: "12.6%" },
          { label: "Investors", value: "2,550+" },
          { label: "Countries", value: "6" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-5">
            <Building2 className="h-3.5 w-3.5" /> Issuer Portal — Real Estate Partners
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Tokenize Your Property.<br />
            <span className="text-primary">Raise Capital Across Africa.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            List your real estate asset on OsanVault Africa — Africa's institutional tokenization platform.
            Reach thousands of fractional investors from ₦1,000 per token.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="#calculator">
              <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors">
                <Calculator className="h-4 w-4" /> Calculate Your Revenue
              </button>
            </a>
            <a href="#apply">
              <button className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors">
                Apply to List <ArrowRight className="h-4 w-4" />
              </button>
            </a>
          </div>
        </motion.div>

        {/* Why tokenize with OsanVault */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: "₦5.36B+ TVL", sub: "Total platform capital raised", icon: TrendingUp, color: "text-primary" },
            { label: "2,550+ Investors", sub: "Active fractional investors", icon: Users, color: "text-amber-400" },
            { label: "12.6% Avg APY", sub: "Avg return across all SPVs", icon: Coins, color: "text-emerald-400" },
            { label: "6 Countries", sub: "Pan-African coverage", icon: Globe, color: "text-sky-400" },
          ].map(({ label, sub, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-card-border rounded-xl p-5 text-center"
            >
              <div className={`font-display text-xl font-bold ${color} mb-0.5`}>{label}</div>
              <div className="text-xs text-white/35">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Process</p>
            <h2 className="font-display text-2xl font-bold text-white">How Tokenization Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-card-border rounded-xl p-5 relative"
              >
                <div className="font-mono text-[10px] font-bold text-primary/50 mb-3">{step}</div>
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="font-display font-semibold text-white mb-1.5">{title}</div>
                <div className="text-sm text-white/40 leading-relaxed">{desc}</div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <ChevronRight className="h-4 w-4 text-white/15" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Revenue calculator */}
        <div id="calculator" className="mb-16 scroll-mt-24">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Interactive Tool</p>
            <h2 className="font-display text-2xl font-bold text-white">Model Your Returns</h2>
            <p className="text-white/40 text-sm mt-1 max-w-xl mx-auto">
              Adjust the sliders to see exactly what you raise, what OsanVault earns, and your net return over time.
            </p>
          </div>
          <RevenueCalculator />
        </div>

        {/* Tier comparison */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="font-display text-2xl font-bold text-white">Tokenization Tiers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-card rounded-2xl p-6 relative border ${
                  tier.highlight ? "border-primary/40 shadow-[0_0_32px_rgba(14,124,102,0.12)]" : "border-card-border"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      ★ Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="font-display text-xl font-bold text-white">{tier.name}</div>
                    <div className={`text-[11px] font-semibold mt-0.5 px-2 py-0.5 rounded-full border inline-block ${tier.badgeColor}`}>
                      {tier.badge}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  {[
                    { label: "Listing fee", value: `${tier.listingFeePercent}% of raise` },
                    { label: "Platform fee", value: `${tier.platformFeePercent}% of raise` },
                    { label: "Yield fee", value: `${tier.yieldFeePercent}% of APY` },
                    { label: "Min raise", value: formatNgn(tier.minRaiseNgn) },
                    { label: "Max raise", value: tier.maxRaiseNgn === Infinity ? "Unlimited" : formatNgn(tier.maxRaiseNgn) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm border-b border-white/[0.04] pb-1.5 last:border-0">
                      <span className="text-white/40">{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-white/55">{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#apply">
                  <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "bg-white/[0.05] hover:bg-white/[0.09] text-white/70 hover:text-white border border-white/[0.08]"
                  }`}>
                    Get Started
                  </button>
                </a>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-white/25 mt-4">
            Flat fees for deployment (₦500K), compliance (₦250K), and land verification (₦150K) apply to all tiers.
          </p>
        </div>

        {/* Revenue multipliers */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Maximize Revenue</p>
            <h2 className="font-display text-2xl font-bold text-white">Beyond Rental Yield</h2>
            <p className="text-white/40 text-sm mt-1 max-w-xl mx-auto">
              OsanVault properties unlock additional revenue streams not available on traditional platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REVENUE_MULTIPLIERS.map(({ label, desc, color, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-card-border rounded-xl p-5 flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <div className={`font-display font-semibold ${color} mb-1`}>{label}</div>
                  <div className="text-sm text-white/45 leading-relaxed">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Application form */}
        <div id="apply" className="scroll-mt-24">
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Issuer Application</p>
              <h2 className="font-display text-2xl font-bold text-white">List Your Property</h2>
              <p className="text-sm text-white/40 mt-1">Submit your property for review. Our team responds within 3 business days.</p>
            </div>
            {submitted ? (
              <div className="px-6 py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Application Submitted</h3>
                <p className="text-white/40 text-sm max-w-sm mx-auto">
                  Thank you. Our tokenization team will review your submission and contact you within 3 business days.
                </p>
              </div>
            ) : (
              <form
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              >
                {[
                  { label: "Company / Entity Name", placeholder: "e.g. Adeyemi Properties Ltd.", type: "text" },
                  { label: "Contact Email", placeholder: "ceo@company.com", type: "email" },
                  { label: "Property Name", placeholder: "e.g. Victoria Island Tower Block A", type: "text" },
                  { label: "Location (State, Country)", placeholder: "e.g. Lagos, Nigeria", type: "text" },
                  { label: "Estimated Property Value (₦)", placeholder: "e.g. 2,000,000,000", type: "text" },
                  { label: "Target Raise (₦)", placeholder: "e.g. 1,500,000,000", type: "text" },
                ].map(({ label, placeholder, type }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold text-white/45 uppercase tracking-wider block mb-1.5">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      required
                      className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-white/45 uppercase tracking-wider block mb-1.5">Property Description</label>
                  <textarea
                    placeholder="Briefly describe the property, its income profile, legal title status, and why it suits tokenization…"
                    rows={4}
                    required
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-xs text-white/25">
                    By submitting you agree to our issuer terms. Documents required post-acceptance: C of O / Land Title, CAC certificate, valuation report.
                  </p>
                  <button
                    type="submit"
                    className="shrink-0 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Submit Application <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "SEC ARIP Sandbox", icon: Shield, color: "text-primary" },
            { label: "Polygon Network", icon: Zap, color: "text-violet-400" },
            { label: "Dual Land Verification", icon: BadgeCheck, color: "text-emerald-400" },
            { label: "ERC-1155 Standard", icon: Lock, color: "text-amber-400" },
          ].map(({ label, icon: Icon, color }) => (
            <div key={label} className="flex items-center justify-center gap-2 border border-white/[0.06] rounded-xl py-3 px-4 bg-white/[0.02]">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-white/45 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
