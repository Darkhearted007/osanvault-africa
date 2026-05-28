import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import {
  Building2, TrendingUp, MapPin, Users, Leaf,
  Shield, CheckCircle2, Clock, ExternalLink, Zap, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { formatNgn } from "@/lib/mock-data";
import Layout from "@/components/layout/Layout";

const STATE_PARTNERS = [
  {
    name: "Ekiti State",
    flag: "🇳🇬",
    status: "active",
    since: "Jan 2024",
    ministry: "Ministry of Lands & Housing",
    parcels: 3,
    investmentNgn: 400_000_000,
    carbonTonnes: 2400,
    infrastructureProjects: 2,
    spvs: ["Ekiti LandBank Phase 1", "Ekiti South Extension"],
    contact: "Ekiti State Development Agency",
  },
  {
    name: "Lagos State",
    flag: "🇳🇬",
    status: "active",
    since: "Jan 2024",
    ministry: "Ministry of Urban Development",
    parcels: 2,
    investmentNgn: 6_000_000_000,
    carbonTonnes: 49800,
    infrastructureProjects: 2,
    spvs: ["Lagos Solar Energy SPV", "Victoria Island Tower"],
    contact: "LASG Investment Commission",
  },
  {
    name: "FCT Abuja",
    flag: "🇳🇬",
    status: "active",
    since: "Feb 2024",
    ministry: "FCT Area Council Authority",
    parcels: 1,
    investmentNgn: 2_200_000_000,
    carbonTonnes: 860,
    infrastructureProjects: 1,
    spvs: ["Abuja Premium Residences"],
    contact: "FCT Investment & Promotions Council",
  },
  {
    name: "Oyo State",
    flag: "🇳🇬",
    status: "pipeline",
    since: "Q3 2024",
    ministry: "Ministry of Lands, Housing & Survey",
    parcels: 1,
    investmentNgn: 0,
    carbonTonnes: 0,
    infrastructureProjects: 0,
    spvs: ["Ibadan Commercial Hub (Pending)"],
    contact: "Oyo State Investment Promotion Agency",
  },
  {
    name: "Accra, Ghana",
    flag: "🇬🇭",
    status: "active",
    since: "Mar 2024",
    ministry: "Ghana Land Commission",
    parcels: 1,
    investmentNgn: 880_000_000,
    carbonTonnes: 1150,
    infrastructureProjects: 1,
    spvs: ["Accra Heights Ghana"],
    contact: "Ghana Investment Promotion Centre",
  },
  {
    name: "Nairobi, Kenya",
    flag: "🇰🇪",
    status: "pipeline",
    since: "Q2 2024",
    ministry: "Nairobi County Government",
    parcels: 1,
    investmentNgn: 1_900_000_000,
    carbonTonnes: 3200,
    infrastructureProjects: 1,
    spvs: ["Nairobi Business Park"],
    contact: "Kenya National Investment Authority",
  },
];

const PPP_PROJECTS = [
  { name: "Ekiti Smart Land Registry", state: "Ekiti", type: "Digital Infrastructure", value: 180_000_000, status: "live", completion: 72 },
  { name: "Lagos Solar Grid Integration", state: "Lagos", type: "Energy Infrastructure", value: 1_500_000_000, status: "live", completion: 46 },
  { name: "Abuja Green Housing", state: "FCT Abuja", type: "Residential", value: 2_200_000_000, status: "live", completion: 78 },
  { name: "Accra Commercial Hub", state: "Ghana", type: "Commercial", value: 880_000_000, status: "live", completion: 34 },
  { name: "Nairobi Business Park", state: "Kenya", type: "Commercial", value: 1_900_000_000, status: "funding", completion: 91 },
  { name: "Ekiti South LandBank", state: "Ekiti", type: "LandBank", value: 400_000_000, status: "pending", completion: 0 },
  { name: "Oyo Ibadan Commercial", state: "Oyo", type: "Commercial", value: 800_000_000, status: "pipeline", completion: 0 },
];

const INVESTMENT_FLOW = [
  { month: "Jan", ekiti: 80, lagos: 420, abuja: 0, other: 0 },
  { month: "Feb", ekiti: 120, lagos: 680, abuja: 850, other: 0 },
  { month: "Mar", ekiti: 180, lagos: 980, abuja: 1200, other: 440 },
  { month: "Apr", ekiti: 220, lagos: 1200, abuja: 1500, other: 620 },
  { month: "May", ekiti: 249, lagos: 1387, abuja: 1716, other: 880 },
];

const CARBON_BY_STATE = [
  { state: "Lagos", tonnes: 49800, color: "#0E7C66" },
  { state: "Kenya", tonnes: 3200, color: "#34d399" },
  { state: "Ekiti", tonnes: 2400, color: "#D4AF37" },
  { state: "Accra", tonnes: 1150, color: "#818cf8" },
  { state: "Abuja", tonnes: 860, color: "#60a5fa" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  pipeline: { label: "Pipeline", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  live: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  funding: { label: "Funding", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  pending: { label: "Pending", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
};

const totalInvestment = STATE_PARTNERS.filter(s => s.status === "active").reduce((a, s) => a + s.investmentNgn, 0);
const totalCarbon = STATE_PARTNERS.reduce((a, s) => a + s.carbonTonnes, 0);
const activePartners = STATE_PARTNERS.filter(s => s.status === "active").length;

export default function GovernmentPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Government Intelligence</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">PPP Dashboard</h1>
              <p className="text-white/40 text-sm mt-1">
                Public-private partnership monitoring across all active African state programs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-amber-400/20 bg-amber-400/5 rounded-full px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400 font-medium">{activePartners} Active State Partners</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "State Partners", value: String(STATE_PARTNERS.length), sub: `${activePartners} active`, icon: MapPin, color: "text-primary", glow: "shadow-[0_0_20px_rgba(14,124,102,0.12)]" },
            { label: "PPP Investment", value: formatNgn(totalInvestment), sub: "Active programs", icon: TrendingUp, color: "text-amber-400", glow: "" },
            { label: "Infrastructure Projects", value: "7", sub: "Across 6 states", icon: Building2, color: "text-sky-400", glow: "" },
            { label: "Carbon Generated", value: `${(totalCarbon / 1000).toFixed(1)}K tCO₂e`, sub: "Via state projects", icon: Leaf, color: "text-emerald-400", glow: "" },
          ].map(({ label, value, sub, icon: Icon, color, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-card border border-card-border rounded-xl p-5 ${glow}`}
            >
              <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center mb-3">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
              <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Investment flow stacked area */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-white">PPP Investment Flow</h2>
                <p className="text-xs text-white/35">Cumulative by state (₦M)</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">+211% YTD</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={INVESTMENT_FLOW}>
                <defs>
                  {[["ekiti","#0E7C66"], ["lagos","#D4AF37"], ["abuja","#818cf8"], ["other","#34d399"]].map(([k, c]) => (
                    <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v}M`} />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  formatter={(v: number, name: string) => [`₦${v}M`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Area type="monotone" dataKey="ekiti" name="Ekiti" stackId="1" stroke="#0E7C66" fill="url(#grad-ekiti)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="lagos" name="Lagos" stackId="1" stroke="#D4AF37" fill="url(#grad-lagos)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="abuja" name="Abuja" stackId="1" stroke="#818cf8" fill="url(#grad-abuja)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="other" name="Other" stackId="1" stroke="#34d399" fill="url(#grad-other)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Carbon by state */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">Carbon by State</h2>
            <p className="text-xs text-white/35 mb-4">tCO₂e offset capacity</p>
            <div className="space-y-3">
              {CARBON_BY_STATE.map(({ state, tonnes, color }) => (
                <div key={state}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/50">{state}</span>
                    <span className="font-semibold text-white">{tonnes.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(tonnes / 49800) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05]">
              <Link href="/carbon">
                <button className="w-full text-xs text-white/35 hover:text-primary transition-colors flex items-center justify-center gap-1">
                  View Carbon Intelligence <ChevronRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* State partner cards */}
        <h2 className="font-display font-semibold text-white mb-4">State Partner Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {STATE_PARTNERS.map((p, i) => {
            const sc = STATUS_CONFIG[p.status];
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-card-border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.flag}</span>
                    <div>
                      <div className="font-display font-semibold text-white text-sm">{p.name}</div>
                      <div className="text-[10px] text-white/35">{p.ministry}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="bg-white/[0.03] rounded-lg py-2">
                    <div className="text-sm font-bold text-white">{p.parcels}</div>
                    <div className="text-[9px] text-white/30">Parcels</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg py-2">
                    <div className="text-sm font-bold text-amber-400">{p.status === "pipeline" ? "—" : formatNgn(p.investmentNgn)}</div>
                    <div className="text-[9px] text-white/30">Invested</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg py-2">
                    <div className="text-sm font-bold text-emerald-400">{p.carbonTonnes > 0 ? `${(p.carbonTonnes / 1000).toFixed(1)}K` : "—"}</div>
                    <div className="text-[9px] text-white/30">tCO₂e</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {p.spvs.slice(0, 2).map((spv) => (
                    <div key={spv} className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{spv}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] text-white/25">Partner since {p.since}</span>
                  <div className="flex items-center gap-1 text-[10px] text-white/25">
                    <Shield className="h-3 w-3" />
                    <span>{p.infrastructureProjects} projects</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* PPP Infrastructure project table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-display font-semibold text-white">Infrastructure Projects</h2>
            <span className="text-xs text-white/30">{PPP_PROJECTS.length} active programs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Project", "State", "Type", "Value", "Status", "Completion"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PPP_PROJECTS.map((proj) => {
                  const sc = STATUS_CONFIG[proj.status];
                  return (
                    <tr key={proj.name} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-medium text-white text-sm">{proj.name}</td>
                      <td className="px-5 py-4 text-xs text-white/50">{proj.state}</td>
                      <td className="px-5 py-4 text-xs text-white/50">{proj.type}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-white tabular-nums">{formatNgn(proj.value)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {proj.completion > 0 ? (
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.07]">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${proj.completion}%` }} />
                            </div>
                            <span className="text-xs text-white/50 tabular-nums">{proj.completion}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/20">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
