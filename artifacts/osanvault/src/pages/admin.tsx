import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle2, Clock, XCircle,
  Activity, Users, Building2, FileText, Eye,
  RefreshCw, Settings, Lock, Zap, ChevronRight,
  Hash, TrendingUp, Radio, Database,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { formatNgn } from "@/lib/mock-data";

const APPROVAL_QUEUE = [
  { id: "SPV-2024-009", name: "Kano Industrial Park Phase 1", type: "LandBank", state: "Kano, Nigeria", flag: "🇳🇬", valueNgn: 2_800_000_000, submittedAgo: "2d ago", kyc: "passed", status: "pending_approval" },
  { id: "SPV-2024-010", name: "Port Harcourt Maritime Hub", type: "Commercial", state: "Rivers, Nigeria", flag: "🇳🇬", valueNgn: 3_500_000_000, submittedAgo: "4d ago", kyc: "passed", status: "pending_review" },
  { id: "SPV-2024-011", name: "Kampala Commercial Park", type: "Commercial", state: "Uganda", flag: "🇺🇬", valueNgn: 1_200_000_000, submittedAgo: "6d ago", kyc: "pending", status: "kyc_required" },
];

const KYC_TABLE = [
  { address: "0x1a2b3c...4d5e", name: "Emmanuel Adeyemi", country: "Nigeria", tier: "Institutional", status: "approved", date: "2024-05-28" },
  { address: "0x9f8e7d...6c5b", name: "Amara Holdings Ltd.", country: "Ghana", tier: "Corporate", status: "approved", date: "2024-05-27" },
  { address: "0x2c3d4e...5f6a", name: "Kwame Asante", country: "Ghana", tier: "Retail", status: "pending", date: "2024-05-29" },
  { address: "0x7b6a59...8c9d", name: "Fatima Al-Rashid", country: "Kenya", tier: "Institutional", status: "review", date: "2024-05-26" },
  { address: "0x3e4f50...6172", name: "Lagos Capital Group", country: "Nigeria", tier: "Corporate", status: "approved", date: "2024-05-25" },
];

