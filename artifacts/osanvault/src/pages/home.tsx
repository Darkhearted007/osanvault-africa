import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, Building2, Coins, Shield, Globe, Leaf, TrendingUp,
  Users, ChevronRight, Zap, BarChart3, Lock,
} from "lucide-react";
import {
  PLATFORM_STATS,
  formatNgn, fundingPct,
} from "@/lib/mock-data";
import { useListProperties, useGetPlatformStats } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const PLATFORM_VERTICALS = [
  { icon: Building2, title: "Real Estate", desc: "Fractional ownership of premium African properties — commercial, residential, land banking and industrial.", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { icon: Coins, title: "OSANV Staking", desc: "Lock OSANV for 30–365 days to earn 8–22% APR and gain governance weight in protocol decisions.", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { icon: BarChart3, title: "Governance", desc: "100K OSANV to propose. 5M quorum. On-chain voting with 7-day windows and 2-day execution timelock.", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: Shield, title: "Treasury", desc: "Protocol fee splits: 30% treasury reserve, 20% token burn, 40% staker rewards, 10% operations.", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { icon: Leaf, title: "Carbon Credits", desc: "Verified tCO₂e from 5 African climate projects. ERC-1155 credits distributed to property holders.", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { icon: Lock, title: "Dual Verification", desc: "Every property verified by government title hash + indigenous authority approval via LandRegistry.sol.", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse SPVs", desc: "Explore 6 tokenized African real estate Special Purpose Vehicles across Nigeria, Ghana, and Kenya." },
  { step: "02", title: "Connect & Buy", desc: "Connect your wallet, pick a property, and buy fractional tokens from ₦1,000. Tokens are ERC-1155 on Polygon." },
  { step: "03", title: "Earn Yield", desc: "Hold tokens to receive rental yield distributions at your property's APY rate, plus carbon credit allocations." },
  { step: "04", title: "Govern & Stake", desc: "Stake OSANV to earn rewards and vote on protocol proposals that shape the platform's future." },
];

export default function HomePage() {
  const { data: propertiesData } = useListProperties();
  const { data: statsData } = useGetPlatformStats();
  const allProperties = propertiesData ?? [];
  const stats = statsData ?? PLATFORM_STATS;
  const liveProperties = allProperties.filter((p) => p.status === "live" || p.status === "funding").slice(0, 4);

  return (
    <Layout>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-grid-overlay opacity-60" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "rgba(212,175,55,0.06)", filter: "blur(100px)" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wide">Live on Polygon Amoy Testnet</span>
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Own a Piece<br />
              <span className="text-gold-gradient">of Africa.</span>
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="text-lg sm:text-xl text-white/55 leading-relaxed max-w-xl mb-10"
            >
              Institutional-grade tokenized real estate infrastructure for African assets. Fractional ownership, rental yield, staking, and governance — all on-chain via Polygon.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link href="/properties">
                <button className="group inline-flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_24px_rgba(14,124,102,0.35)] hover:shadow-[0_0_32px_rgba(14,124,102,0.5)]">
                  Browse Properties
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/75 hover:text-white font-medium px-7 py-3.5 rounded-xl text-sm transition-all backdrop-blur-sm">
                  Open Dashboard
                </button>
              </Link>
            </motion.div>

            <motion.div
              custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-wrap gap-5 text-xs text-white/35"
            >
              {[
                { icon: Shield, label: "SEC ARIP Sandbox" },
                { icon: Zap, label: "Polygon Network" },
                { icon: Globe, label: "Dual Land Verification" },
                { icon: Lock, label: "ERC-1155 Standard" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/[0.06]" style={{ background: "rgba(15,23,42,0.6)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { label: "Properties Live", value: String(stats.propertiesLive), sub: "Across 3 countries" },
              { label: "Total Value Locked", value: formatNgn(stats.tvlNgn), sub: "NGN primary" },
              { label: "Total Investors", value: stats.totalInvestors.toLocaleString(), sub: "Wallet holders" },
              { label: "OSANV Staked", value: `${(stats.osanvStaked / 1_000_000).toFixed(1)}M`, sub: "Across all tiers" },
            ].map(({ label, value, sub }, i) => (
              <motion.div
                key={label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex flex-col items-center justify-center py-7 px-4 border-r border-white/[0.05] last:border-r-0 text-center"
              >
                <div className="font-display text-2xl font-bold text-white mb-0.5">{value}</div>
                <div className="text-xs font-medium text-white/50">{label}</div>
                <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PROPERTIES ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Live Properties</motion.p>
            <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white">Verified Real Estate SPVs</motion.h2>
          </div>
          <Link href="/properties">
            <motion.button custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors">
              View all {allProperties.length} <ChevronRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveProperties.map((p, i) => {
            const pct = fundingPct(p);
            return (
              <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Link href={`/properties/${p.id}`}>
                  <div className="group bg-card border border-card-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-200 cursor-pointer">
                    <div className="h-24 flex items-end p-3" style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl">{p.flag}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          p.status === "live" ? "bg-emerald-500/25 text-emerald-400" : "bg-amber-500/25 text-amber-400"
                        }`}>{p.status}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm leading-tight mb-0.5 group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-[11px] text-white/35 mb-3">{p.location}</p>
                      <div className="mb-3">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/30 mt-1">
                          <span>{formatNgn(p.raised)}</span>
                          <span>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">From ₦{p.tokenPrice.toLocaleString()}</span>
                        <span className="font-semibold text-emerald-400">{p.yieldApy}% APY</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/properties">
            <button className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5 mx-auto">
              View all properties <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── PLATFORM VERTICALS ── */}
      <section className="border-t border-white/[0.05] py-20" style={{ background: "rgba(15,23,42,0.4)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Everything in One Platform</motion.p>
            <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Real estate is just the foundation.
            </motion.h2>
            <motion.p custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-white/45 max-w-xl mx-auto text-sm">
              ÒsánVault layers carbon credits, DeFi staking, DAO governance, and treasury management on top of tokenized property ownership.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_VERTICALS.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`bg-card border ${bg} rounded-xl p-5 transition-all`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">How It Works</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white">From browser to blockchain in minutes.</motion.h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <motion.div key={step} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
              <div className="text-5xl font-display font-bold text-white/[0.04] mb-3 select-none">{step}</div>
              <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              {i < 3 && (
                <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 text-white/10">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE ── */}
      <section className="border-t border-white/[0.05] py-16" style={{ background: "rgba(15,23,42,0.4)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Compliance & Security</motion.p>
              <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-4">
                Institutional trust,<br />built into the protocol.
              </motion.h2>
              <motion.p custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-white/45 text-sm leading-relaxed max-w-md">
                Every property is verified through government title hash and indigenous authority approval before tokens are minted. Operating under SEC Nigeria's Alternative Investment Regulatory Initiative (ARIP) Sandbox.
              </motion.p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "SEC ARIP Sandbox", desc: "Operating under regulatory sandbox approval" },
                { icon: Globe, label: "Dual Verification", desc: "Govt. title + indigenous authority on-chain" },
                { icon: Zap, label: "Polygon Network", desc: "~$0.001 per transaction, EVM-compatible" },
                { icon: Users, label: "Gold Standard Carbon", desc: "Verified tCO₂e from African climate projects" },
              ].map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="bg-card border border-card-border rounded-xl p-4"
                >
                  <Icon className="h-5 w-5 text-primary mb-2.5" />
                  <div className="font-semibold text-white text-sm mb-1">{label}</div>
                  <div className="text-xs text-white/35 leading-relaxed">{desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-10 text-center"
          style={{ background: "linear-gradient(135deg, rgba(14,124,102,0.15) 0%, rgba(15,23,42,0.8) 50%, rgba(212,175,55,0.1) 100%)", border: "1px solid rgba(14,124,102,0.3)" }}
        >
          <div className="absolute inset-0 bg-grid-overlay opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to own a piece of Africa?
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-sm">
              Join {PLATFORM_STATS.totalInvestors.toLocaleString()} investors already building wealth through African real estate tokenization.
            </p>
            <Link href="/properties">
              <button className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all shadow-[0_0_32px_rgba(14,124,102,0.4)] hover:shadow-[0_0_48px_rgba(14,124,102,0.55)]">
                Explore Properties <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
