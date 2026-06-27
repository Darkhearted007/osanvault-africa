import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

type ApprovalStatus = "pending_approval" | "pending_review" | "kyc_required" | "approved" | "rejected";

const APPROVAL_QUEUE = [
  { id: "SPV-2024-009", name: "Kano Industrial Park Phase 1", type: "LandBank", state: "Kano, Nigeria", flag: "🇳🇬", valueNgn: 2_800_000_000, tokens: 2_800_000, yield: "11.4%", status: "pending_approval" as ApprovalStatus },
  { id: "SPV-2024-010", name: "Port Harcourt Maritime Hub", type: "Commercial", state: "Rivers, Nigeria", flag: "🇳🇬", valueNgn: 3_500_000_000, tokens: 3_500_000, yield: "13.2%", status: "pending_review" as ApprovalStatus },
  { id: "SPV-2024-011", name: "Kampala Commercial Park", type: "Commercial", state: "Uganda", flag: "🇺🇬", valueNgn: 1_200_000_000, tokens: 1_200_000, yield: "9.8%", status: "kyc_required" as ApprovalStatus },
];

const STATUS_CFG: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  pending_approval: { label: "Awaiting Approval", color: "#F59E0B", bg: "#F59E0B15" },
  pending_review:   { label: "Under Review",      color: "#38BDF8", bg: "#38BDF815" },
  kyc_required:     { label: "KYC Required",      color: "#FB923C", bg: "#FB923C15" },
  approved:         { label: "Approved",           color: "#34d399", bg: "#34d39915" },
  rejected:         { label: "Rejected",           color: "#FB7185", bg: "#FB718515" },
};

const KYC_LIST = [
  { address: "0x1a2b3c...4d5e", name: "Emmanuel Adeyemi", country: "Nigeria", tier: "Institutional", status: "approved" },
  { address: "0x9f8e7d...6c5b", name: "Amara Holdings Ltd.", country: "Ghana", tier: "Corporate", status: "approved" },
  { address: "0x2c3d4e...5f6a", name: "Kwame Asante", country: "Ghana", tier: "Retail", status: "pending" },
  { address: "0x7b6a59...8c9d", name: "Fatima Al-Rashid", country: "Kenya", tier: "Institutional", status: "review" },
  { address: "0x3e4f50...6172", name: "Lagos Capital Group", country: "Nigeria", tier: "Corporate", status: "approved" },
];

const KYC_CFG: Record<string, { color: string; bg: string }> = {
  approved: { color: "#34d399", bg: "#34d39915" },
  pending:  { color: "#F59E0B", bg: "#F59E0B15" },
  review:   { color: "#38BDF8", bg: "#38BDF815" },
  rejected: { color: "#FB7185", bg: "#FB718515" },
};

const ORACLE_FEEDS = [
  { name: "NGN / USD", value: "0.000645", delta: "+0.002%", status: "live", updated: "2m ago" },
  { name: "MATIC / USD", value: "$0.712", delta: "-0.8%", status: "live", updated: "2m ago" },
  { name: "OSANV / NGN", value: "₦48.20", delta: "+1.2%", status: "live", updated: "5m ago" },
  { name: "tCO₂e / USD", value: "$14.80", delta: "+0.5%", status: "live", updated: "8m ago" },
];

const AUDIT_LOG = [
  { event: "Property SPV whitelisted", actor: "0x1a2b...4d5e", time: "15m ago", severity: "info" },
  { event: "Governance proposal executed", actor: "Governance.sol", time: "2h ago", severity: "success" },
  { event: "KYC rejection flagged", actor: "Compliance Engine", time: "4h ago", severity: "warning" },
  { event: "Payout batch processed", actor: "TreasuryVault.sol", time: "6h ago", severity: "info" },
  { event: "Large transfer detected", actor: "Security Monitor", time: "12h ago", severity: "warning" },
];

const SECURITY_ALERTS = [
  { level: "medium", title: "Unusual staking activity", detail: "3 wallets staked >10M OSANV within 1h", time: "2h ago" },
  { level: "low", title: "KYC review queue threshold", detail: "5+ applications pending >48h", time: "6h ago" },
];

type Tab = "queue" | "kyc" | "oracle" | "audit";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "queue", label: "Queue", icon: "list" },
  { id: "kyc", label: "KYC", icon: "users" },
  { id: "oracle", label: "Oracle", icon: "radio" },
  { id: "audit", label: "Audit", icon: "activity" },
];

function formatNgn(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  return `₦${n.toLocaleString()}`;
}