const AUDIT_LOG = [
  { event: "Property SPV whitelisted", actor: "0x1a2b...4d5e", detail: "Abuja Residences — Token mint authorized", time: "15m ago", severity: "info" },
  { event: "Governance proposal executed", actor: "Governance.sol", detail: "Proposal #4 executed — Treasury diversification", time: "2h ago", severity: "success" },
  { event: "KYC rejection flagged", actor: "Compliance Engine", detail: "Entity 0x7b6a...8c9d flagged for manual review", time: "4h ago", severity: "warning" },
  { event: "Payout batch processed", actor: "TreasuryVault.sol", detail: "₦18.4M distributed to 142 property token holders", time: "6h ago", severity: "info" },
  { event: "Oracle price update", actor: "Chainlink Oracle", detail: "NGN/USD rate updated: 0.000645", time: "8h ago", severity: "info" },
  { event: "Large transfer detected", actor: "Security Monitor", detail: "5.2M OSANV transfer from 0x3e4f...6172", time: "12h ago", severity: "warning" },
  { event: "Smart contract upgrade proposed", actor: "0x9f8e...6c5b", detail: "PropertyNFT.sol v2.1 — Under timelock review", time: "1d ago", severity: "info" },
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

const PENDING_PAYOUTS = [
  { spv: "Ekiti LandBank Phase 1", amount: 3_480_000, beneficiaries: 48, dueDate: "Jun 30" },
  { spv: "Lagos Solar Energy SPV", amount: 8_790_000, beneficiaries: 94, dueDate: "Jun 30" },
  { spv: "Abuja Premium Residences", amount: 19_200_000, beneficiaries: 217, dueDate: "Jul 15" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_approval: { label: "Awaiting Approval", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  pending_review: { label: "Under Review", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
  kyc_required: { label: "KYC Required", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  review: { label: "In Review", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  success: { color: "text-emerald-400", bg: "bg-emerald-400/10" },
  info: { color: "text-sky-400", bg: "bg-sky-400/10" },
  warning: { color: "text-amber-400", bg: "bg-amber-400/10" },
  error: { color: "text-rose-400", bg: "bg-rose-400/10" },
};

const ALERT_CONFIG: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  high: { color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20", icon: AlertTriangle },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", icon: AlertTriangle },
  low: { color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20", icon: Activity },
};

export default function AdminPage() {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Admin Control Center</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Operations Console</h1>
              <p className="text-white/40 text-sm mt-1">
                Property approvals, KYC monitoring, oracle feeds, audit logs, and security.
              </p>
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

        {/* System status bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Contracts Deployed", value: "7 / 7", icon: Hash, color: "text-emerald-400", status: "nominal" },
            { label: "KYC Queue", value: `${KYC_TABLE.filter(k => k.status === "pending" || k.status === "review").length} pending`, icon: Users, color: "text-amber-400", status: "action" },
            { label: "Pending Approvals", value: String(APPROVAL_QUEUE.length), icon: Building2, color: "text-sky-400", status: "action" },
            { label: "Pending Payouts", value: `₦${((PENDING_PAYOUTS.reduce((a, p) => a + p.amount, 0)) / 1_000_000).toFixed(1)}M`, icon: TrendingUp, color: "text-primary", status: "nominal" },
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
                <span className={`h-2 w-2 rounded-full ${status === "nominal" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
              </div>
              <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Property approval queue */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-white/35" />
                <h2 className="font-display font-semibold text-white">Property Approval Queue</h2>
              </div>
              <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5">{APPROVAL_QUEUE.length} pending</span>
            </div>
            <div>
              {APPROVAL_QUEUE.map((item) => {
                const sc = STATUS_CONFIG[item.status];
                return (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <span className="text-xl shrink-0">{item.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white truncate">{item.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-white/30">
                        <span className="font-mono">{item.id}</span>
                        <span>·</span>
                        <span>{item.type}</span>
                        <span>·</span>
                        <span>{item.state}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-white">{formatNgn(item.valueNgn)}</div>
                      <div className="text-[10px] text-white/25">{item.submittedAgo}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="p-1.5 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-rose-400/10 hover:bg-rose-400/20 text-rose-400 transition-colors">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-white/40 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Oracle feeds + Security alerts */}
          <div className="space-y-4">
            {/* Oracle feeds */}
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

            {/* Security alerts */}
            {SECURITY_ALERTS.length > 0 && (
              <div className="bg-card border border-card-border rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <h2 className="font-display text-sm font-semibold text-white">Security Alerts</h2>
                </div>
                <div>
                  {SECURITY_ALERTS.map((alert, i) => {
                    const ac = ALERT_CONFIG[alert.level];
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

        {/* KYC table + Audit log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* KYC monitoring */}
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/35" />
                <h2 className="font-display font-semibold text-white">KYC Monitoring</h2>
              </div>
              <span className="text-xs text-white/30">{KYC_TABLE.length} recent</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Address", "Entity", "Tier", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KYC_TABLE.map((k) => {
                    const sc = STATUS_CONFIG[k.status];
                    return (
                      <tr key={k.address} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-white/50">{k.address}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-white/80 truncate max-w-[100px]">{k.name}</div>
                          <div className="text-[10px] text-white/30">{k.country}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/40">{k.tier}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                            {sc.label}
                          </span>
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
              {AUDIT_LOG.slice(0, 6).map((entry, i) => {
                const sc = SEVERITY_CONFIG[entry.severity];
                return (
                  <div key={i} className="flex items-start gap-3 px-6 py-3.5 border-b border-white/[0.04] last:border-0">
                    <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${sc.bg.replace("bg-", "bg-").replace("/10", "")}`} />
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

        {/* Pending payouts */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-display font-semibold text-white">Pending Payout Approvals</h2>
            <span className="text-xs text-white/30">TreasuryVault.sol — 2-day timelock</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["SPV", "Amount", "Beneficiaries", "Due Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PENDING_PAYOUTS.map((payout) => (
                  <tr key={payout.spv} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-medium text-white">{payout.spv}</td>
                    <td className="px-5 py-4 font-bold text-primary tabular-nums">{formatNgn(payout.amount)}</td>
                    <td className="px-5 py-4 text-white/50">{payout.beneficiaries} wallets</td>
                    <td className="px-5 py-4 text-white/50">{payout.dueDate}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-[11px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </button>
                        <button className="text-[11px] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 border border-white/[0.07] px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-white/20 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <Lock className="h-4 w-4 shrink-0 text-white/15" />
          <span>Admin controls require multi-sig authorization. All approval actions are logged on-chain and subject to the 2-day TreasuryVault.sol timelock. Operator access is role-based via governance.</span>
        </div>
      </div>
    </Layout>
  );
}
