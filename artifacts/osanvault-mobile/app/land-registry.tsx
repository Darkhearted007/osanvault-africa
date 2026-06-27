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
import { useListProperties } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function LandRegistryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const { data: propertiesData, isLoading } = useListProperties();
  const properties = propertiesData ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Land Registry</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={[styles.infoIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="map" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoBannerTitle, { color: colors.foreground }]}>Dual Land Verification</Text>
            <Text style={[styles.infoBannerDesc, { color: colors.mutedForeground }]}>
              Every property on OsanVault Africa is verified by both a government title deed hash and indigenous authority approval, stored immutably on-chain via LandRegistry.sol.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="check-circle" size={20} color={colors.primary} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{properties.filter(p => !!p.legalDocCid).length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Title Verified</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={20} color={colors.gold} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{properties.filter(p => !!p.indigenousAuthority).length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Auth. Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="file-text" size={20} color={colors.emeraldBright} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{properties.filter(p => !!p.legalDocCid).length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>IPFS Docs</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>On-Chain Registry</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : (
          properties.map((property) => (
            <View key={property.id} style={[styles.registryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.registryHeader}>
                <Text style={styles.propertyFlag}>{property.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.propertyName, { color: colors.foreground }]}>{property.name}</Text>
                  <Text style={[styles.propertyLocation, { color: colors.mutedForeground }]}>
                    {property.location}
                  </Text>
                </View>
                <View
                  style={[
                    styles.verifiedBadge,
                    {
                      backgroundColor:
                        property.legalDocCid ? `${colors.primary}20` : `${colors.mutedForeground}20`,
                    },
                  ]}
                >
                  <Feather
                    name={property.legalDocCid ? "check-circle" : "clock"}
                    size={12}
                    color={property.legalDocCid ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.verifiedText,
                      { color: property.legalDocCid ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {property.legalDocCid ? "Verified" : "Pending"}
                  </Text>
                </View>
              </View>

              {property.indigenousAuthority && (
                <View style={[styles.hashRow, { backgroundColor: colors.input }]}>
                  <Feather name="shield" size={12} color={colors.emeraldBright} />
                  <Text style={[styles.hashText, { color: colors.mutedForeground }]} numberOfLines={1}>
                    Authority: {property.indigenousAuthority}
                  </Text>
                </View>
              )}

              {property.legalDocCid && (
                <View style={[styles.hashRow, { backgroundColor: colors.input }]}>
                  <Feather name="link" size={12} color={colors.gold} />
                  <Text style={[styles.hashText, { color: colors.mutedForeground }]} numberOfLines={1}>
                    IPFS: {property.legalDocCid}
                  </Text>
                </View>
              )}

              {property.indigenousAuthority && (
                <View style={styles.authRow}>
                  <Feather name="users" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.authText, { color: colors.mutedForeground }]}>
                    Authority: {property.indigenousAuthority}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        <View style={[styles.contractCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.contractTitle, { color: colors.foreground }]}>LandRegistry.sol</Text>
          <Text style={[styles.contractDesc, { color: colors.mutedForeground }]}>
            The LandRegistry smart contract stores immutable property verification data on Polygon. Each property's title hash and indigenous authority approval are verified off-chain before submission.
          </Text>
          <View style={[styles.contractHash, { backgroundColor: colors.input }]}>
            <Text style={[styles.contractHashText, { color: colors.mutedForeground }]}>
              Contract: 0x000...0000 (Mainnet pending)
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
  infoBanner: { borderRadius: 14, borderWidth: 1.5, padding: 16, flexDirection: "row", gap: 12 },
  infoIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  infoBannerTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  infoBannerDesc: { fontSize: 13, lineHeight: 19, marginTop: 4, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 6 },
  statVal: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  registryCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  registryHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  propertyFlag: { fontSize: 24 },
  propertyName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  propertyLocation: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  hashRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  hashText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  authRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  authText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  contractCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  contractTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  contractDesc: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  contractHash: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  contractHashText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
