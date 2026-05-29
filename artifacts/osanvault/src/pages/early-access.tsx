import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Users, Building2, TrendingUp,
  Shield, Leaf, Star, Copy, Check, Mail, Phone, User,
  Globe, MessageSquare, Briefcase, Zap,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API  = `${BASE}/api`;

const INVESTOR_TYPES = [
  { value: "individual",   label: "Individual Investor",     desc: "Personal investment from ₦1,000" },
  { value: "hni",          label: "High Net Worth (HNI)",    desc: "₦5M+ investment capacity" },
  { value: "institutional",label: "Institutional",           desc: "Fund, pension, family office" },
  { value: "fund",         label: "Investment Fund",         desc: "Actively managed portfolio" },
  { value: "developer",    label: "Property Developer",      desc: "List properties on the platform" },
];

const JURISDICTIONS = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt",
  "United Kingdom", "United States", "UAE", "Singapore", "Other",
];

const SOURCES = [
  { value: "website",      label: "Found you online" },
  { value: "referral",     label: "Friend / colleague referral" },
  { value: "twitter",      label: "X / Twitter" },
  { value: "linkedin",     label: "LinkedIn" },
  { value: "accelerator",  label: "Accelerate Africa / Lagos cohort" },
  { value: "event",        label: "Event or conference" },
  { value: "other",        label: "Other" },
];

const BENEFITS = [
  { icon: Star,       title: "Priority Allocation",   desc: "First access to new property SPVs before public launch" },
  { icon: TrendingUp, title: "Early Whitelist",        desc: "Pre-approved KYC track — skip the queue when we go live" },
  { icon: Shield,     title: "Exclusive Briefings",    desc: "Private investor updates, financial models, and due diligence packs" },
  { icon: Leaf,       title: "Carbon Credit Airdrop",  desc: "Early investors receive carbon credit allocations on genesis launch" },
];

const INVESTMENT_RANGES = [
  { value: 1_000,          label: "₦1,000 – ₦100K   (Starter)" },
  { value: 500_000,        label: "₦100K – ₦1M   (Regular)" },
  { value: 5_000_000,      label: "₦1M – ₦10M   (HNI)" },
  { value: 50_000_000,     label: "₦10M – ₦100M   (Institutional)" },
  { value: 500_000_000,    label: "₦100M+   (Fund / Family Office)" },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any } }),
};

function CopiedBadge({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-lg font-bold text-amber-400 hover:text-amber-300 transition-colors">
      {text}
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 opacity-60" />}
    </button>
  );
}

