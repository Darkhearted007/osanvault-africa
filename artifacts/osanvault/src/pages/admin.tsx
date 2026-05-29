import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle2, Clock, XCircle,
  Activity, Users, Building2, FileText, Eye,
  RefreshCw, Lock, Radio, TrendingUp,
  Hash, ChevronDown, ChevronUp, MapPin, Coins,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";
import { formatNgn } from "@/lib/mock-data";

/* ── Data ──────────────────────────────────────────────────────────────── */

type ApprovalStatus = "pending_approval" | "pending_review" | "kyc_required" | "approved" | "rejected";
type KycStatus = "approved" | "pending" | "review" | "rejected";
type PayoutStatus = "pending" | "approved" | "rejected";

interface ApprovalItem {
  id: string;
  name: string;
  type: string;
  state: string;
  flag: string;
  valueNgn: number;
  submittedAgo: string;
  kyc: string;
  tokens: number;
  yield: string;
  description: string;
  status: ApprovalStatus;
}

const INITIAL_QUEUE: ApprovalItem[] = [
  { id: "SPV-2024-009", name: "Kano Industrial Park Phase 1", type: "LandBank", state: "Kano, Nigeria", flag: "🇳🇬", valueNgn: 2_800_000_000, submittedAgo: "2d ago", kyc: "passed", tokens: 2_800_000, yield: "11.4%", description: "50-hectare industrial land bank in Kano State. Dual land verification complete. SEC ARIP Sandbox compliant.", status: "pending_approval" },
  { id: "SPV-2024-010", name: "Port Harcourt Maritime Hub", type: "Commercial", state: "Rivers, Nigeria", flag: "🇳🇬", valueNgn: 3_500_000_000, submittedAgo: "4d ago", kyc: "passed", tokens: 3_500_000, yield: "13.2%", description: "Premium commercial maritime hub at Port Harcourt waterfront. Government title registered, indigenous verification in progress.", status: "pending_review" },
  { id: "SPV-2024-011", name: "Kampala Commercial Park", type: "Commercial", state: "Uganda", flag: "🇺🇬", valueNgn: 1_200_000_000, submittedAgo: "6d ago", kyc: "pending", tokens: 1_200_000, yield: "9.8%", description: "Modern commercial park in Kampala central business district. Awaiting KYC completion for issuer entity.", status: "kyc_required" },
];

const INITIAL_KYC = [
  { address: "0x1a2b3c...4d5e", name: "Emmanuel Adeyemi", country: "Nigeria", tier: "Institutional", date: "2024-05-28", status: "approved" as KycStatus },
  { address: "0x9f8e7d...6c5b", name: "Amara Holdings Ltd.", country: "Ghana", tier: "Corporate", date: "2024-05-27", status: "approved" as KycStatus },
  { address: "0x2c3d4e...5f6a", name: "Kwame Asante", country: "Ghana", tier: "Retail", date: "2024-05-29", status: "pending" as KycStatus },
  { address: "0x7b6a59...8c9d", name: "Fatima Al-Rashid", country: "Kenya", tier: "Institutional", date: "2024-05-26", status: "review" as KycStatus },
  { address: "0x3e4f50...6172", name: "Lagos Capital Group", country: "Nigeria", tier: "Corporate", date: "2024-05-25", status: "approved" as KycStatus },
];

const INITIAL_PAYOUTS = [
  { spv: "Ekiti LandBank Phase 1", amount: 3_480_000, beneficiaries: 48, dueDate: "Jun 30", status: "pending" as PayoutStatus },
  { spv: "Lagos Solar Energy SPV", amount: 8_790_000, beneficiaries: 94, dueDate: "Jun 30", status: "pending" as PayoutStatus },
  { spv: "Abuja Premium Residences", amount: 19_200_000, beneficiaries: 217, dueDate: "Jul 15", status: "pending" as PayoutStatus },
];

