import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListProperties } from "@workspace/api-client-react";
import type { Property } from "@workspace/api-client-react";
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

function fundingPct(p: Property): number {
  const raised = Number(p.raisedNgn ?? 0);
  const target = Number(p.targetNgn ?? 1);
  return Math.min(100, Math.round((raised / target) * 100));
}

const TYPE_FILTERS = ["All", "LandBank", "Commercial", "Residential", "Industrial", "Mixed"];

export default function PropertiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { data, isLoading } = useListProperties();
  const properties = data ?? [];

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "All" || p.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Properties</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {filtered.length} tokenized assets
        </Text>
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search properties..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        horizontal
        data={TYPE_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === item ? colors.primary : colors.card,
                borderColor: activeFilter === item ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(item)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: activeFilter === item ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
        style={styles.filterContainer}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 34 : 100 },
          ]}
          scrollEnabled={filtered.length > 0}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No properties found</Text>
            </View>
          }
          renderItem={({ item: property }) => {
            const pct = fundingPct(property);
            const img = PROPERTY_IMAGES[property.id as number] ?? PROPERTY_IMAGES[1];
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => router.push(`/property/${property.id}`)}
              >
                <Image source={{ uri: img }} style={styles.cardImage} resizeMode="cover" />
                <View style={[styles.cardImageOverlay, StyleSheet.absoluteFill]} />
                <View style={styles.cardBadges}>
                  <View
                    style={[
                      styles.badge,
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
                        styles.badgeText,
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
                      {property.status}
                    </Text>
                  </View>
                  <Text style={styles.flagEmoji}>{property.flag}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardName, { color: colors.foreground }]}>{property.name}</Text>
                  <Text style={[styles.cardLocation, { color: colors.mutedForeground }]}>
                    {property.city}, {property.country}
                  </Text>
                  <View style={styles.cardMetrics}>
                    <View style={styles.metric}>
                      <Text style={[styles.metricVal, { color: colors.primary }]}>{property.targetApy}%</Text>
                      <Text style={[styles.metricLbl, { color: colors.mutedForeground }]}>APY</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={[styles.metricVal, { color: colors.foreground }]}>
                        {formatNgn(property.tokenPrice)}
                      </Text>
                      <Text style={[styles.metricLbl, { color: colors.mutedForeground }]}>/ token</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={[styles.metricVal, { color: colors.gold }]}>
                        {property.totalTokens?.toLocaleString() ?? "—"}
                      </Text>
                      <Text style={[styles.metricLbl, { color: colors.mutedForeground }]}>tokens</Text>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { backgroundColor: colors.primary, width: `${pct}%` as any },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{pct}% raised</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, marginTop: 2, fontFamily: "Inter_400Regular" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterContainer: { maxHeight: 44 },
  filterList: { paddingHorizontal: 16, gap: 8, paddingBottom: 4, paddingTop: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  listContent: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImage: { height: 140, width: "100%" },
  cardImageOverlay: {
    backgroundColor: "rgba(7,17,26,0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  cardBadges: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  flagEmoji: { fontSize: 22 },
  cardContent: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cardLocation: { fontSize: 13, marginTop: 3, fontFamily: "Inter_400Regular" },
  cardMetrics: { flexDirection: "row", gap: 24, marginTop: 12 },
  metric: {},
  metricVal: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  metricLbl: { fontSize: 11, marginTop: 2, fontFamily: "Inter_400Regular" },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 11, fontFamily: "Inter_400Regular", width: 60 },
  emptyState: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
