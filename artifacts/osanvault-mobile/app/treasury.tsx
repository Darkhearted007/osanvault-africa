import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const TREASURY_RESERVES = [
  { asset: "Stable Reserves", pct: 48, color: "#0E7C66" },
  { asset: "Property Collateral", pct: 24, color: "#D4AF37" },
  { asset: "OSANV Token", pct: 16, color: "#818CF8" },
  { asset: "Carbon Credits", pct: 8, color: "#34d399" },
  { asset: "Operational", pct: 4, color: "#FB923C" },
];

const TOTAL_TREASURY_NGN = 5_000_000_000;

const FEE_DISTRIBUTION = [
  { label: "Staking Rewards", pct: 40, color: "#D4AF37", desc: "Distributed to OSANV stakers" },
  { label: "Treasury Reserve", pct: 30, color: "#0E7C66", desc: "Long-term protocol reserve" },
  { label: "Token Burn", pct: 20, color: "#FB7185", desc: "Reduces circulating OSANV supply" },
  { label: "Operations", pct: 10, color: "#818CF8", desc: "Team, audits, infrastructure" },
];

const REVENUE_HISTORY = [
  { month: "Jan", fees: 18, staking: 12 },
  { month: "Feb", fees: 22, staking: 14 },
  { month: "Mar", fees: 19, staking: 13 },
  { month: "Apr", fees: 28, staking: 18 },
  { month: "May", fees: 32, staking: 21 },
  { month: "Jun", fees: 41, staking: 26 },
];

const maxRevenue = Math.max(...REVENUE_HISTORY.map((d) => d.fees + d.staking));

function formatNgn(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  return `₦${n.toLocaleString()}`;
}

export default function TreasuryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Treasury Vault</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>
        <View style={styles.heroCard}>
          <View style={[styles.heroInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>Total Treasury Reserves</Text>
            <Text style={[styles.heroVal, { color: colors.gold }]}>{formatNgn(TOTAL_TREASURY_NGN)}</Text>
            <View style={[styles.timelockBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Feather name="lock" size={12} color={colors.primary} />
              <Text style={[styles.timelockText, { color: colors.primary }]}>2-Day Timelock · 3-of-5 Multi-Sig</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reserve Allocation</Text>
          {TREASURY_RESERVES.map((r) => (
            <View key={r.asset} style={styles.reserveRow}>
              <View style={[styles.colorDot, { backgroundColor: r.color }]} />
              <Text style={[styles.reserveAsset, { color: colors.foreground }]}>{r.asset}</Text>
              <View style={[styles.reserveBar, { backgroundColor: colors.muted }]}>
                <View
                  style={[styles.reserveFill, { width: `${r.pct}%` as any, backgroundColor: r.color }]}
                />
              </View>
              <Text style={[styles.reservePct, { color: colors.mutedForeground }]}>{r.pct}%</Text>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Fee Distribution</Text>
          <View style={[styles.feeGrid, { gap: 10 }]}>
            {FEE_DISTRIBUTION.map((f) => (
              <View key={f.label} style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.feeHeader}>
                  <View style={[styles.feeDot, { backgroundColor: f.color }]} />
                  <Text style={[styles.feeLabel, { color: colors.foreground }]}>{f.label}</Text>
                  <Text style={[styles.feePct, { color: f.color }]}>{f.pct}%</Text>
                </View>
                <Text style={[styles.feeDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Monthly Revenue</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.chart}>
              {REVENUE_HISTORY.map((d, i) => {
                const total = d.fees + d.staking;
                const h = Math.round((total / maxRevenue) * 100);
                return (
                  <View key={d.month} style={styles.chartCol}>
                    <View style={styles.chartBarWrap}>
                      <View style={[styles.chartBar, { height: `${h}%` as any, backgroundColor: i === REVENUE_HISTORY.length - 1 ? colors.gold : colors.primary }]} />
                    </View>
                    <Text style={[styles.chartMonthLabel, { color: colors.mutedForeground }]}>{d.month}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <Text style={[styles.chartLegendText, { color: colors.mutedForeground }]}>Jan – Jun 2025</Text>
              <Text style={[styles.chartCurrentVal, { color: colors.gold }]}>₦67M Jun revenue</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Feather name="shield" size={14} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Protocol treasury is governed by a 3-of-5 multi-signature with a mandatory 2-day timelock on all outflows. No single party can access funds unilaterally.
              </Text>
            </View>
          </View>
        </View>
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
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroCard: { paddingHorizontal: 16, paddingBottom: 16 },
  heroInner: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", gap: 8 },
  heroLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  heroVal: { fontSize: 36, fontWeight: "700", fontFamily: "Inter_700Bold" },
  timelockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timelockText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  content: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  reserveRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  reserveAsset: { fontSize: 13, fontFamily: "Inter_400Regular", width: 130 },
  reserveBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  reserveFill: { height: "100%", borderRadius: 3 },
  reservePct: { fontSize: 12, fontFamily: "Inter_500Medium", width: 32, textAlign: "right" },
  feeGrid: { flexDirection: "column" },
  feeCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  feeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  feeDot: { width: 10, height: 10, borderRadius: 5 },
  feeLabel: { flex: 1, fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  feePct: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  feeDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  chart: { height: 100, flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 8 },
  chartCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  chartBarWrap: { flex: 1, width: "100%", justifyContent: "flex-end" },
  chartBar: { width: "100%", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  chartMonthLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  chartLegend: { flexDirection: "row", justifyContent: "space-between" },
  chartLegendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartCurrentVal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular", flex: 1 },
});