const AUDIT_LOG = [
  { event: "Property SPV whitelisted", actor: "0x1a2b...4d5e", detail: "Abuja Residences — Token mint authorized", time: "15m ago", severity: "info" },
  { event: "Governance proposal executed", actor: "Governance.sol", detail: "Proposal #4 executed — Treasury diversification", time: "2h ago", severity: "success" },
  { event: "KYC rejection flagged", actor: "Compliance Engine", detail: "Entity 0x7b6a...8c9d flagged for manual review", time: "4h ago", severity: "warning" },
  { event: "Payout batch processed", actor: "TreasuryVault.sol", detail: "₦18.4M distributed to 142 property token holders", time: "6h ago", severity: "info" },
  { event: "Oracle price update", actor: "Chainlink Oracle", detail: "NGN/USD rate updated: 0.000645", time: "8h ago", severity: "info" },
  { event: "Large transfer detected", actor: "Security Monitor", detail: "5.2M OSANV transfer from 0x3e4f...6172", time: "12h ago", severity: "warning" },
];

const SECURITY_ALERTS = [
  { level: "medium", title: "Unusual staking activity", detail: "3 wallets staked >10M OSANV within 1h window", time: "2h ago" },
  { level: "low", title: "KYC review queue threshold", detail: "5+ applications pending >48h", time: "6h ago" },
];

const ORACLE_FEEDS = [
  { name: "NGN / USD", value: "0.000645", delta: "+0.002%", status: "live", updated: "2m ago" },
  { name: "MATIC / USD", value: "$0.712", delta: "-0.8%", status: "live", updated: "2m ago" },
  { name: "OSANV / NGN", value: "₦48.20", delta: "+1.2%", status: "live", updated: "5m ago" },
  { name: "tCO₂e / USD", value: "$14.80", delta: "+0.5%", status: "live", updated: "8m ago" },
];

/* ── Style maps ────────────────────────────────────────────────────────── */

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending_approval: { label: "Awaiting Approval", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  pending_review:   { label: "Under Review",      color: "text-sky-400",   bg: "bg-sky-400/10 border-sky-400/20"   },
  kyc_required:     { label: "KYC Required",       color: "text-rose-400",  bg: "bg-rose-400/10 border-rose-400/20"  },
  approved:         { label: "Approved",            color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  rejected:         { label: "Rejected",            color: "text-rose-400",  bg: "bg-rose-400/10 border-rose-400/20"  },
  pending:          { label: "Pending",             color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  review:           { label: "In Review",           color: "text-sky-400",   bg: "bg-sky-400/10 border-sky-400/20"   },
};

const SEVERITY_CFG: Record<string, { color: string; dot: string }> = {
  success: { color: "text-emerald-400", dot: "bg-emerald-400" },
  info:    { color: "text-sky-400",     dot: "bg-sky-400"     },
  warning: { color: "text-amber-400",   dot: "bg-amber-400"   },
  error:   { color: "text-rose-400",    dot: "bg-rose-400"    },
};

const ALERT_CFG: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  high:   { color: "text-rose-400",  bg: "bg-rose-400/10 border-rose-400/20",  icon: AlertTriangle },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: AlertTriangle },
  low:    { color: "text-sky-400",   bg: "bg-sky-400/10 border-sky-400/20",    icon: Activity      },
};

/* ── Component ─────────────────────────────────────────────────────────── */

