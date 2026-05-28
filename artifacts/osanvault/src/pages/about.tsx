import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Building2, Coins, Shield, Leaf, Globe, Users, ArrowRight,
  CheckCircle2, Lock, Zap, BarChart3, FileText,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const ROADMAP = [
  {
    phase: "Phase 1", title: "Foundation", status: "completed",
    items: ["Smart contract development & audits", "6 real estate SPVs onboarded", "Frontend + wallet integration", "SEC ARIP Sandbox registration", "Polygon Amoy testnet deployment"],
  },
  {
    phase: "Phase 2", title: "Token Launch", status: "active",
    items: ["OSANV ERC-20 token deployment on Polygon", "StakingVault.sol mainnet launch", "Governance portal activation", "FeeRouter live with auto-splits", "LandRegistry.sol integration"],
  },
  {
    phase: "Phase 3", title: "Scale", status: "upcoming",
    items: ["10+ new African property SPVs", "Secondary market for property tokens", "Institutional LP onboarding", "Cross-border yield distribution", "KYC/AML integration"],
  },
  {
    phase: "Phase 4", title: "Expansion", status: "upcoming",
    items: ["Pan-African REIT tokenization", "Arbitrum multi-chain deployment", "Carbon credit exchange", "Lending protocol against property NFTs", "Sovereign infrastructure bonds"],
  },
];

const TEAM_VALUES = [
  { icon: Globe, title: "Pan-African Focus", desc: "Every product decision centres African investors, African assets, and African infrastructure — not Western-centric DeFi." },
  { icon: Shield, title: "Compliance First", desc: "Operating under SEC Nigeria ARIP Sandbox. All properties dual-verified before tokenization via government + indigenous authority." },
  { icon: Users, title: "Community Governed", desc: "Protocol parameters, property whitelisting, and treasury allocations are DAO-controlled through transparent on-chain governance." },
  { icon: Lock, title: "Security by Default", desc: "Multi-sig treasury, 2-day timelocks, ERC-1155 standards, and smart contract audits before any mainnet deployment." },
];

const SECURITY_MEASURES = [
  { label: "Smart Contract Audits", desc: "All 8 contracts independently audited before mainnet deployment." },
  { label: "2-Day Timelock", desc: "TreasuryVault.sol enforces minimum 2-day delay on all treasury operations." },
  { label: "Multi-Sig Admin", desc: "3-of-5 multi-signature required for admin functions." },
  { label: "SEC ARIP Sandbox", desc: "Operating under SEC Nigeria Alternative Investment Regulatory Initiative approval." },
  { label: "Dual Land Verification", desc: "Government title hash + indigenous authority approval stored on-chain via LandRegistry.sol." },
  { label: "Emergency Pause", desc: "Protocol-wide pause capability controlled by multi-sig in case of security incidents." },
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-20 text-center relative">
          <div className="absolute inset-0 bg-grid-overlay opacity-30" />
          <div className="relative">
            <motion.p custom={0} variants={fadeUp} initial="hidden" animate="visible" className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">About ÒsánVault Africa</motion.p>
            <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="font-display text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Building Africa's Real Estate<br />
              <span className="text-gold-gradient">Infrastructure Layer.</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-white/45 max-w-2xl mx-auto text-lg leading-relaxed">
              ÒsánVault Africa is an institutional-grade tokenized real-world asset platform focused on bringing premium African real estate, land ownership, and infrastructure onto the blockchain — making fractional ownership accessible from ₦1,000.
            </motion.p>
          </div>
        </section>

        {/* Vision */}
        <section className="py-16 border-t border-white/[0.05]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Our Mission</motion.p>
              <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-5">
                Democratizing African property ownership for 1.4 billion people.
              </motion.h2>
              <motion.p custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-white/45 text-sm leading-relaxed mb-6">
                Africa holds over $33 trillion in real estate assets, yet fractional investment access remains limited to the ultra-wealthy. ÒsánVault changes this by tokenizing verified African properties as ERC-1155 NFTs on Polygon — enabling anyone with a wallet to own a slice of premium real estate in Lagos, Accra, or Nairobi.
              </motion.p>
              <motion.p custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-white/45 text-sm leading-relaxed">
                This is not a meme coin project. This is institutional infrastructure — comparable in ambition to BlackRock digital assets, Ondo Finance, RealT, and Centrifuge, but purpose-built for the African continent.
              </motion.p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Building2, label: "$33T", sub: "African real estate market" },
                { icon: Users, label: "1.4B", sub: "Potential beneficiaries" },
                { icon: Coins, label: "₦1,000", sub: "Minimum investment" },
                { icon: Leaf, label: "57.4K tCO₂e", sub: "Annual carbon offset capacity" },
              ].map(({ icon: Icon, label, sub }, i) => (
                <motion.div
                  key={label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-card border border-card-border rounded-xl p-5 text-center"
                >
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2.5" />
                  <div className="font-display text-2xl font-bold text-white mb-0.5">{label}</div>
                  <div className="text-xs text-white/35">{sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 border-t border-white/[0.05]">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 text-center">Core Principles</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-10 text-center">Built different.</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TEAM_VALUES.map(({ icon: Icon, title, desc }, i) => (
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
        </section>

        {/* Roadmap */}
        <section id="roadmap" className="py-16 border-t border-white/[0.05]">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Roadmap</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-10">Building in public.</motion.h2>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.07] hidden sm:block" />
            <div className="space-y-8">
              {ROADMAP.map(({ phase, title, status, items }, i) => (
                <motion.div
                  key={phase}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="sm:pl-16 relative"
                >
                  {/* dot */}
                  <div className={`absolute left-4 top-5 h-4 w-4 rounded-full border-2 hidden sm:block ${
                    status === "completed" ? "bg-primary border-primary" :
                    status === "active" ? "bg-amber-400 border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.5)]" :
                    "bg-card border-white/20"
                  }`} />
                  <div className={`bg-card border rounded-xl p-6 ${
                    status === "active" ? "border-amber-400/30 shadow-[0_0_20px_rgba(212,175,55,0.08)]" : "border-card-border"
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">{phase}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                        status === "active" ? "bg-amber-500/15 text-amber-400" :
                        "bg-white/[0.06] text-white/35"
                      }`}>
                        {status === "completed" ? "Completed" : status === "active" ? "In Progress" : "Upcoming"}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-4">{title}</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-white/45">
                          <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                            status === "completed" ? "text-primary" :
                            status === "active" ? "text-amber-400" :
                            "text-white/20"
                          }`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="py-16 border-t border-white/[0.05]">
          <motion.p custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Security & Compliance</motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-display text-3xl font-bold text-white mb-10">Institutional trust, built in.</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY_MEASURES.map(({ label, desc }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card border border-card-border rounded-xl p-5"
              >
                <Shield className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold text-white text-sm mb-1.5">{label}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-white/[0.05]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl p-10 text-center"
            style={{ background: "linear-gradient(135deg, rgba(14,124,102,0.12) 0%, rgba(15,23,42,0.8) 50%, rgba(212,175,55,0.08) 100%)", border: "1px solid rgba(14,124,102,0.25)" }}
          >
            <div className="absolute inset-0 bg-grid-overlay opacity-20" />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Ready to explore the protocol?</h2>
              <p className="text-white/40 text-sm mb-7 max-w-md mx-auto">Browse live properties, stake OSANV, and participate in governance today.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/properties">
                  <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_24px_rgba(14,124,102,0.35)]">
                    Browse Properties <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/tokenomics">
                  <button className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/60 hover:text-white px-6 py-3 rounded-xl text-sm transition-all">
                    View Tokenomics
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
}
