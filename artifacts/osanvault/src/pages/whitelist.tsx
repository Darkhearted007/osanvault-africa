import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, UserX, Clock, Shield, Search, Plus, X, CheckCircle2,
  AlertTriangle, ChevronDown, ExternalLink, Copy, RefreshCw, Filter,
  Building2, User, Briefcase, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";
import { explorerAddress, POLYGONSCAN_BASE } from "@/lib/contract";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

// ─── Types ───────────────────────────────────────────────────────────────────
type WhitelistStatus = "pending" | "approved" | "rejected" | "revoked";
type KycLevel = "basic" | "advanced" | "institutional";
type InvestorType = "individual" | "hni" | "institutional" | "fund";

interface WhitelistEntry {
  id: number;
  address: string;
  status: WhitelistStatus;
  kycLevel: KycLevel;
  investorType: InvestorType;
  jurisdiction: string;
  investmentCapNgn: number;
  addedBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface WhitelistStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
  institutional: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<WhitelistStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:  { label: "Pending",  color: "bg-amber-500/15 text-amber-400 border-amber-500/20",   icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500/15 text-red-400 border-red-500/20",         icon: UserX },
  revoked:  { label: "Revoked",  color: "bg-muted text-muted-foreground border-border",          icon: X },
};

const KYC_CONFIG: Record<KycLevel, { label: string; color: string }> = {
  basic:         { label: "Basic KYC",         color: "bg-sky-500/10 text-sky-400" },
  advanced:      { label: "Advanced KYC",       color: "bg-violet-500/10 text-violet-400" },
  institutional: { label: "Institutional KYC",  color: "bg-amber-500/10 text-amber-500 dark:text-amber-400" },
};

const INVESTOR_TYPE_CONFIG: Record<InvestorType, { label: string; icon: typeof User }> = {
  individual:    { label: "Individual",    icon: User },
  hni:           { label: "HNI",           icon: TrendingUp },
  institutional: { label: "Institution",   icon: Building2 },
  fund:          { label: "Fund",          icon: Briefcase },
};

const JURISDICTIONS = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt",
  "United Kingdom", "United States", "UAE", "Singapore", "Other",
];

