import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  MapPin, Shield, CheckCircle2, AlertTriangle, Clock,
  FileText, Hash, Search, ExternalLink, RefreshCw,
  Building2, ChevronRight,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const PARCELS = [
  { id: "EKT-2024-001", state: "Ekiti", flag: "🇳🇬", lga: "Ado-Ekiti", area: "50.0 ha", owner: "SPV #1 — Ekiti LandBank", status: "verified", nftId: "1001", govVerified: true, indiVerified: true, date: "2024-01-15", titleRef: "EKT/ML/2024/001" },
  { id: "EKT-2024-002", state: "Ekiti", flag: "🇳🇬", lga: "Ikere-Ekiti", area: "12.4 ha", owner: "SPV #7 — Ikere Commercial", status: "verified", nftId: "1002", govVerified: true, indiVerified: true, date: "2024-02-08", titleRef: "EKT/ML/2024/002" },
  { id: "EKT-2024-003", state: "Ekiti", flag: "🇳🇬", lga: "Ekiti South", area: "85.0 ha", owner: "Unassigned", status: "dispute", nftId: null, govVerified: false, indiVerified: false, date: "2024-04-18", titleRef: "EKT/ML/2024/003" },
  { id: "LAG-2024-001", state: "Lagos", flag: "🇳🇬", lga: "Victoria Island", area: "0.8 ha", owner: "SPV #6 — VI Tower", status: "verified", nftId: "1003", govVerified: true, indiVerified: true, date: "2024-01-28", titleRef: "LAG/VI/2024/001" },
  { id: "LAG-2024-002", state: "Lagos", flag: "🇳🇬", lga: "Agege", area: "5.2 ha", owner: "SPV #2 — Lagos Solar", status: "verified", nftId: "1004", govVerified: true, indiVerified: true, date: "2024-02-14", titleRef: "LAG/AG/2024/001" },
  { id: "ABJ-2024-001", state: "FCT Abuja", flag: "🇳🇬", lga: "Maitama", area: "2.1 ha", owner: "SPV #3 — Abuja Residences", status: "verified", nftId: "1005", govVerified: true, indiVerified: true, date: "2024-02-22", titleRef: "FCT/MA/2024/001" },
  { id: "OYO-2024-001", state: "Oyo", flag: "🇳🇬", lga: "Ibadan North", area: "8.5 ha", owner: "SPV #8 — Ibadan Commercial", status: "pending", nftId: null, govVerified: true, indiVerified: false, date: "2024-03-20", titleRef: "OYO/IB/2024/001" },
  { id: "GHA-2024-001", state: "Accra, Ghana", flag: "🇬🇭", lga: "Airport City", area: "1.4 ha", owner: "SPV #4 — Accra Heights", status: "verified", nftId: "1006", govVerified: true, indiVerified: true, date: "2024-03-05", titleRef: "GHA/AC/2024/001" },
  { id: "KEN-2024-001", state: "Nairobi, Kenya", flag: "🇰🇪", lga: "Westlands", area: "3.5 ha", owner: "SPV #5 — Nairobi Biz Park", status: "pending", nftId: null, govVerified: true, indiVerified: false, date: "2024-04-10", titleRef: "KEN/NB/2024/001" },
];

const REGIONAL_DATA = [
  { state: "Ekiti", parcels: 3, verified: 2 },
  { state: "Lagos", parcels: 2, verified: 2 },
  { state: "FCT", parcels: 1, verified: 1 },
  { state: "Oyo", parcels: 1, verified: 0 },
  { state: "Ghana", parcels: 1, verified: 1 },
  { state: "Kenya", parcels: 1, verified: 0 },
];

const TRANSFER_HISTORY = [
  { month: "Jan", minted: 2, transferred: 1 },
  { month: "Feb", minted: 3, transferred: 2 },
  { month: "Mar", minted: 2, transferred: 1 },
  { month: "Apr", minted: 3, transferred: 3 },
  { month: "May", minted: 2, transferred: 2 },
  { month: "Jun", minted: 5, transferred: 4 },
];

