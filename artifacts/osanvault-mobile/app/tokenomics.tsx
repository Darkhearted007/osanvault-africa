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

const TOKEN_ALLOCATION = [
  { name: "Ecosystem & Rewards", pct: 35, color: "#0E7C66", desc: "Staking rewards, liquidity mining, yield" },
  { name: "Treasury Reserve", pct: 20, color: "#D4AF37", desc: "Protocol-owned reserves, managed by DAO" },
  { name: "Team & Advisors", pct: 15, color: "#818CF8", desc: "4-year vesting, 1-year cliff" },
  { name: "Private Sale", pct: 12, color: "#FB923C", desc: "Institutional investors, 18-month vesting" },
  { name: "Public Sale", pct: 8, color: "#34d399", desc: "Community token sale, no lockup" },
  { name: "Liquidity", pct: 6, color: "#F472B6", desc: "DEX liquidity provision" },
  { name: "Partnerships", pct: 4, color: "#60A5FA", desc: "Strategic integrations" },
];

const STAKING_TIERS_DATA = [
  { tier: "Bronze", lock: "30 days", apr: "8%", min: "50K", color: "#B45309" },
  { tier: "Silver", lock: "90 days", apr: "12%", min: "100K", color: "#94A3B8" },
  { tier: "Gold", lock: "180 days", apr: "18%", min: "200K", color: "#D97706" },
  { tier: "Platinum", lock: "365 days", apr: "22%", min: "500K", color: "#7C3AED" },
];

const USE_CASES = [
  { icon: "check-square", title: "Governance Voting", desc: "1 OSANV = 1 vote. 100K to propose, 5M OSANV quorum, 7-day voting window." },
  { icon: "lock", title: "Staking Rewards", desc: "Lock OSANV for 30–365 days to earn 8–22% APR from protocol fee distributions." },
  { icon: "shield", title: "Platform Access", desc: "Higher holdings unlock premium features and early property SPV allocation." },
  { icon: "zap", title: "Deflationary Burn", desc: "20% of all platform fees automatically burn OSANV permanently." },
];

export default function TokenomicsScreen() {
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
        <Text style={[styles.title, { color: colors.foreground }]}>OSANV Tokenomics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.keyMetrics}>
          {[
            { label: "Total Supply", value: "1B OSANV", color: colors.primary },
            { label: "Price", value: "$0.042", color: colors.gold },
            { label: "Market Cap", value: "$42M", color: colors.blue },
            { label: "Staked", value: "42.5M", color: colors.violet },
          ].map(({ label, value, color }) => (
            <View key={label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.kpiVal, { color }]}>{value}</Text>
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Token Allocation</Text>
          {TOKEN_ALLOCATION.map((t) => (
            <View key={t.name} style={styles.allocationRow}>
              <View style={[styles.colorDot, { backgroundColor: t.color }]} />
              <View style={styles.allocationContent}>
                <View style={styles.allocationHeader}>
                  <Text style={[styles.allocationName, { color: colors.foreground }]}>{t.name}</Text>
                  <Text style={[styles.allocationPct, { color: t.color }]}>{t.pct}%</Text>
                </View>
                <View style={[styles.allocationBar, { backgroundColor: colors.muted }]}>
                  <View
                    style={[styles.allocationFill, { width: `${t.pct * 2.8}%` as any, backgroundColor: t.color }]}
                  />
                </View>
                <Text style={[styles.allocationDesc, { color: colors.mutedForeground }]}>{t.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.standaloneSectionTitle, { color: colors.foreground }]}>Staking Tiers</Text>
        <View style={styles.tiersGrid}>
          {STAKING_TIERS_DATA.map((t) => (
            <View key={t.tier} style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.tierName, { color: t.color }]}>{t.tier}</Text>
              <Text style={[styles.tierApr, { color: t.color }]}>{t.apr}</Text>
              <Text style={[styles.tierAprLabel, { color: colors.mutedForeground }]}>APR</Text>
              <View style={styles.tierDetails}>
                <Text style={[styles.tierDetail, { color: colors.mutedForeground }]}>Lock: {t.lock}</Text>
                <Text style={[styles.tierDetail, { color: colors.mutedForeground }]}>Min: {t.min} OSANV</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.standaloneSectionTitle, { color: colors.foreground }]}>Token Utility</Text>
        {USE_CASES.map((u) => (
          <View key={u.title} style={[styles.useCaseRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.useCaseIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name={u.icon as any} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.useCaseTitle, { color: colors.foreground }]}>{u.title}</Text>
              <Text style={[styles.useCaseDesc, { color: colors.mutedForeground }]}>{u.desc}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.burnCard, { backgroundColor: `${colors.rose}15`, borderColor: `${colors.rose}30` }]}>
          <Feather name="zap" size={20} color={colors.rose} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.burnTitle, { color: colors.foreground }]}>Deflationary Mechanism</Text>
            <Text style={[styles.burnDesc, { color: colors.mutedForeground }]}>
              20% of all protocol fees are automatically used to buy and burn OSANV, permanently reducing circulating supply and creating deflationary pressure.
            </Text>
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
  content: { paddingHorizontal: 16, gap: 14 },
  keyMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiCard: { width: "47%", padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  kpiVal: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 11, marginTop: 4, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  standaloneSectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  allocationRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  allocationContent: { flex: 1, gap: 4 },
  allocationHeader: { flexDirection: "row", justifyContent: "space-between" },
  allocationName: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  allocationPct: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  allocationBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  allocationFill: { height: "100%", borderRadius: 2 },
  allocationDesc: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tiersGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tierCard: { width: "47%", borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  tierName: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tierApr: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  tierAprLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tierDetails: { alignItems: "center", marginTop: 8, gap: 2 },
  tierDetail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  useCaseRow: { flexDirection: "row", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "flex-start" },
  useCaseIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  useCaseTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  useCaseDesc: { fontSize: 12, lineHeight: 18, marginTop: 3, fontFamily: "Inter_400Regular" },
  burnCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
  },
  burnTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  burnDesc: { fontSize: 12, lineHeight: 18, marginTop: 3, fontFamily: "Inter_400Regular" },
});