function formatNgn(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function shortenAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ─── Mock seed data (shown when DB returns empty) ────────────────────────────
const MOCK_ENTRIES: WhitelistEntry[] = [
  { id: 1, address: "0x3a8e4f1d9c0b72a6f845e3d1c0a7b5f2e8d4c9a1", status: "approved", kycLevel: "institutional", investorType: "institutional", jurisdiction: "Nigeria", investmentCapNgn: 500_000_000, addedBy: "admin", notes: "Lagos Pension Fund", createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-01-11T14:00:00Z" },
  { id: 2, address: "0x7f2c1a9e4d8b5f0c3e7a2d6b9f1c4e8a5d2b7f0c", status: "approved", kycLevel: "advanced", investorType: "hni", jurisdiction: "Ghana", investmentCapNgn: 50_000_000, addedBy: "admin", notes: "Accra HNI investor", createdAt: "2025-01-12T11:00:00Z", updatedAt: "2025-01-13T10:00:00Z" },
  { id: 3, address: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", status: "pending", kycLevel: "basic", investorType: "individual", jurisdiction: "Kenya", investmentCapNgn: 5_000_000, addedBy: "admin", notes: "Nairobi retail investor", createdAt: "2025-05-20T08:30:00Z", updatedAt: "2025-05-20T08:30:00Z" },
  { id: 4, address: "0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3", status: "approved", kycLevel: "institutional", investorType: "fund", jurisdiction: "United Kingdom", investmentCapNgn: 2_000_000_000, addedBy: "admin", notes: "Africa EM Fund, London", createdAt: "2025-02-01T07:00:00Z", updatedAt: "2025-02-03T12:00:00Z" },
  { id: 5, address: "0xf0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9", status: "rejected", kycLevel: "basic", investorType: "individual", jurisdiction: "Other", investmentCapNgn: 0, addedBy: "admin", notes: "Failed AML screening", createdAt: "2025-03-05T15:00:00Z", updatedAt: "2025-03-06T09:00:00Z" },
  { id: 6, address: "0xc9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0", status: "pending", kycLevel: "advanced", investorType: "individual", jurisdiction: "Nigeria", investmentCapNgn: 10_000_000, addedBy: "admin", notes: "Abuja individual investor", createdAt: "2025-05-28T14:00:00Z", updatedAt: "2025-05-28T14:00:00Z" },
];

// ─── Add Entry Modal ──────────────────────────────────────────────────────────
function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: (e: WhitelistEntry) => void }) {
  const [form, setForm] = useState({
    address: "", kycLevel: "basic" as KycLevel, investorType: "individual" as InvestorType,
    jurisdiction: "Nigeria", investmentCapNgn: "", notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.match(/^0x[0-9a-fA-F]{40}$/)) {
      toast.error("Invalid EVM address — must be 0x followed by 40 hex chars");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          investmentCapNgn: parseInt(form.investmentCapNgn) || 0,
          status: "pending",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to add address");
        return;
      }
      const entry = await res.json();
      toast.success(`${shortenAddr(form.address)} added to whitelist`);
      onAdded(entry);
      onClose();
    } catch {
      toast.error("Network error — using mock mode");
      const mock: WhitelistEntry = { id: Date.now(), ...form, status: "pending", investmentCapNgn: parseInt(form.investmentCapNgn) || 0, addedBy: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      onAdded(mock);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Add to Whitelist</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Register a wallet address for token participation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Wallet Address *</label>
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="0x..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">KYC Level</label>
              <select value={form.kycLevel} onChange={(e) => setForm({ ...form, kycLevel: e.target.value as KycLevel })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="basic">Basic KYC</option>
                <option value="advanced">Advanced KYC</option>
                <option value="institutional">Institutional KYC</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Investor Type</label>
              <select value={form.investorType} onChange={(e) => setForm({ ...form, investorType: e.target.value as InvestorType })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="individual">Individual</option>
                <option value="hni">HNI</option>
                <option value="institutional">Institutional</option>
                <option value="fund">Fund</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Jurisdiction</label>
              <select value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Investment Cap (NGN)</label>
              <input
                type="number"
                min="0"
                value={form.investmentCapNgn}
                onChange={(e) => setForm({ ...form, investmentCapNgn: e.target.value })}
                placeholder="e.g. 50000000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Entity name, reference, source of funds..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? "Adding…" : "Add to Whitelist"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WhitelistPage() {
  const [entries, setEntries] = useState<WhitelistEntry[]>(MOCK_ENTRIES);
  const [stats, setStats] = useState<WhitelistStats>({
    total: 6, pending: 2, approved: 3, rejected: 1, revoked: 0, institutional: 2,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WhitelistStatus | "all">("all");
  const [kycFilter, setKycFilter] = useState<KycLevel | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        fetch(`${API}/whitelist`),
        fetch(`${API}/whitelist/stats`),
      ]);
      if (eRes.ok && sRes.ok) {
        const [data, statsData] = await Promise.all([eRes.json(), sRes.json()]);
        if (Array.isArray(data) && data.length > 0) setEntries(data);
        setStats(statsData);
      }
    } catch {
      /* keep mock data */
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: WhitelistStatus) {
    try {
      const res = await fetch(`${API}/whitelist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = res.ok ? await res.json() : null;
      setEntries((prev) => prev.map((e) => (e.id === id ? (updated || { ...e, status }) : e)));
      const labels: Record<WhitelistStatus, string> = { approved: "Approved", rejected: "Rejected", revoked: "Revoked", pending: "Reset to Pending" };
      toast.success(`Address ${labels[status]}`);
      setStats((s) => {
        const old = entries.find((e) => e.id === id)?.status ?? "pending";
        return { ...s, [old]: s[old as keyof typeof s] - 1, [status]: s[status as keyof typeof s] + 1 };
      });
    } catch {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      toast.success("Status updated (mock mode)");
    }
  }

  async function removeEntry(id: number) {
    try {
      await fetch(`${API}/whitelist/${id}`, { method: "DELETE" });
    } catch { /* ok */ }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setStats((s) => ({ ...s, total: s.total - 1 }));
    toast.success("Entry removed");
  }

  function handleAdded(entry: WhitelistEntry) {
    setEntries((prev) => [entry, ...prev]);
    setStats((s) => ({ ...s, total: s.total + 1, pending: s.pending + 1 }));
  }

  const filtered = entries.filter((e) => {
    const matchSearch = !search ||
      e.address.toLowerCase().includes(search.toLowerCase()) ||
      e.notes.toLowerCase().includes(search.toLowerCase()) ||
      e.jurisdiction.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchKyc = kycFilter === "all" || e.kycLevel === kycFilter;
    return matchSearch && matchStatus && matchKyc;
  });

  const statCards = [
    { label: "Total Registered", value: stats.total, icon: UserCheck, color: "bg-primary/10 text-primary" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "bg-amber-500/15 text-amber-500" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-500" },
    { label: "Institutional", value: stats.institutional, icon: Building2, color: "bg-violet-500/15 text-violet-500" },
  ];

  return (
    <Layout>
      <AnimatePresence>{showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}</AnimatePresence>

      <CinematicPageHeader
        icon={Shield}
        eyebrow="Compliance"
        title="Investor Whitelist"
        subtitle="KYC/AML-verified wallet addresses — SEC ARIP Sandbox compliant on Polygon Amoy"
        imageUrl="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1920&q=80"
        kbVariant={3}
        imagePosition="center 40%"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Investor Whitelist</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              KYC/AML-verified wallet addresses approved to hold OsanVault property tokens — SEC ARIP Sandbox compliant
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-card-border rounded-xl p-5"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Compliance banner */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Regulatory Gate — </span>
            Only whitelisted addresses can receive OsanVault property tokens (ERC-1155 via
            <span className="font-mono text-foreground"> PropertyNFT.sol</span>). KYC is performed off-chain; on-chain
            minting is gated by this registry. Compliant with{" "}
            <span className="font-semibold text-foreground">SEC ARIP Sandbox (Nigeria)</span>, Polygon Amoy Testnet.
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address, notes, jurisdiction…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WhitelistStatus | "all")}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="revoked">Revoked</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value as KycLevel | "all")}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All KYC Levels</option>
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
                <option value="institutional">Institutional</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wallet Address</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">KYC</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jurisdiction</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Investment Cap</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-muted-foreground">
                        <UserCheck className="h-8 w-8 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No entries match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((entry, i) => {
                      const StatusIcon = STATUS_CONFIG[entry.status].icon;
                      const TypeIcon = INVESTOR_TYPE_CONFIG[entry.investorType].icon;
                      return (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors group"
                        >
                          {/* Address */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-foreground text-xs">{shortenAddr(entry.address)}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => { navigator.clipboard.writeText(entry.address); toast.success("Address copied"); }}
                                  className="p-1 rounded hover:bg-muted"
                                ><Copy className="h-3 w-3 text-muted-foreground" /></button>
                                <a href={`${POLYGONSCAN_BASE}/address/${entry.address}`} target="_blank" rel="noopener noreferrer"
                                  className="p-1 rounded hover:bg-muted">
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CONFIG[entry.status].color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {STATUS_CONFIG[entry.status].label}
                            </span>
                          </td>

                          {/* KYC Level */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${KYC_CONFIG[entry.kycLevel].color}`}>
                              {KYC_CONFIG[entry.kycLevel].label}
                            </span>
                          </td>

                          {/* Investor Type */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <TypeIcon className="h-3.5 w-3.5" />
                              {INVESTOR_TYPE_CONFIG[entry.investorType].label}
                            </div>
                          </td>

                          {/* Jurisdiction */}
                          <td className="px-4 py-3.5 text-xs text-foreground">{entry.jurisdiction || "—"}</td>

                          {/* Investment Cap */}
                          <td className="px-4 py-3.5 text-right">
                            {entry.investmentCapNgn > 0
                              ? <span className="text-xs font-semibold text-foreground">{formatNgn(entry.investmentCapNgn)}</span>
                              : <span className="text-xs text-muted-foreground">—</span>
                            }
                          </td>

                          {/* Notes */}
                          <td className="px-4 py-3.5 max-w-[160px]">
                            <span className="text-xs text-muted-foreground truncate block" title={entry.notes}>{entry.notes || "—"}</span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {entry.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateStatus(entry.id, "approved")}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                    title="Approve"
                                  ><CheckCircle2 className="h-3.5 w-3.5" /></button>
                                  <button
                                    onClick={() => updateStatus(entry.id, "rejected")}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                    title="Reject"
                                  ><UserX className="h-3.5 w-3.5" /></button>
                                </>
                              )}
                              {entry.status === "approved" && (
                                <button
                                  onClick={() => updateStatus(entry.id, "revoked")}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors"
                                  title="Revoke"
                                ><AlertTriangle className="h-3.5 w-3.5" /></button>
                              )}
                              {(entry.status === "rejected" || entry.status === "revoked") && (
                                <button
                                  onClick={() => updateStatus(entry.id, "pending")}
                                  className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 transition-colors"
                                  title="Reset to Pending"
                                ><RefreshCw className="h-3.5 w-3.5" /></button>
                              )}
                              <button
                                onClick={() => removeEntry(entry.id)}
                                className="p-1.5 rounded-lg bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                title="Remove"
                              ><X className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              <span className="font-semibold text-foreground">{entries.length}</span> entries
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">
                {stats.approved} approved · {stats.pending} pending review
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
