import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, Building2, Coins, Shield, Globe, Leaf, TrendingUp,
  Users, ChevronRight, Zap, BarChart3, Lock, Star,
} from "lucide-react";
import {
  PLATFORM_STATS,
  formatNgn, fundingPct,
} from "@/lib/mock-data";
import { useListProperties, useGetPlatformStats } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import CinematicBackground, { type CinematicSlide } from "@/components/ui/CinematicBackground";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as any } }),
};

/* ── Cinematic image pools ─────────────────────────────────────────────────── */

const HERO_SLIDES: CinematicSlide[] = [
  // Aerial city at night — institutional dark skyline (first slide: slightly higher quality for LCP)
  { url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=65", kb: 1, position: "center 40%" },
  // Blue-hour city skyline — twilight tower panoramic
  { url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=50", kb: 2, position: "center 30%" },
  // Luxury residential tower — premium high-rise exterior
  { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=50", kb: 3, position: "center 50%" },
  // Modern luxury villa — high-value residential
  { url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=50", kb: 4, position: "center 45%" },
  // Smart glass tower facade — institutional commercial
  { url: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1920&q=50", kb: 5, position: "center 50%" },
];

/* Property card photo map — keyed by property ID */
const PROPERTY_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=70",
  2: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=70",
  3: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=70",
  4: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=70",
  5: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=70",
  6: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=70",
};

/* Section background images */
const SECTION_BG = {
  verticals: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=40",
  trust:     "https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1920&q=40",
  cta:       "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=45",
};

/* ── Platform content ──────────────────────────────────────────────────────── */

const PLATFORM_VERTICALS = [
  { icon: Building2, title: "Real Estate",       desc: "Fractional ownership of premium African properties — commercial, residential, land banking and industrial.",              color: "text-primary",    bg: "bg-primary/10 border-primary/20" },
  { icon: Coins,     title: "OSANV Staking",     desc: "Lock OSANV for 30–365 days to earn 8–22% APR and gain governance weight in protocol decisions.",                        color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
  { icon: BarChart3, title: "Governance",         desc: "100K OSANV to propose. 5M quorum. On-chain voting with 7-day windows and 2-day execution timelock.",                    color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: Shield,    title: "Treasury",           desc: "Protocol fee splits: 30% treasury reserve, 20% token burn, 40% staker rewards, 10% operations.",                       color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { icon: Leaf,      title: "Carbon Credits",     desc: "Verified tCO₂e from 5 African climate projects. ERC-1155 credits distributed to property holders.",                    color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20" },
  { icon: Lock,      title: "Dual Verification",  desc: "Every property verified by government title hash + indigenous authority approval via LandRegistry.sol.",               color: "text-rose-400",   bg: "bg-rose-400/10 border-rose-400/20" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse SPVs",     desc: "Explore 6 tokenized African real estate Special Purpose Vehicles across Nigeria, Ghana, and Kenya." },
  { step: "02", title: "Connect & Buy",  desc: "Connect your wallet, pick a property, and buy fractional tokens from ₦1,000. Tokens are ERC-1155 on Polygon." },
  { step: "03", title: "Earn Yield",     desc: "Hold tokens to receive rental yield distributions at your property's APY rate, plus carbon credit allocations." },
  { step: "04", title: "Govern & Stake", desc: "Stake OSANV to earn rewards and vote on protocol proposals that shape the platform's future." },
];

/* ── Reusable section background layer ──────────────────────────────────────── */
function SectionPhotoBg({ src, overlay = "rgba(7,14,26,0.91)" }: { src: string; overlay?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div className="absolute inset-0" style={{ background: overlay }} />
      <div className="absolute inset-0 bg-grid-overlay opacity-20" />
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { data: propertiesData } = useListProperties();
  const { data: statsData } = useGetPlatformStats();
  const allProperties = propertiesData ?? [];
  const stats = statsData ?? PLATFORM_STATS;
  const liveProperties = allProperties.filter((p) => p.status === "live" || p.status === "funding").slice(0, 4);

  return (
    <Layout>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Cinematic background slideshow */}
        <CinematicBackground
          images={HERO_SLIDES}
          interval={10000}
          overlayIntensity="medium"
          showGrid
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8 backdrop-blur-sm"
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
              className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-xl mb-10"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              Institutional-grade tokenized real estate infrastructure for African assets. Fractional ownership, rental yield, staking, and governance — all on-chain via Polygon.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link href="/properties">
                <button className="group inline-flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_24px_rgba(14,124,102,0.45)] hover:shadow-[0_0_40px_rgba(14,124,102,0.6)]">
                  Browse Properties
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="inline-flex items-center gap-2 border border-white/20 hover:border-white/35 text-white/80 hover:text-white font-medium px-7 py-3.5 rounded-xl text-sm transition-all backdrop-blur-sm bg-white/[0.04] hover:bg-white/[0.07]">
                  Open Dashboard
                </button>
              </Link>
            </motion.div>

            <motion.div
              custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-wrap gap-5 text-xs text-white/40"
            >
              {[
                { icon: Shield, label: "SEC ARIP Sandbox" },
                { icon: Zap,    label: "Polygon Network" },
                { icon: Globe,  label: "Dual Land Verification" },
                { icon: Lock,   label: "ERC-1155 Standard" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section
        className="border-y border-white/[0.07] relative"
        style={{ background: "rgba(7,14,26,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        {/* Subtle top-edge shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(14,124,102,0.4) 30%, rgba(212,175,55,0.3) 70%, transparent 100%)" }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { label: "Properties Live",  value: String(stats.propertiesLive),                        sub: "Across 3 countries" },
              { label: "Total Value Locked", value: formatNgn(stats.tvlNgn),                           sub: "NGN primary" },
              { label: "Total Investors",  value: stats.totalInvestors.toLocaleString(),                sub: "Wallet holders" },
              { label: "OSANV Staked",     value: `${(stats.osanvStaked / 1_000_000).toFixed(1)}M`,    sub: "Across all tiers" },
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
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 50%, transparent 100%)" }} />
      </section>

      {/* ── LIVE PROPERTIES ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Live Properties</motion.p>
            <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="font-display text-3xl font-bold text-white">Verified Real Estate SPVs</motion.h2>
          </div>
          <Link href="/properties">
            <motion.button custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors">
              View all {allProperties.length} <ChevronRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveProperties.map((p, i) => {
            const pct = fundingPct(p);
            const cardImg = PROPERTY_IMAGES[p.id as keyof typeof PROPERTY_IMAGES];
            return (
              <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Link href={`/properties/${p.id}`}>
                  <div className="group bg-card border border-card-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-[0_8px_32px_rgba(14,124,102,0.18)] hover:-translate-y-0.5">

                    {/* Card photo header */}
                    <div className="h-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}>
                      {cardImg && (
                        <img
                          src={cardImg}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {/* gradient overlay for readability */}
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to bottom, rgba(7,14,26,0.15) 0%, rgba(7,14,26,0.55) 100%)" }}
                      />
                      {/* Subtle green tint at top-left */}
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${p.gradientFrom}55 0%, transparent 60%)` }} />
                      <div className="absolute inset-0 flex items-end p-3 z-10">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl drop-shadow-md">{p.flag}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize backdrop-blur-sm ${
                            p.status === "live" ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/30 text-amber-300 border border-amber-500/30"
                          }`}>{p.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm leading-tight mb-0.5 group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-[11px] text-white/35 mb-3">{p.location}</p>
                      <div className="mb-3">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          />
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

      {/* ── PLATFORM VERTICALS ───────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] py-20 relative overflow-hidden">
        <SectionPhotoBg src={SECTION_BG.verticals} overlay="rgba(7,14,26,0.90)" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Everything in One Platform</motion.p>
            <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Real estate is just the foundation.
            </motion.h2>
            <motion.p custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-white/45 max-w-xl mx-auto text-sm">
              ÒsánVault layers carbon credits, DeFi staking, DAO governance, and treasury management on top of tokenized property ownership.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_VERTICALS.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`bg-card/70 backdrop-blur-sm border ${bg} rounded-xl p-5 transition-all hover:bg-card/90`}
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

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">How It Works</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="font-display text-3xl font-bold text-white">From browser to blockchain in minutes.</motion.h2>
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

      {/* ── TRUST / COMPLIANCE ────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] py-16 relative overflow-hidden">
        <SectionPhotoBg src={SECTION_BG.trust} overlay="rgba(7,14,26,0.88)" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Compliance & Security</motion.p>
              <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="font-display text-3xl font-bold text-white mb-4">
                Institutional trust,<br />built into the protocol.
              </motion.h2>
              <motion.p custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-white/45 text-sm leading-relaxed max-w-md">
                Every property is verified through government title hash and indigenous authority approval before tokens are minted. Operating under SEC Nigeria's Alternative Investment Regulatory Initiative (ARIP) Sandbox.
              </motion.p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "SEC ARIP Sandbox",       desc: "Operating under regulatory sandbox approval" },
                { icon: Globe,  label: "Dual Verification",      desc: "Govt. title + indigenous authority on-chain" },
                { icon: Zap,    label: "Polygon Network",         desc: "~$0.001 per transaction, EVM-compatible" },
                { icon: Users,  label: "Gold Standard Carbon",   desc: "Verified tCO₂e from African climate projects" },
              ].map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="bg-card/70 backdrop-blur-sm border border-card-border rounded-xl p-4 hover:bg-card/90 transition-all"
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

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-10 sm:p-14 text-center"
        >
          {/* Panoramic architectural background */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <img
              src={SECTION_BG.cta}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
            <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(14,124,102,0.45) 0%, rgba(7,14,26,0.75) 50%, rgba(212,175,55,0.25) 100%)" }} />
            <div className="absolute inset-0 bg-grid-overlay opacity-25 rounded-2xl" />
          </div>
          <div className="absolute inset-0 rounded-2xl" style={{ border: "1px solid rgba(14,124,102,0.35)", boxShadow: "inset 0 0 60px rgba(14,124,102,0.08), 0 0 80px rgba(14,124,102,0.10)" }} />

          <div className="relative z-10">
            {/* Early access badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-6">
              <Star className="h-3 w-3" />
              Pre-Launch — Early Access Open
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to own a piece of Africa?
            </h2>
            <p className="text-white/55 mb-8 max-w-lg mx-auto text-sm" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              Join early investors securing priority allocation in Africa's first institutional
              real estate tokenization platform. No wallet needed to register.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/early-access">
                <button className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-[0_0_32px_rgba(212,160,23,0.4)] hover:shadow-[0_0_56px_rgba(212,160,23,0.6)]">
                  <Star className="h-4 w-4" />
                  Request Early Access
                </button>
              </Link>
              <Link href="/properties">
                <button className="inline-flex items-center gap-2.5 border border-white/20 bg-white/8 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all backdrop-blur-sm">
                  Explore Properties <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            <p className="text-white/30 text-xs mt-6">
              SEC ARIP Sandbox · Polygon Network · Dual Land Verification
            </p>
          </div>
        </motion.div>
      </section>

    </Layout>
  );
}
