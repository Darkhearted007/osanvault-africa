import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetProperty } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const PROPERTY_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=70",
  2: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=70",
  3: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=70",
  4: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=70",
  5: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=70",
  6: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=70",
};

function formatNgn(val: number | string | null | undefined) {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const { data: property, isLoading } = useGetProperty(Number(id));

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Property not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const pct = Math.min(
    100,
    Math.round((Number(property.raised ?? 0) / Number(property.targetRaise ?? 1)) * 100)
  );
  const img = PROPERTY_IMAGES[property.id as number] ?? PROPERTY_IMAGES[1];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.heroContainer, { paddingTop: topInset }]}>
        <Image source={{ uri: img }} style={styles.hero} resizeMode="cover" />
        <View style={StyleSheet.absoluteFill} />
        <View style={[styles.heroOverlay, StyleSheet.absoluteFill]} />
        <Pressable
          style={[styles.backButton, { backgroundColor: "rgba(7,17,26,0.6)" }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.heroBadgeRow}>
          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor:
                  property.status === "live"
                    ? "#0E7C6630"
                    : property.status === "funding"
                    ? "#F59E0B30"
                    : "#FFFFFF20",
              },
            ]}
          >
            <Text
              style={[
                styles.heroBadgeText,
                {
                  color:
                    property.status === "live"
                      ? colors.emeraldBright
                      : property.status === "funding"
                      ? colors.amber
                      : colors.mutedForeground,
                },
              ]}
            >
              {property.status?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroFlag}>{property.flag}</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.propertyName, { color: colors.foreground }]}>{property.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground }]}>
              {property.location}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.typeText, { color: colors.primary }]}>{property.type}</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            {[
              { label: "Target APY", value: `${property.yieldApy}%`, color: colors.primary },
              { label: "Token Price", value: formatNgn(property.tokenPrice), color: colors.gold },
              { label: "Total Tokens", value: (property.totalTokens ?? 0).toLocaleString(), color: colors.foreground },
              { label: "Target Raise", value: formatNgn(property.targetRaise), color: colors.foreground },
            ].map(({ label, value, color: c }) => (
              <View key={label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.metricValue, { color: c }]}>{value}</Text>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.fundingSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.fundingHeader}>
              <Text style={[styles.fundingTitle, { color: colors.foreground }]}>Funding Progress</Text>
              <Text style={[styles.fundingPct, { color: colors.primary }]}>{pct}%</Text>
            </View>
            <View style={[styles.fundingBar, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.fundingFill,
                  { width: `${pct}%` as any, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <View style={styles.fundingStats}>
              <Text style={[styles.fundingStat, { color: colors.mutedForeground }]}>
                Raised: {formatNgn(property.raised)}
              </Text>
              <Text style={[styles.fundingStat, { color: colors.mutedForeground }]}>
                Target: {formatNgn(property.targetRaise)}
              </Text>
            </View>
          </View>

          {property.description && (
            <View style={[styles.descSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>About This Property</Text>
              <Text style={[styles.descText, { color: colors.mutedForeground }]}>{property.description}</Text>
            </View>
          )}

          {(property.legalDocCid || property.indigenousAuthority) && (
            <View style={[styles.legalSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Legal Verification</Text>
              {property.indigenousAuthority && (
                <View style={styles.legalRow}>
                  <Feather name="shield" size={14} color={colors.emeraldBright} />
                  <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
                    Authority: {property.indigenousAuthority}
                  </Text>
                </View>
              )}
              {property.legalDocCid && (
                <View style={styles.legalRow}>
                  <Feather name="file-text" size={14} color={colors.gold} />
                  <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
                    IPFS: {property.legalDocCid.slice(0, 20)}...
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.ctaPrice, { color: colors.foreground }]}>{formatNgn(property.tokenPrice)}</Text>
          <Text style={[styles.ctaLabel, { color: colors.mutedForeground }]}>per token</Text>
        </View>
        <Pressable
          style={[
            styles.ctaButton,
            { backgroundColor: property.status === "live" || property.status === "funding" ? colors.primary : colors.muted },
          ]}
        >
          <Text style={[styles.ctaButtonText, { color: property.status === "live" || property.status === "funding" ? colors.primaryForeground : colors.mutedForeground }]}>
            {property.status === "live" || property.status === "funding" ? "Invest Now" : "Closed"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  backBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  heroContainer: { height: 260, position: "relative" },
  hero: { width: "100%", height: "100%" },
  heroOverlay: { backgroundColor: "rgba(7,17,26,0.4)" },
  backButton: {
    position: "absolute",
    top: 0,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgeRow: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroFlag: { fontSize: 28 },
  content: { padding: 20, gap: 16 },
  propertyName: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  typeText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: {
    width: "47%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 12, marginTop: 4, fontFamily: "Inter_400Regular" },
  fundingSection: { borderRadius: 14, borderWidth: 1, padding: 16 },
  fundingHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  fundingTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  fundingPct: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  fundingBar: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  fundingFill: { height: "100%", borderRadius: 4 },
  fundingStats: { flexDirection: "row", justifyContent: "space-between" },
  fundingStat: { fontSize: 12, fontFamily: "Inter_400Regular" },
  descSection: { borderRadius: 14, borderWidth: 1, padding: 16 },
  descTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 22, fontFamily: "Inter_400Regular" },
  legalSection: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  legalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legalText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  ctaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 30 : 14,
  },
  ctaPrice: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  ctaLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  ctaButton: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  ctaButtonText: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
