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

const STATE_PARTNERS = [
  {
    name: "Lagos State",
    flag: "🇳🇬",
    status: "active",
    since: "Jan 2024",
    ministry: "Ministry of Urban Development",
    parcels: 2,
    investmentNgn: 6_000_000_000,
    carbonTonnes: 49800,
    spvs: ["Lagos Solar Energy SPV", "Victoria Island Tower"],
    contact: "LASG Investment Commission",
  },
  {
    name: "Ekiti State",
    flag: "🇳🇬",
    status: "active",
    since: "Jan 2024",
    ministry: "Ministry of Lands & Housing",
    parcels: 3,
    investmentNgn: 400_000_000,
    carbonTonnes: 2400,
    spvs: ["Ekiti LandBank Phase 1", "Ekiti South Extension"],
    contact: "Ekiti State Development Agency",
  },
  {
    name: "FCT Abuja",
    flag: "🇳🇬",
    status: "active",
    since: "Feb 2024",
    ministry: "FCT Area Council Authority",
    parcels: 1,
    investmentNgn: 2_200_000_000,
    carbonTonnes: 860,
    spvs: ["Abuja Premium Residences"],
    contact: "FCT Investment & Promotions Council",
  },
  {
    name: "Oyo State",
    flag: "🇳🇬",
    status: "pipeline",
    since: "Q3 2024",
    ministry: "Ministry of Lands, Housing & Survey",
    parcels: 0,
    investmentNgn: 0,
    carbonTonnes: 0,
    spvs: [],
    contact: "Oyo State Investment Agency",
  },
  {
    name: "Enugu State",
    flag: "🇳🇬",
    status: "pipeline",
    since: "Q4 2024",
    ministry: "Ministry of Housing & Urban Dev.",
    parcels: 0,
    investmentNgn: 0,
    carbonTonnes: 0,
    spvs: [],
    contact: "Enugu SIGA",
  },
];

const INTL_PARTNERS = [
  { name: "Nairobi City County", flag: "🇰🇪", status: "MOU signed", role: "Land bank partnership" },
  { name: "Kumasi Metropolitan", flag: "🇬🇭", status: "Pilot", role: "Mixed-use tokenization" },
  { name: "Cape Town Metro", flag: "🇿🇦", status: "Pipeline", role: "Green real estate SPVs" },
];

function formatNgn(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}M`;
  return n > 0 ? `₦${n.toLocaleString()}` : "—";
}

export default function GovernmentScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const activeCount = STATE_PARTNERS.filter((p) => p.status === "active").length;
  const totalInvestment = STATE_PARTNERS.reduce((s, p) => s + p.investmentNgn, 0);
  const totalCarbon = STATE_PARTNERS.reduce((s, p) => s + p.carbonTonnes, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Government Partners</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.primary }]}>{activeCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Active States</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.gold }]}>{formatNgn(totalInvestment)}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Total Investment</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.emeraldBright }]}>{(totalCarbon / 1000).toFixed(0)}K</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>tCO₂ Tracked</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nigerian State Partners</Text>
        {STATE_PARTNERS.map((partner) => (
          <View key={partner.name} style={[styles.partnerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.partnerHeader}>
              <Text style={styles.partnerFlag}>{partner.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.partnerName, { color: colors.foreground }]}>{partner.name}</Text>
                <Text style={[styles.partnerMinistry, { color: colors.mutedForeground }]}>{partner.ministry}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: partner.status === "active" ? `${colors.primary}20` : `${colors.amber}15` },
              ]}>
                <Text style={[styles.statusText, { color: partner.status === "active" ? colors.primary : colors.amber }]}>
                  {partner.status === "active" ? "Active" : "Pipeline"}
                </Text>
              </View>
            </View>

            {partner.status === "active" && (
              <View style={styles.partnerMetrics}>
                <View style={styles.partnerMetric}>
                  <Text style={[styles.partnerMetricVal, { color: colors.gold }]}>{formatNgn(partner.investmentNgn)}</Text>
                  <Text style={[styles.partnerMetricLabel, { color: colors.mutedForeground }]}>Investment</Text>
                </View>
                <View style={styles.partnerMetric}>
                  <Text style={[styles.partnerMetricVal, { color: colors.foreground }]}>{partner.parcels}</Text>
                  <Text style={[styles.partnerMetricLabel, { color: colors.mutedForeground }]}>Parcels</Text>
                </View>
                <View style={styles.partnerMetric}>
                  <Text style={[styles.partnerMetricVal, { color: colors.emeraldBright }]}>{partner.carbonTonnes.toLocaleString()}</Text>
                  <Text style={[styles.partnerMetricLabel, { color: colors.mutedForeground }]}>tCO₂</Text>
                </View>
              </View>
            )}

            {partner.spvs.length > 0 && (
              <View style={styles.spvList}>
                {partner.spvs.map((spv) => (
                  <View key={spv} style={[styles.spvChip, { backgroundColor: `${colors.primary}15` }]}>
                    <Feather name="building" size={10} color={colors.primary} />
                    <Text style={[styles.spvText, { color: colors.primary }]}>{spv}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.contactRow}>
              <Feather name="users" size={12} color={colors.mutedForeground} />
              <Text style={[styles.contactText, { color: colors.mutedForeground }]}>{partner.contact}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pan-African Pipeline</Text>
        {INTL_PARTNERS.map((p) => (
          <View key={p.name} style={[styles.intlCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.partnerFlag}>{p.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.partnerName, { color: colors.foreground }]}>{p.name}</Text>
              <Text style={[styles.partnerMinistry, { color: colors.mutedForeground }]}>{p.role}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${colors.violet}20` }]}>
              <Text style={[styles.statusText, { color: colors.violet }]}>{p.status}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            All government partnerships are backed by formal MOU agreements. State ministries validate both the government title deed hash and the indigenous land authority approval before any property is tokenized on-chain.
          </Text>
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
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  kpiVal: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  kpiLabel: { fontSize: 10, marginTop: 3, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  partnerCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  partnerHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  partnerFlag: { fontSize: 28 },
  partnerName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  partnerMinistry: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  partnerMetrics: { flexDirection: "row", gap: 24 },
  partnerMetric: {},
  partnerMetricVal: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  partnerMetricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
  spvList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  spvChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  spvText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  intlCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular", flex: 1 },
});