const RECENT_EVENTS = [
  { action: "NFT Minted", parcel: "EKT-2024-002", time: "3h ago", icon: Hash, color: "text-primary" },
  { action: "Govt. Verified", parcel: "OYO-2024-001", time: "6h ago", icon: Shield, color: "text-emerald-400" },
  { action: "Title Transferred", parcel: "LAG-2024-001", time: "1d ago", icon: FileText, color: "text-amber-400" },
  { action: "Dispute Filed", parcel: "EKT-2024-003", time: "2d ago", icon: AlertTriangle, color: "text-rose-400" },
  { action: "Indigenous Verified", parcel: "KEN-2024-001", time: "2d ago", icon: CheckCircle2, color: "text-sky-400" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  verified: { label: "Verified", color: "text-emerald-400", bg: "bg-emerald-400/10 border border-emerald-400/20", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10 border border-amber-400/20", icon: Clock },
  dispute: { label: "Disputed", color: "text-rose-400", bg: "bg-rose-400/10 border border-rose-400/20", icon: AlertTriangle },
};

const STAT_CARD_COLORS: Record<string, string> = {
  primary: "from-primary/10 to-transparent border-primary/20",
  amber: "from-amber-400/10 to-transparent border-amber-400/20",
  rose: "from-rose-400/10 to-transparent border-rose-400/20",
  sky: "from-sky-400/10 to-transparent border-sky-400/20",
};

export default function LandRegistryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "dispute">("all");
  const [refreshing, setRefreshing] = useState(false);

  const verified = PARCELS.filter((p) => p.status === "verified").length;
  const pending = PARCELS.filter((p) => p.status === "pending").length;
  const disputed = PARCELS.filter((p) => p.status === "dispute").length;
  const nftsMinted = PARCELS.filter((p) => p.nftId !== null).length;

  const filtered = PARCELS.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    const q = search.toLowerCase();
    if (q && !p.id.toLowerCase().includes(q) && !p.state.toLowerCase().includes(q) && !p.owner.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Land Registry Intelligence</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Parcel Registry</h1>
              <p className="text-white/40 text-sm mt-1">
                Government-grade dual-verified land ownership for all tokenized properties.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LandRegistry.sol
              </span>
              <button
                onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }}
                className="p-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Parcels", value: String(PARCELS.length), sub: "Registered", color: "primary", icon: MapPin },
            { label: "Verified", value: `${verified} / ${PARCELS.length}`, sub: `${Math.round(verified / PARCELS.length * 100)}% verified`, color: "sky", icon: CheckCircle2 },
            { label: "NFTs Minted", value: String(nftsMinted), sub: "ERC-1155 tokens", color: "amber", icon: Hash },
            { label: "Disputes", value: String(disputed), sub: `${pending} pending review`, color: "rose", icon: AlertTriangle },
          ].map(({ label, value, sub, color, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-gradient-to-br ${STAT_CARD_COLORS[color]} bg-card border rounded-xl p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white/50" />
                </div>
              </div>
              <div className="font-display text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
              <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Regional distribution bar chart */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-white">Parcels by Region</h2>
                <p className="text-xs text-white/35">Registered vs. verified</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={REGIONAL_DATA} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="state" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                />
                <Bar dataKey="parcels" name="Total" fill="rgba(14,124,102,0.3)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="verified" name="Verified" fill="#0E7C66" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* NFT minting activity */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-white mb-1">NFT Activity</h2>
            <p className="text-xs text-white/35 mb-4">Minting & transfer timeline</p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={TRANSFER_HISTORY}>
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(222,47%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                />
                <Line type="monotone" dataKey="minted" name="Minted" stroke="#0E7C66" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="transferred" name="Transferred" stroke="#D4AF37" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /><span className="text-white/40">Minted (total)</span></div>
                <span className="font-semibold text-white">{nftsMinted} NFTs</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-white/40">On-chain standard</span></div>
                <span className="font-semibold text-white">ERC-1155</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table + Activity side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main parcel registry table */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="font-display font-semibold text-white">Parcel Registry</h2>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search parcels…"
                    className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-primary/40 w-36"
                  />
                </div>
                {/* Filter buttons */}
                <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                  {(["all", "verified", "pending", "dispute"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1.5 text-xs capitalize transition-colors ${filter === f ? "bg-primary/20 text-primary" : "text-white/35 hover:text-white/60"}`}
                    >
                      {f === "all" ? "All" : STATUS_CONFIG[f].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Parcel ID", "Region", "Area", "Owner / SPV", "Status", "NFT"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const sc = STATUS_CONFIG[p.status];
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={p.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-mono text-xs text-white/80">{p.id}</div>
                          <div className="text-[10px] text-white/25 mt-0.5">{p.titleRef}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{p.flag}</span>
                            <div>
                              <div className="text-xs text-white/70">{p.state}</div>
                              <div className="text-[10px] text-white/30">{p.lga}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-white/60 tabular-nums">{p.area}</td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs text-white/70 max-w-[140px] truncate">{p.owner}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {sc.label}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {p.govVerified && <span className="text-[9px] text-emerald-400/60">✓ Govt</span>}
                            {p.indiVerified && <span className="text-[9px] text-emerald-400/60">✓ Indigenous</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {p.nftId ? (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3 text-amber-400/70" />
                              <span className="font-mono text-xs text-amber-400">{p.nftId}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-white/25 text-sm">No parcels match your search.</div>
              )}
            </div>
          </div>

          {/* Right column: activity + dual verification info */}
          <div className="space-y-4">
            {/* Recent events */}
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-white/35" />
                <h2 className="font-display text-sm font-semibold text-white">Recent Events</h2>
              </div>
              <div>
                {RECENT_EVENTS.map((e, i) => {
                  const Icon = e.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0">
                      <div className="h-7 w-7 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className={`h-3.5 w-3.5 ${e.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white">{e.action}</div>
                        <div className="font-mono text-[10px] text-white/30">{e.parcel}</div>
                      </div>
                      <div className="text-[10px] text-white/25 shrink-0">{e.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dual verification system explainer */}
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-white">Dual Verification</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                All parcels require both government title verification and indigenous authority consent before any NFT can be minted.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Govt. Ministry of Lands", pct: 78, color: "#0E7C66" },
                  { label: "Indigenous Authority", pct: 67, color: "#D4AF37" },
                  { label: "Fully Dual-Verified", pct: 67, color: "#34d399" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>{label}</span>
                      <span className="font-semibold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2">
                <ExternalLink className="h-3 w-3 text-white/25" />
                <span className="font-mono text-[10px] text-white/25">LandRegistry.sol</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