export default function AdminScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;
  const [activeTab, setActiveTab] = useState<Tab>("queue");

  function handleAction(action: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Admin Action", `${action} — admin actions require multi-sig confirmation on mainnet.`, [{ text: "OK" }]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Admin Panel</Text>
        <View style={[styles.adminBadge, { backgroundColor: `${colors.rose}20` }]}>
          <Text style={[styles.adminBadgeText, { color: colors.rose }]}>Ops Only</Text>
        </View>
      </View>

      {SECURITY_ALERTS.length > 0 && (
        <View style={[styles.alertBanner, { backgroundColor: `${colors.amber}15`, borderColor: `${colors.amber}30` }]}>
          <Feather name="alert-triangle" size={14} color={colors.amber} />
          <Text style={[styles.alertText, { color: colors.amber }]}>
            {SECURITY_ALERTS.length} active security alert{SECURITY_ALERTS.length > 1 ? "s" : ""} — view Audit tab
          </Text>
        </View>
      )}

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.tab, activeTab === t.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(t.id)}
          >
            <Feather name={t.icon as any} size={14} color={activeTab === t.id ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === t.id ? colors.primary : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        {activeTab === "queue" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>SPV Approval Queue ({APPROVAL_QUEUE.length})</Text>
            {APPROVAL_QUEUE.map((item) => {
              const cfg = STATUS_CFG[item.status];
              return (
                <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.itemFlag}>{item.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.id} · {item.type} · {item.state}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                      <Text style={[styles.metricVal, { color: colors.gold }]}>{formatNgn(item.valueNgn)}</Text>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Valuation</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={[styles.metricVal, { color: colors.foreground }]}>{item.tokens.toLocaleString()}</Text>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Tokens</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={[styles.metricVal, { color: colors.primary }]}>{item.yield}</Text>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Yield</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <Pressable style={[styles.actionBtn, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}30` }]} onPress={() => handleAction(`Approve ${item.id}`)}>
                      <Feather name="check" size={13} color={colors.primary} />
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Approve</Text>
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: `${colors.rose}15`, borderColor: `${colors.rose}30` }]} onPress={() => handleAction(`Reject ${item.id}`)}>
                      <Feather name="x" size={13} color={colors.rose} />
                      <Text style={[styles.actionBtnText, { color: colors.rose }]}>Reject</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {activeTab === "kyc" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>KYC / Whitelist Status</Text>
            {KYC_LIST.map((k) => {
              const cfg = KYC_CFG[k.status] ?? KYC_CFG.pending;
              return (
                <View key={k.address} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.kycRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.kycName, { color: colors.foreground }]}>{k.name}</Text>
                      <Text style={[styles.kycAddr, { color: colors.mutedForeground }]}>{k.address}</Text>
                      <Text style={[styles.kycCountry, { color: colors.mutedForeground }]}>{k.country} · {k.tier}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusText, { color: cfg.color }]}>{k.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {activeTab === "oracle" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Oracle Price Feeds</Text>
            {ORACLE_FEEDS.map((f) => (
              <View key={f.name} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.oracleRow}>
                  <View>
                    <Text style={[styles.oracleName, { color: colors.foreground }]}>{f.name}</Text>
                    <Text style={[styles.oracleUpdated, { color: colors.mutedForeground }]}>Updated {f.updated}</Text>
                  </View>
                  <View style={styles.oracleRight}>
                    <Text style={[styles.oracleVal, { color: colors.foreground }]}>{f.value}</Text>
                    <Text style={[styles.oracleDelta, { color: f.delta.startsWith("+") ? colors.primary : colors.rose }]}>{f.delta}</Text>
                  </View>
                  <View style={[styles.liveBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.liveText, { color: colors.primary }]}>LIVE</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "audit" && (
          <>
            {SECURITY_ALERTS.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security Alerts</Text>
                {SECURITY_ALERTS.map((a, i) => (
                  <View key={i} style={[styles.card, { backgroundColor: `${colors.amber}10`, borderColor: `${colors.amber}30` }]}>
                    <View style={styles.alertRow}>
                      <Feather name="alert-triangle" size={16} color={colors.amber} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.alertTitle, { color: colors.foreground }]}>{a.title}</Text>
                        <Text style={[styles.alertDetail, { color: colors.mutedForeground }]}>{a.detail}</Text>
                        <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>{a.time}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Audit Log</Text>
            {AUDIT_LOG.map((e, i) => {
              const severityColor = e.severity === "success" ? colors.primary : e.severity === "warning" ? colors.amber : colors.mutedForeground;
              return (
                <View key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.auditRow}>
                    <View style={[styles.auditDot, { backgroundColor: severityColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.auditEvent, { color: colors.foreground }]}>{e.event}</Text>
                      <Text style={[styles.auditActor, { color: colors.mutedForeground }]}>{e.actor}</Text>
                    </View>
                    <Text style={[styles.auditTime, { color: colors.mutedForeground }]}>{e.time}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adminBadgeText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  alertText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 4 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemFlag: { fontSize: 24 },
  itemName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  itemMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  metricsRow: { flexDirection: "row", gap: 24 },
  metric: {},
  metricVal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 8, borderWidth: 1, paddingVertical: 8 },
  actionBtnText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kycRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  kycName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kycAddr: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  kycCountry: { fontSize: 11, fontFamily: "Inter_400Regular" },
  oracleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  oracleName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  oracleUpdated: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  oracleRight: { flex: 1, alignItems: "flex-end" },
  oracleVal: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  oracleDelta: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  alertRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  alertTitle: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  alertDetail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  alertTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  auditRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  auditDot: { width: 8, height: 8, borderRadius: 4 },
  auditEvent: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  auditActor: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  auditTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