export default function AdminPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [queue, setQueue]           = useState(INITIAL_QUEUE);
  const [kycList, setKycList]       = useState(INITIAL_KYC);
  const [payouts, setPayouts]       = useState(INITIAL_PAYOUTS);
  const [expanded, setExpanded]     = useState<string | null>(null);

  /* derived counts */
  const pendingApprovals = queue.filter(q => q.status === "pending_approval" || q.status === "pending_review").length;
  const kycPending       = kycList.filter(k => k.status === "pending" || k.status === "review").length;
  const payoutTotal      = payouts.filter(p => p.status === "pending").reduce((a, p) => a + p.amount, 0);

  /* ── Approval queue actions ─────────────────────────────────────────── */
  function approveSpv(id: string, name: string) {
    setQueue(q => q.map(item => item.id === id ? { ...item, status: "approved" } : item));
    setExpanded(null);
    toast.success(`SPV Approved: ${name}`, {
      description: "Token mint authorized. Whitelist updated on-chain.",
      duration: 4000,
    });
  }

  function rejectSpv(id: string, name: string) {
    setQueue(q => q.map(item => item.id === id ? { ...item, status: "rejected" } : item));
    setExpanded(null);
    toast.error(`SPV Rejected: ${name}`, {
      description: "Issuer notified. Application returned for revision.",
      duration: 4000,
    });
  }

  /* ── KYC actions ────────────────────────────────────────────────────── */
  function approveKyc(address: string, name: string) {
    setKycList(l => l.map(k => k.address === address ? { ...k, status: "approved" as KycStatus } : k));
    toast.success(`KYC Approved: ${name}`, { description: "Wallet added to whitelist." });
  }

  function rejectKyc(address: string, name: string) {
    setKycList(l => l.map(k => k.address === address ? { ...k, status: "rejected" as KycStatus } : k));
    toast.error(`KYC Rejected: ${name}`, { description: "Application flagged for compliance review." });
  }

  /* ── Payout actions ─────────────────────────────────────────────────── */
  function approvePayout(spv: string, amount: number) {
    setPayouts(p => p.map(x => x.spv === spv ? { ...x, status: "approved" as PayoutStatus } : x));
    toast.success(`Payout Approved: ${spv}`, {
      description: `${formatNgn(amount)} queued in TreasuryVault.sol (2-day timelock).`,
    });
  }

  function rejectPayout(spv: string) {
    setPayouts(p => p.map(x => x.spv === spv ? { ...x, status: "rejected" as PayoutStatus } : x));
    toast.error(`Payout Rejected: ${spv}`, { description: "Distribution cancelled. Finance team notified." });
  }

  return (
    <Layout>
      <CinematicPageHeader
        icon={Shield}
        eyebrow="Admin Control Center"
        title="Operations Console"
        subtitle="Property approvals, KYC monitoring, oracle feeds, audit logs, and security"
        imageUrl="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
        kbVariant={1}
        imagePosition="center 40%"
        stats={[
          { label: "Pending Approvals", value: String(pendingApprovals), color: pendingApprovals > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "KYC Queue", value: String(kycPending), color: kycPending > 0 ? "text-sky-400" : "text-emerald-400" },
          { label: "Alerts", value: String(SECURITY_ALERTS.length), color: "text-rose-400" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Operations Console</h1>
              <p className="text-white/40 text-sm mt-1">Property approvals, KYC monitoring, oracle feeds, audit logs, and security.</p>
            </div>
            <div className="flex items-center gap-2">
              {SECURITY_ALERTS.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 border border-amber-400/20 bg-amber-400/5 rounded-full px-3 py-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  {SECURITY_ALERTS.length} alerts
                </div>
              )}
              <button
                onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }}
                className="p-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Contracts Deployed", value: "7 / 7",            icon: Hash,      color: "text-emerald-400", status: "nominal" },
            { label: "KYC Queue",          value: `${kycPending} pending`, icon: Users,  color: "text-amber-400",  status: kycPending > 0 ? "action" : "nominal" },
            { label: "Pending Approvals",  value: String(pendingApprovals), icon: Building2, color: "text-sky-400", status: pendingApprovals > 0 ? "action" : "nominal" },
            { label: "Pending Payouts",    value: `₦${(payoutTotal / 1_000_000).toFixed(1)}M`, icon: TrendingUp, color: "text-primary", status: "nominal" },
          ].map(({ label, value, icon: Icon, color, status }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-card-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className={`h-2 w-2 rounded-full ${status === "nominal" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              </div>
              <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* ── Property Approval Queue ─────────────────────────────────── */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-white/35" />
                <h2 className="font-display font-semibold text-white">Property Approval Queue</h2>
              </div>
              <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5">
                {pendingApprovals} pending
              </span>
            </div>

            <div>
              {queue.map((item) => {
                const sc        = STATUS_CFG[item.status];
                const isOpen    = expanded === item.id;
                const isDone    = item.status === "approved" || item.status === "rejected";
                const canAct    = item.status !== "kyc_required" && !isDone;

                return (
                  <div key={item.id} className="border-b border-white/[0.04] last:border-0">
                    {/* Row — click anywhere to expand */}
                    <motion.div
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-colors cursor-pointer"
                    >
                      <span className="text-xl shrink-0">{item.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white truncate">{item.name}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/30">
                          <span className="font-mono">{item.id}</span>
                          <span>·</span><span>{item.type}</span>
                          <span>·</span><span>{item.state}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-white">{formatNgn(item.valueNgn)}</div>
                        <div className="text-[10px] text-white/25">{item.submittedAgo}</div>
                      </div>
                      <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        {isDone ? (
                          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border ${sc.bg} ${sc.color}`}>
                            {item.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          </span>
                        ) : (
                          <>
                            <button
                              disabled={!canAct}
                              onClick={() => approveSpv(item.id, item.name)}
                              className="p-1.5 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/25 text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Approve SPV"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              disabled={!canAct}
                              onClick={() => rejectSpv(item.id, item.name)}
                              className="p-1.5 rounded-lg bg-rose-400/10 hover:bg-rose-400/25 text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Reject SPV"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpanded(isOpen ? null : item.id); }}
                              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-white/40 transition-colors"
                              title="View details"
                            >
                              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>

                    {/* Expandable detail panel */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-1 bg-white/[0.02] border-t border-white/[0.04]">
                            <p className="text-xs text-white/45 mb-4 leading-relaxed">{item.description}</p>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {[
                                { icon: Coins,    label: "Token Supply",  value: `${(item.tokens / 1_000_000).toFixed(1)}M` },
                                { icon: TrendingUp, label: "Yield APY",   value: item.yield },
                                { icon: MapPin,   label: "KYC Status",   value: item.kyc === "passed" ? "Passed ✓" : "Pending" },
                              ].map(({ icon: Ic, label, value }) => (
                                <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2.5">
                                  <Ic className="h-3 w-3 text-white/25 mb-1" />
                                  <div className="text-xs font-semibold text-white">{value}</div>
                                  <div className="text-[10px] text-white/30">{label}</div>
                                </div>
                              ))}
                            </div>
                            {!isDone && canAct && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => approveSpv(item.id, item.name)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20 text-emerald-400 text-xs font-semibold transition-colors"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve SPV
                                </button>
                                <button
                                  onClick={() => rejectSpv(item.id, item.name)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 border border-rose-400/20 text-rose-400 text-xs font-semibold transition-colors"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Reject SPV
                                </button>
                              </div>
                            )}
                            {item.status === "kyc_required" && (
                              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                Approval blocked — issuer KYC must be completed first.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Oracle feeds + Security alerts ──────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <h2 className="font-display text-sm font-semibold text-white">Oracle Feeds</h2>
                <span className="ml-auto text-[10px] text-emerald-400/60">Chainlink</span>
              </div>
              <div>
                {ORACLE_FEEDS.map((feed) => (
                  <div key={feed.name} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-white">{feed.name}</div>
                      <div className="text-[10px] text-white/25">{feed.updated}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white tabular-nums">{feed.value}</div>
                      <div className={`text-[10px] ${feed.delta.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{feed.delta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {SECURITY_ALERTS.length > 0 && (
              <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <h2 className="font-display text-sm font-semibold text-white">Security Alerts</h2>
                </div>
                <div>
                  {SECURITY_ALERTS.map((alert, i) => {
                    const ac = ALERT_CFG[alert.level];
                    const AlertIcon = ac.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${ac.bg}`}>
                          <AlertIcon className={`h-3.5 w-3.5 ${ac.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`text-xs font-semibold ${ac.color}`}>{alert.title}</div>
                          <div className="text-[10px] text-white/35 mt-0.5">{alert.detail}</div>
                          <div className="text-[9px] text-white/20 mt-0.5">{alert.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── KYC table + Audit log ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* KYC monitoring */}
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/35" />
                <h2 className="font-display font-semibold text-white">KYC Monitoring</h2>
              </div>
              <span className="text-xs text-white/30">{kycList.length} recent</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Address", "Entity", "Tier", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kycList.map((k) => {
                    const sc      = STATUS_CFG[k.status];
                    const canAct  = k.status === "pending" || k.status === "review";
                    return (
                      <tr key={k.address} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-white/50">{k.address}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-white/80 truncate max-w-[90px]">{k.name}</div>
                          <div className="text-[10px] text-white/30">{k.country}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/40">{k.tier}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {canAct ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => approveKyc(k.address, k.name)}
                                className="p-1 rounded-md bg-emerald-400/10 hover:bg-emerald-400/25 text-emerald-400 transition-colors"
                                title="Approve KYC"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => rejectKyc(k.address, k.name)}
                                className="p-1 rounded-md bg-rose-400/10 hover:bg-rose-400/25 text-rose-400 transition-colors"
                                title="Reject KYC"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
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
            </div>
          </div>

          {/* Audit log */}
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <FileText className="h-4 w-4 text-white/35" />
              <h2 className="font-display font-semibold text-white">Audit Log</h2>
            </div>
            <div>
              {AUDIT_LOG.map((entry, i) => {
                const sc = SEVERITY_CFG[entry.severity];
                return (
                  <div key={i} className="flex items-start gap-3 px-6 py-3.5 border-b border-white/[0.04] last:border-0">
                    <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${sc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${sc.color}`}>{entry.event}</div>
                      <div className="text-[10px] text-white/30 truncate mt-0.5">{entry.detail}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[9px] text-white/20">{entry.actor}</span>
                        <span className="text-[9px] text-white/15">·</span>
                        <span className="text-[9px] text-white/20">{entry.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Pending payouts ───────────────────────────────────────────── */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-display font-semibold text-white">Pending Payout Approvals</h2>
            <span className="text-xs text-white/30">TreasuryVault.sol — 2-day timelock</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["SPV", "Amount", "Beneficiaries", "Due Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const isDone = payout.status !== "pending";
                  return (
                    <tr key={payout.spv} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{payout.spv}</td>
                      <td className="px-5 py-4 font-bold text-primary tabular-nums">{formatNgn(payout.amount)}</td>
                      <td className="px-5 py-4 text-white/50">{payout.beneficiaries} wallets</td>
                      <td className="px-5 py-4 text-white/50">{payout.dueDate}</td>
                      <td className="px-5 py-4">
                        {isDone ? (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            payout.status === "approved"
                              ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                              : "bg-rose-400/10 border-rose-400/20 text-rose-400"
                          }`}>
                            {payout.status === "approved" ? "Approved" : "Rejected"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isDone ? (
                          <span className="text-[10px] text-white/20">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => approvePayout(payout.spv, payout.amount)}
                              className="text-[11px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </button>
                            <button
                              onClick={() => rejectPayout(payout.spv)}
                              className="text-[11px] bg-rose-400/10 hover:bg-rose-400/20 text-rose-400 border border-rose-400/20 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/20 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <Lock className="h-4 w-4 shrink-0 text-white/15" />
          <span>Admin controls require multi-sig authorization. All approval actions are logged on-chain and subject to the 2-day TreasuryVault.sol timelock. Operator access is role-based via governance.</span>
        </div>

      </div>
    </Layout>
  );
}
