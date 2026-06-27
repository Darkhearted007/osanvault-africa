import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListProperties, useListActivity } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function formatNgn(val: number | string | null | undefined) {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

const ASSET_CLASS = [
  { name: "Residential", value: 38, color: "#0E7C66" },
  { name: "Commercial", value: 31, color: "#D4AF37" },
  { name: "LandBank", value: 18, color: "#34d399" },
  { name: "Mixed", value: 9, color: "#818CF8" },
  { name: "Industrial", value: 4, color: "#60A5FA" },
];

export default function PortfolioScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const { data: propertiesData, isLoading } = useListProperties();
  const { data: activityData } = useListActivity();

  const properties = propertiesData ?? [];
  const activities = (activityData ?? []).filter((a) => a.type === "purchase");
  const liveProps = properties.filter((p) => p.status === "live");
  const totalRaised = properties.reduce((sum, p) => sum + Number(p.raised ?? 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>My Portfolio</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={[styles.connectPrompt, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={[styles.connectIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="link" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.connectTitle, { color: colors.foreground }]}>Connect Wallet to View Holdings</Text>
            <Text style={[styles.connectDesc, { color: colors.mutedForeground }]}>
              Connect a Polygon-compatible wallet to see your property tokens, staking positions, and yield earnings.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Platform Holdings</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.primary }]}>{formatNgn(totalRaised)}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Total Raised</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.gold }]}>{liveProps.length}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Live SPVs</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle2, { color: colors.foreground }]}>Asset Class Breakdown</Text>
          {ASSET_CLASS.map((a) => (
            <View key={a.name} style={styles.assetRow}>
              <View style={[styles.colorDot, { backgroundColor: a.color }]} />
              <Text style={[styles.assetName, { color: colors.foreground }]}>{a.name}</Text>
              <View style={[styles.assetBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.assetFill, { width: `${a.value}%` as any, backgroundColor: a.color }]} />
              </View>
              <Text style={[styles.assetPct, { color: colors.mutedForeground }]}>{a.value}%</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Properties</Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          properties.map((p) => {
            const pct = Math.min(100, Math.round((Number(p.raised ?? 0) / Number(p.targetRaise ?? 1)) * 100));
            return (
              <Pressable
                key={p.id}
                style={({ pressed }) => [
                  styles.propertyRow,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={() => router.push(`/property/${p.id}`)}
              >
                <Text style={styles.propFlag}>{p.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.propName, { color: colors.foreground }]}>{p.name}</Text>
                  <Text style={[styles.propMeta, { color: colors.mutedForeground }]}>
                    {p.location} · {p.yieldApy}% APY · {pct}% raised
                  </Text>
                  <View style={[styles.propBar, { backgroundColor: colors.muted }]}>
                    <View style={[styles.propFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
                  </View>
                </View>
                <View style={[styles.propStatus, {
                  backgroundColor: p.status === "live" ? `${colors.emeraldBright}20` : `${colors.amber}20`,
                }]}>
                  <Text style={[styles.propStatusText, { color: p.status === "live" ? colors.emeraldBright : colors.amber }]}>
                    {p.status}
                  </Text>
                </View>
              </Pressable>
            );
          })
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
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16, gap: 14 },
  connectPrompt: { borderRadius: 14, borderWidth: 1.5, padding: 16, flexDirection: "row", gap: 12, alignItems: "center" },
  connectIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  connectTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  connectDesc: { fontSize: 12, lineHeight: 18, marginTop: 4, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  kpiVal: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 11, marginTop: 4, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  sectionTitle2: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  assetRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  assetName: { fontSize: 13, fontFamily: "Inter_400Regular", width: 90 },
  assetBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  assetFill: { height: "100%", borderRadius: 3 },
  assetPct: { fontSize: 12, fontFamily: "Inter_500Medium", width: 32, textAlign: "right" },
  propertyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  propFlag: { fontSize: 24 },
  propName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  propMeta: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  propBar: { height: 4, borderRadius: 2, overflow: "hidden", marginTop: 6 },
  propFill: { height: "100%", borderRadius: 2 },
  propStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  propStatusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
