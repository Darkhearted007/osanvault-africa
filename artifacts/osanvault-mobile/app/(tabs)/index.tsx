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
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListProperties, useGetPlatformStats } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const PROPERTY_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=600&q=60",
  2: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=60",
  3: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=60",
  4: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=60",
  5: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=60",
  6: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=600&q=60",
};

function formatNgn(val: number | string | null | undefined) {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: propertiesData, isLoading: propsLoading } = useListProperties();
  const { data: statsData } = useGetPlatformStats();

  const properties = propertiesData ?? [];
  const featured = properties.filter((p) => p.status === "live" || p.status === "funding").slice(0, 4);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const styles = makeStyles(colors);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View>
          <Text style={styles.greeting}>OsanVault Africa</Text>
          <Text style={styles.subtitle}>Institutional Real Estate</Text>
        </View>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Polygon</Text>
        </View>
      </View>

      {statsData && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {statsData.tvlNgn ? formatNgn(Number(statsData.tvlNgn)) : "₦9.2B"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total TVL</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.gold }]}>
              {statsData.totalProperties ?? 6}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Properties</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.emeraldBright }]}>
              {statsData.totalHolders ?? "1,247"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Holders</Text>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Properties</Text>
        <Pressable onPress={() => router.push("/(tabs)/properties")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
        </Pressable>
      </View>

      {propsLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardScroll}
        >
          {featured.map((property) => (
            <Pressable
              key={property.id}
              style={({ pressed }) => [
                styles.propertyCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => router.push(`/property/${property.id}`)}
            >
              <View style={styles.cardImageContainer}>
                <Image
                  source={{ uri: PROPERTY_IMAGES[property.id as number] ?? PROPERTY_IMAGES[1] }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardImageOverlay} />
                <View style={styles.cardBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: property.status === "live" ? "#0E7C6630" : "#F59E0B30" }]}>
                    <Text style={[styles.statusText, { color: property.status === "live" ? colors.emeraldBright : colors.amber }]}>
                      {property.status}
                    </Text>
                  </View>
                  <Text style={styles.flagText}>{property.flag}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{property.name}</Text>
                <Text style={[styles.cardLocation, { color: colors.mutedForeground }]} numberOfLines={1}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} /> {property.location}
                </Text>
                <View style={styles.cardMetrics}>
                  <View>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>{property.yieldApy}% APY</Text>
                    <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Target</Text>
                  </View>
                  <View>
                    <Text style={[styles.metricValue, { color: colors.foreground }]}>{formatNgn(property.tokenPrice)}</Text>
                    <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>/ token</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={[styles.ctaBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.ctaAccent, { backgroundColor: colors.primary }]} />
        <View style={styles.ctaContent}>
          <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Early Access Open</Text>
          <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>Join the whitelist for institutional investors</Text>
        </View>
        <Pressable
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/more")}
        >
          <Feather name="arrow-right" size={16} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Platform Verticals</Text>
      </View>
      <View style={styles.verticalsGrid}>
        {VERTICALS.map((v) => (
          <View key={v.title} style={[styles.verticalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.verticalIcon, { backgroundColor: v.bg }]}>
              <Feather name={v.icon as any} size={20} color={v.color} />
            </View>
            <Text style={[styles.verticalTitle, { color: colors.foreground }]}>{v.title}</Text>
            <Text style={[styles.verticalDesc, { color: colors.mutedForeground }]}>{v.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const VERTICALS = [
  { icon: "home", title: "Real Estate", desc: "Fractional ERC-1155 property tokens on Polygon", color: "#0E7C66", bg: "#0E7C6620" },
  { icon: "lock", title: "Staking", desc: "8–22% APR locking OSANV for 30–365 days", color: "#D4AF37", bg: "#D4AF3720" },
  { icon: "check-square", title: "Governance", desc: "On-chain voting with 7-day windows", color: "#60A5FA", bg: "#60A5FA20" },
  { icon: "wind", title: "Carbon Credits", desc: "Verified tCO₂e from African climate projects", color: "#34d399", bg: "#34d39920" },
];

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    greeting: { fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
    badgeText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
    statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 24 },
    statCard: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderRadius: colors.radius,
      borderWidth: 1,
      alignItems: "center",
    },
    statValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
    statLabel: { fontSize: 11, marginTop: 3, fontFamily: "Inter_400Regular" },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
    cardScroll: { paddingHorizontal: 16, gap: 14, paddingBottom: 8 },
    propertyCard: {
      width: 200,
      borderRadius: colors.radius,
      borderWidth: 1,
      overflow: "hidden",
    },
    cardImageContainer: { height: 120, position: "relative" },
    cardImage: { width: "100%", height: "100%" },
    cardImageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(7,17,26,0.45)",
    },
    cardBadgeRow: {
      position: "absolute",
      bottom: 8,
      left: 8,
      right: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
    flagText: { fontSize: 20 },
    cardBody: { padding: 12 },
    cardName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    cardLocation: { fontSize: 12, marginTop: 3, fontFamily: "Inter_400Regular" },
    cardMetrics: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    metricValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
    metricLabel: { fontSize: 11, marginTop: 1, fontFamily: "Inter_400Regular" },
    ctaBanner: {
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 24,
      borderRadius: colors.radius,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
    },
    ctaAccent: { width: 4, alignSelf: "stretch" },
    ctaContent: { flex: 1, padding: 16 },
    ctaTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    ctaDesc: { fontSize: 12, marginTop: 3, fontFamily: "Inter_400Regular" },
    ctaButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    verticalsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 24,
    },
    verticalCard: {
      width: "47%",
      padding: 14,
      borderRadius: colors.radius,
      borderWidth: 1,
    },
    verticalIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    verticalTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    verticalDesc: { fontSize: 12, marginTop: 4, lineHeight: 17, fontFamily: "Inter_400Regular" },
  });
}
