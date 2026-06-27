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

const MENU_SECTIONS = [
  {
    title: "Platform",
    items: [
      { icon: "layers", label: "Tokenomics", desc: "OSANV token supply and distribution", route: "/tokenomics" },
      { icon: "trending-up", label: "Staking", desc: "Stake OSANV for 8–22% APR", route: "/staking" },
      { icon: "shield", label: "Treasury Vault", desc: "Protocol reserves and fee flows", route: "/treasury" },
      { icon: "wind", label: "Carbon Credits", desc: "Retire OsanCarbon ERC-1155 credits", route: "/carbon" },
      { icon: "globe", label: "Land Registry", desc: "On-chain title verification", route: "/land-registry" },
      { icon: "flag", label: "Government Partners", desc: "State and pan-African partnerships", route: "/government" },
      { icon: "briefcase", label: "My Portfolio", desc: "Property tokens and holdings", route: "/portfolio" },
      { icon: "info", label: "About OsanVault", desc: "Our mission, roadmap, and security", route: "/about" },
      { icon: "box", label: "Issuer Portal", desc: "Tokenize a property SPV", route: "/issuer" },
      { icon: "settings", label: "Admin Panel", desc: "SPV approvals, KYC, oracle feeds", route: "/admin" },
    ],
  },
  {
    title: "Community",
    items: [
      { icon: "star", label: "Early Access", desc: "Apply for the investor whitelist", route: "/whitelist" },
    ],
  },
  {
    title: "Legal & Compliance",
    items: [
      { icon: "shield", label: "SEC ARIP Sandbox", desc: "Regulatory framework", route: "/legal?tab=sec-arip" },
      { icon: "file-text", label: "Terms of Service", desc: "Platform terms", route: "/legal?tab=terms" },
      { icon: "lock", label: "Privacy Policy", desc: "Data handling policy", route: "/legal?tab=privacy" },
      { icon: "alert-triangle", label: "Risk Disclosure", desc: "Investment risks", route: "/legal?tab=risk" },
    ],
  },
];

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>More</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.earlyAccessCard,
          { backgroundColor: colors.card, borderColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => router.push("/whitelist")}
      >
        <View style={styles.earlyAccessLeft}>
          <View style={[styles.earlyAccessIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="star" size={20} color={colors.gold} />
          </View>
          <View>
            <Text style={[styles.earlyAccessTitle, { color: colors.foreground }]}>Whitelist Open</Text>
            <Text style={[styles.earlyAccessDesc, { color: colors.mutedForeground }]}>
              Early access for accredited investors
            </Text>
          </View>
        </View>
        <View style={[styles.earlyAccessBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.earlyAccessBadgeText, { color: colors.primaryForeground }]}>Apply</Text>
        </View>
      </Pressable>

      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.sectionGroup}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, idx) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.menuRow,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Feather name={item.icon as any} size={16} color={colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <View style={[styles.networkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.networkRow}>
          <View style={styles.networkItem}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.networkLabel, { color: colors.mutedForeground }]}>Network</Text>
            <Text style={[styles.networkValue, { color: colors.foreground }]}>Polygon</Text>
          </View>
          <View style={styles.networkItem}>
            <View style={[styles.dot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.networkLabel, { color: colors.mutedForeground }]}>Token</Text>
            <Text style={[styles.networkValue, { color: colors.foreground }]}>OSANV</Text>
          </View>
          <View style={styles.networkItem}>
            <View style={[styles.dot, { backgroundColor: colors.emeraldBright }]} />
            <Text style={[styles.networkLabel, { color: colors.mutedForeground }]}>Standard</Text>
            <Text style={[styles.networkValue, { color: colors.foreground }]}>ERC-1155</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        OsanVault Africa · v1.0.0 · Polygon Mainnet
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  earlyAccessCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  earlyAccessLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  earlyAccessIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  earlyAccessTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  earlyAccessDesc: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  earlyAccessBadge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  earlyAccessBadgeText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sectionGroup: { marginBottom: 20, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  menuDesc: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  networkCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  networkRow: { flexDirection: "row", justifyContent: "space-around" },
  networkItem: { alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  networkLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  networkValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", paddingBottom: 8 },
});
