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

const ROADMAP = [
  {
    phase: "Phase 1", title: "Foundation", status: "completed",
    items: ["Smart contract development & audits", "6 real estate SPVs onboarded", "SEC ARIP Sandbox registration", "Polygon Amoy testnet deployment"],
  },
  {
    phase: "Phase 2", title: "Token Launch", status: "active",
    items: ["OSANV ERC-20 deployment on Polygon", "StakingVault.sol mainnet launch", "Governance portal activation", "LandRegistry.sol integration"],
  },
  {
    phase: "Phase 3", title: "Scale", status: "upcoming",
    items: ["10+ new African property SPVs", "Secondary market for property tokens", "Institutional LP onboarding", "KYC/AML integration"],
  },
  {
    phase: "Phase 4", title: "Expansion", status: "upcoming",
    items: ["Pan-African REIT tokenization", "Arbitrum multi-chain deployment", "Carbon credit exchange", "Sovereign infrastructure bonds"],
  },
];

const SECURITY = [
  { label: "Smart Contract Audits", desc: "All 8 contracts independently audited before mainnet", icon: "shield" },
  { label: "2-Day Timelock", desc: "TreasuryVault.sol enforces minimum 2-day delay on outflows", icon: "clock" },
  { label: "Multi-Sig Admin", desc: "3-of-5 multi-signature required for admin functions", icon: "key" },
  { label: "SEC ARIP Sandbox", desc: "SEC Nigeria Alternative Investment Regulatory Initiative approval", icon: "file-text" },
  { label: "Dual Land Verification", desc: "Government title hash + indigenous authority approval on-chain", icon: "map-pin" },
];

const statusColor = (s: string, colors: ReturnType<typeof useColors>) => {
  if (s === "completed") return colors.emeraldBright;
  if (s === "active") return colors.primary;
  return colors.mutedForeground;
};

export default function AboutScreen() {
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
        <Text style={[styles.title, { color: colors.foreground }]}>About OsanVault</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.missionEyebrow, { color: colors.primary }]}>OUR MISSION</Text>
          <Text style={[styles.missionTitle, { color: colors.foreground }]}>
            Building Africa's Real Estate Infrastructure Layer
          </Text>
          <Text style={[styles.missionDesc, { color: colors.mutedForeground }]}>
            ÒsánVault democratizes access to premium African real estate through blockchain tokenization — enabling fractional ownership, transparent governance, and sustainable carbon accountability.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Roadmap</Text>
        {ROADMAP.map((phase, i) => (
          <View key={phase.phase} style={[styles.phaseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.phaseHeader}>
              <View>
                <Text style={[styles.phaseLabel, { color: colors.mutedForeground }]}>{phase.phase}</Text>
                <Text style={[styles.phaseTitle, { color: colors.foreground }]}>{phase.title}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor(phase.status, colors)}20` }]}>
                <Text style={[styles.statusText, { color: statusColor(phase.status, colors) }]}>
                  {phase.status === "completed" ? "DONE" : phase.status === "active" ? "ACTIVE" : "UPCOMING"}
                </Text>
              </View>
            </View>
            {phase.items.map((item) => (
              <View key={item} style={styles.phaseItem}>
                <Feather
                  name={phase.status === "completed" ? "check-circle" : phase.status === "active" ? "circle" : "clock"}
                  size={14}
                  color={statusColor(phase.status, colors)}
                />
                <Text style={[styles.phaseItemText, { color: phase.status === "upcoming" ? colors.mutedForeground : colors.foreground }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security & Compliance</Text>
        {SECURITY.map((s) => (
          <View key={s.label} style={[styles.securityRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.securityIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name={s.icon as any} size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityLabel, { color: colors.foreground }]}>{s.label}</Text>
              <Text style={[styles.securityDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.networkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>Technical Stack</Text>
          <View style={styles.techGrid}>
            {[
              { label: "Blockchain", value: "Polygon" },
              { label: "Token Std.", value: "ERC-1155" },
              { label: "Gov Token", value: "OSANV (ERC-20)" },
              { label: "Regulation", value: "SEC ARIP Sandbox" },
              { label: "Carbon", value: "Verra VCS" },
              { label: "Smart Contracts", value: "8 contracts" },
            ].map((t) => (
              <View key={t.label} style={styles.techItem}>
                <Text style={[styles.techLabel, { color: colors.mutedForeground }]}>{t.label}</Text>
                <Text style={[styles.techValue, { color: colors.foreground }]}>{t.value}</Text>
              </View>
            ))}
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
  missionCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    gap: 8,
  },
  missionEyebrow: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 1 },
  missionTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", lineHeight: 28 },
  missionDesc: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  phaseCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  phaseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  phaseLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  phaseTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  phaseItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  phaseItemText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  securityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  securityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  securityLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  securityDesc: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  networkCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  techGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  techItem: { width: "47%" },
  techLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  techValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 2 },
});
