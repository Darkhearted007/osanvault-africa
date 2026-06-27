import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetPlatformStats, useListActivity, useListProperties } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const TVL_HISTORY = [
  { month: "Dec", val: 2.8 },
  { month: "Jan", val: 3.4 },
  { month: "Feb", val: 4.2 },
  { month: "Mar", val: 4.9 },
  { month: "Apr", val: 6.1 },
  { month: "May", val: 7.4 },
  { month: "Jun", val: 9.2 },
];

function formatNgn(val: number | string | null | undefined) {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

function formatActivityAmount(type: string, amount: string, amountNgn?: number | null): string {
  if (amountNgn && amountNgn > 0) return formatNgn(amountNgn);
  if (amount.length > 15) {
    const intPart = amount.length > 18 ? amount.slice(0, amount.length - 18) : "0";
    const n = Number(intPart);
    const fmt =
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K`
      : n.toFixed(0);
    const unit = type === "staked" || type === "unstaked" ? " OSANV" : type === "retired" ? " tCO₂e" : "";
    return `${fmt}${unit}`;
  }
  const n = Number(amount);
  return isNaN(n) ? amount : `${n.toLocaleString()} tokens`;
}

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
  purchase: { icon: "shopping-bag", color: "#0E7C66" },
  staked: { icon: "lock", color: "#D4AF37" },
  unstaked: { icon: "unlock", color: "#F59E0B" },
  vote: { icon: "check-square", color: "#60A5FA" },
  retired: { icon: "wind", color: "#34d399" },
  proposal: { icon: "file-text", color: "#818CF8" },
};

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: stats } = useGetPlatformStats();
  const { data: activityData, isLoading: actLoading } = useListActivity();
  const { data: propsData } = useListProperties();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 100;

  const activities = activityData ?? [];
  const properties = propsData ?? [];
  const maxVal = Math.max(...TVL_HISTORY.map((d) => d.val));

  const GEO_DATA = [
    { country: "Nigeria", pct: 81, color: colors.primary },
    { country: "Kenya", pct: 10, color: colors.gold },
    { country: "Ghana", pct: 6, color: colors.emeraldBright },
    { country: "Other", pct: 3, color: colors.violet },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Portfolio</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Platform Overview</Text>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="trending-up" size={16} color={colors.primary} />
          <Text style={[styles.kpiVal, { color: colors.foreground }]}>
            {stats?.tvlNgn ? formatNgn(Number(stats.tvlNgn)) : "₦9.2B"}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>TVL</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="users" size={16} color={colors.gold} />
          <Text style={[styles.kpiVal, { color: colors.foreground }]}>{stats?.totalHolders ?? "1,247"}</Text>
          <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Holders</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="wind" size={16} color={colors.emeraldBright} />
          <Text style={[styles.kpiVal, { color: colors.foreground }]}>
            {stats?.carbonRetired ?? "2,840"} tCO₂e
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Carbon Retired</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>TVL Growth</Text>
        <View style={styles.miniChart}>
          {TVL_HISTORY.map((d, i) => (
            <View key={d.month} style={styles.chartCol}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.round((d.val / maxVal) * 100)}%` as any,
                      backgroundColor: i === TVL_HISTORY.length - 1 ? colors.primary : colors.muted,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>{d.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <Text style={[styles.chartLegendText, { color: colors.mutedForeground }]}>Dec 2024 – Jun 2025</Text>
          <Text style={[styles.chartCurrentVal, { color: colors.primary }]}>₦9.2B</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Geographic Allocation</Text>
        {GEO_DATA.map((g) => (
          <View key={g.country} style={styles.geoRow}>
            <Text style={[styles.geoLabel, { color: colors.foreground }]}>{g.country}</Text>
            <View style={[styles.geoBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.geoFill, { width: `${g.pct}%` as any, backgroundColor: g.color }]} />
            </View>
            <Text style={[styles.geoPct, { color: colors.mutedForeground }]}>{g.pct}%</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Properties by Status</Text>
        <View style={styles.propStatusRow}>
          {[
            { label: "Live", status: "live", color: colors.emeraldBright },
            { label: "Funding", status: "funding", color: colors.amber },
            { label: "Closed", status: "closed", color: colors.mutedForeground },
          ].map(({ label, status, color }) => {
            const count = properties.filter((p) => p.status === status).length;
            return (
              <View key={label} style={styles.propStatusCard}>
                <Text style={[styles.propStatusCount, { color }]}>{count}</Text>
                <Text style={[styles.propStatusLabel, { color: colors.mutedForeground }]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
        {actLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : activities.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
        ) : (
          activities.slice(0, 8).map((event, idx) => {
            const iconData = ACTIVITY_ICONS[event.type] ?? { icon: "activity", color: colors.mutedForeground };
            return (
              <View
                key={event.id ?? idx}
                style={[styles.activityRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <View style={[styles.activityIcon, { backgroundColor: `${iconData.color}20` }]}>
                  <Feather name={iconData.icon as any} size={14} color={iconData.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityType, { color: colors.foreground }]}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Text>
                  {event.wallet && (
                    <Text style={[styles.activityWallet, { color: colors.mutedForeground }]}>
                      {event.wallet.slice(0, 6)}...{event.wallet.slice(-4)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.activityAmount, { color: iconData.color }]}>
                  {formatActivityAmount(event.type, String(event.amount ?? "0"), event.amountNgn)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, marginTop: 2, fontFamily: "Inter_400Regular" },
  kpiRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  kpiVal: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  kpiLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  miniChart: { height: 100, flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 8 },
  chartCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barWrapper: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%" },
  chartLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  chartLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  chartLegendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartCurrentVal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  geoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  geoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", width: 60 },
  geoBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  geoFill: { height: "100%", borderRadius: 3 },
  geoPct: { fontSize: 12, fontFamily: "Inter_500Medium", width: 32, textAlign: "right" },
  propStatusRow: { flexDirection: "row", gap: 16 },
  propStatusCard: { alignItems: "center", flex: 1 },
  propStatusCount: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  propStatusLabel: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  activityIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  activityContent: { flex: 1 },
  activityType: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  activityWallet: { fontSize: 11, marginTop: 2, fontFamily: "Inter_400Regular" },
  activityAmount: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular", paddingVertical: 20 },
});