export default function EarlyAccessPage() {
  const [count, setCount] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName:     "",
    email:        "",
    phone:        "+234 ",
    investorType: "individual",
    interestNgn:  1_000,
    jurisdiction: "Nigeria",
    source:       "website",
    message:      "",
    status:       "new",
  });

  useEffect(() => {
    fetch(`${API}/leads/count`)
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(null));
  }, []);

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!form.email.includes("@")) { toast.error("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast.info("You're already on our early access list — we'll be in touch soon.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setRefCode(data.referenceCode ?? "OSV-XXXXXXXX");
      setSubmitted(true);
      setCount((c) => (c !== null ? c + 1 : null));
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,14,26,0.88) 0%, rgba(7,14,26,0.70) 50%, rgba(7,14,26,0.97) 100%)" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-6">
            <Zap className="h-3 w-3" />
            Early Investor Access — Pre-Launch
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Be First to Own<br />
            <span style={{ color: "#d4a017" }}>Africa's Real Estate,</span><br />
            On-Chain
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            OsanVault tokenizes premium African real estate into fractional shares from ₦1,000 — giving
            individuals and institutions direct, liquid exposure to one of the world's fastest-growing property markets.
          </motion.p>

          {count !== null && count > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/10 px-5 py-2 text-sm text-white/70 mb-4">
              <Users className="h-4 w-4 text-emerald-400" />
              <span><strong className="text-white">{count.toLocaleString()}</strong> investors already registered</span>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────────────── */}
      <section className="bg-card/30 border-y border-card-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="flex flex-col gap-3 rounded-xl border border-card-border bg-card/50 p-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="font-semibold text-white text-sm">{title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form / Success ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">You're on the list</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Our investor relations team will contact you within 48 hours with your private briefing pack.
              </p>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5 mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your reference code</div>
                <CopiedBadge text={refCode} />
                <div className="text-xs text-muted-foreground mt-2">Keep this safe — quote it in all correspondence with us</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Mail,       label: "Check email",       desc: "Confirmation sent" },
                  { icon: Shield,     label: "KYC prep",          desc: "Gov ID + address proof" },
                  { icon: Building2,  label: "Explore properties", desc: "Preview live SPVs" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="rounded-lg border border-card-border bg-card/50 p-4">
                    <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="text-xs font-semibold text-white">{label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>

              {count !== null && (
                <div className="text-sm text-muted-foreground">
                  You're investor <strong className="text-white">#{count}</strong> on the OsanVault early access list.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Register Your Interest</h2>
                <p className="text-muted-foreground text-sm">Takes 60 seconds — no wallet required at this stage</p>
              </div>

              <form onSubmit={handleSubmit} className="rounded-2xl border border-card-border bg-card/60 backdrop-blur-sm p-8 space-y-6">

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <User className="h-3 w-3" /> Full Name *
                    </label>
                    <input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                      placeholder="Oluwaseun Adeyemi"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <Mail className="h-3 w-3" /> Email Address *
                    </label>
                    <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
                  </div>
                </div>

                {/* Phone + Jurisdiction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <Phone className="h-3 w-3" /> Phone Number
                    </label>
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <Globe className="h-3 w-3" /> Jurisdiction
                    </label>
                    <select value={form.jurisdiction} onChange={(e) => set("jurisdiction", e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
                      {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                {/* Investor Type */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    <Briefcase className="h-3 w-3" /> I am a…
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {INVESTOR_TYPES.map(({ value, label, desc }) => (
                      <button key={value} type="button" onClick={() => set("investorType", value)}
                        className={`rounded-xl border p-3.5 text-left transition-all ${
                          form.investorType === value
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                        }`}>
                        <div className="text-sm font-semibold text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Range */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    <TrendingUp className="h-3 w-3" /> Expected Investment Range
                  </label>
                  <select value={form.interestNgn} onChange={(e) => set("interestNgn", parseInt(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
                    {INVESTMENT_RANGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    How did you hear about OsanVault?
                  </label>
                  <select value={form.source} onChange={(e) => set("source", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
                    {SOURCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    <MessageSquare className="h-3 w-3" /> Message (optional)
                  </label>
                  <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3}
                    placeholder="Tell us about your investment goals, preferred property types, or any questions..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none" />
                </div>

                {/* Regulatory note */}
                <div className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 p-4 text-xs text-muted-foreground leading-relaxed">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    OsanVault Africa operates under the <strong className="text-foreground">SEC Nigeria ARIP Sandbox</strong>. 
                    Your information is processed securely and used solely for investor onboarding. 
                    No payment is required at this stage. Full KYC is completed before any token issuance.
                  </span>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-4 text-sm transition-all shadow-[0_0_32px_rgba(14,124,102,0.35)] hover:shadow-[0_0_48px_rgba(14,124,102,0.5)]">
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</span>
                  ) : (
                    <><span>Request Early Access</span><ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Social proof strip ─────────────────────────────────────────────── */}
      <section className="border-t border-card-border bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Building2,  label: "Properties Live",       value: "6 SPVs" },
              { icon: Globe,      label: "Markets",                value: "NG · GH · KE" },
              { icon: Shield,     label: "Regulatory",             value: "SEC ARIP" },
              { icon: TrendingUp, label: "Max APY",                value: "22% APR" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
