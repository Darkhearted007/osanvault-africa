import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const TIERS = [
  {
    name: "Starter",
    badge: "Entry",
    badgeColor: "#38BDF8",
    listingFee: "2.5%",
    platformFee: "2.0%",
    yieldFee: "8%",
    minRaise: "₦50M",
    maxRaise: "₦500M",
    highlight: false,
    features: [
      "ERC-1155 token deployment",
      "SEC ARIP Sandbox registration",
      "KYC/AML onboarding",
      "Basic analytics dashboard",
      "OsanVault marketplace listing",
    ],
  },
  {
    name: "Growth",
    badge: "Most Popular",
    badgeColor: "#D4AF37",
    listingFee: "2.0%",
    platformFee: "1.5%",
    yieldFee: "6%",
    minRaise: "₦500M",
    maxRaise: "₦5B",
    highlight: true,
    features: [
      "Everything in Starter",
      "Dual land verification",
      "Carbon credit linkage",
      "Priority marketplace placement",
      "Governance proposal rights",
      "Staking yield integration",
      "Dedicated compliance officer",
    ],
  },
  {
    name: "Institutional",
    badge: "Enterprise",
    badgeColor: "#818CF8",
    listingFee: "1.5%",
    platformFee: "1.0%",
    yieldFee: "4%",
    minRaise: "₦5B",
    maxRaise: "No limit",
    highlight: false,
    features: [
      "Everything in Growth",
      "Government PPP partnership track",
      "Custom SPV structure",
      "Multi-state land portfolio",
      "White-label investor portal",
      "Priority regulatory support",
    ],
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "Submit SPV Details", desc: "Provide property documentation, valuation reports, and legal title evidence." },
  { step: "02", title: "Dual Land Verification", desc: "Government title hash and indigenous authority approval recorded on-chain via LandRegistry.sol." },
  { step: "03", title: "KYC & Compliance", desc: "Entity KYC, AML checks, and SEC ARIP Sandbox registration completed." },
  { step: "04", title: "Smart Contract Deployment", desc: "ERC-1155 token contract deployed on Polygon. Fee parameters configured via FeeRouter.sol." },
  { step: "05", title: "Marketplace Launch", desc: "Property tokens listed on OsanVault Africa marketplace. Investor subscriptions open." },
  { step: "06", title: "Ongoing Reporting", desc: "Quarterly financial reporting, rent distribution, and carbon credit tracking." },
];

export default function IssuerScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;
  const [selectedTier, setSelectedTier] = useState(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Issuer Portal</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={[styles.heroBanner, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="home" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>List a Property SPV</Text>
            <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
              Tokenize African real estate on Polygon. Access thousands of verified investors through the OsanVault marketplace.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fee Tiers</Text>
        {TIERS.map((tier, i) => (
          <Pressable
            key={tier.name}
            style={({ pressed }) => [
              styles.tierCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedTier === i ? tier.badgeColor : colors.border,
                borderWidth: selectedTier === i ? 2 : 1,
                opacity: pressed ? 0.95 : 1,
              },
            ]}
            onPress={() => { setSelectedTier(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <View style={styles.tierHeader}>
              <View>
                <Text style={[styles.tierName, { color: colors.foreground }]}>{tier.name}</Text>
                <Text style={[styles.tierRange, { color: colors.mutedForeground }]}>{tier.minRaise} – {tier.maxRaise}</Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: `${tier.badgeColor}20` }]}>
                <Text style={[styles.tierBadgeText, { color: tier.badgeColor }]}>{tier.badge}</Text>
              </View>
            </View>

            <View style={styles.tierFees}>
              <View style={styles.tierFee}>
                <Text style={[styles.tierFeeVal, { color: colors.foreground }]}>{tier.listingFee}</Text>
                <Text style={[styles.tierFeeLabel, { color: colors.mutedForeground }]}>Listing</Text>
              </View>
              <View style={styles.tierFee}>
                <Text style={[styles.tierFeeVal, { color: colors.foreground }]}>{tier.platformFee}</Text>
                <Text style={[styles.tierFeeLabel, { color: colors.mutedForeground }]}>Platform</Text>
              </View>
              <View style={styles.tierFee}>
                <Text style={[styles.tierFeeVal, { color: colors.foreground }]}>{tier.yieldFee}</Text>
                <Text style={[styles.tierFeeLabel, { color: colors.mutedForeground }]}>Yield Cut</Text>
              </View>
            </View>

            {selectedTier === i && (
              <View style={styles.tierFeatures}>
                {tier.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather name="check" size={13} color={tier.badgeColor} />
                    <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Onboarding Process</Text>
        {PROCESS_STEPS.map((step, i) => (
          <View key={step.step} style={styles.processRow}>
            <View style={[styles.stepNum, { backgroundColor: i < 2 ? colors.primary : colors.muted }]}>
              <Text style={[styles.stepNumText, { color: i < 2 ? colors.primaryForeground : colors.mutedForeground }]}>{step.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.ctaCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Ready to tokenize your property?</Text>
          <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>
            Contact our issuer relations team to start the onboarding process. Typical time to listing: 6–8 weeks.
          </Text>
          <View style={[styles.ctaEmailRow, { backgroundColor: colors.input }]}>
            <Feather name="mail" size={14} color={colors.primary} />
            <Text style={[styles.ctaEmail, { color: colors.foreground }]}>issuers@osanvault.africa</Text>
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
  heroBanner: { borderRadius: 14, borderWidth: 1.5, padding: 16, flexDirection: "row", gap: 12, alignItems: "center" },
  heroIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroDesc: { fontSize: 13, lineHeight: 19, marginTop: 4, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  tierCard: { borderRadius: 14, padding: 16, gap: 12 },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tierName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tierRange: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tierBadgeText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tierFees: { flexDirection: "row", gap: 24 },
  tierFee: {},
  tierFeeVal: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tierFeeLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  tierFeatures: { gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  processRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  stepTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  stepDesc: { fontSize: 12, lineHeight: 18, marginTop: 3, fontFamily: "Inter_400Regular" },
  ctaCard: { borderRadius: 14, borderWidth: 1.5, padding: 18, gap: 10 },
  ctaTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  ctaDesc: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  ctaEmailRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  ctaEmail: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
