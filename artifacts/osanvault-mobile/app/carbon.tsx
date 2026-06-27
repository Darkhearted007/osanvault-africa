import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useListCarbonProjects, useGetPlatformStats } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

const PROJECT_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=60",
  2: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=60",
  3: "https://images.unsplash.com/photo-1504233529578-6d46baba6d34?auto=format&fit=crop&w=600&q=60",
  4: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=60",
  5: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=60",
};

function formatCredits(n: number | string | bigint | null | undefined) {
  const v = Number(n ?? 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M tCO₂`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K tCO₂`;
  return `${v} tCO₂`;
}

export default function CarbonScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const { data: projects = [], isLoading } = useListCarbonProjects();
  const { data: stats } = useGetPlatformStats();

  const [retireProjectId, setRetireProjectId] = useState<number | null>(null);
  const [retireStep, setRetireStep] = useState<1 | 2 | 3 | "success">(1);

  const totalIssued = projects.reduce((s, p) => s + Number(p.totalIssued ?? 0), 0);
  const totalRetired = projects.reduce((s, p) => s + Number(p.totalRetired ?? 0), 0);
  const pctRetired = totalIssued > 0 ? Math.round((totalRetired / totalIssued) * 100) : 0;

  function startRetire(projectId: number) {
    setRetireProjectId(projectId);
    setRetireStep(1);
  }

  function handleRetire() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Contract Not Yet Deployed",
      "OsanCarbon (ERC-1155) is not yet deployed to Polygon Mainnet. Carbon retirement will be available at launch.",
      [{ text: "OK" }]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Carbon Credits</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="wind" size={18} color={colors.emeraldBright} />
            <Text style={[styles.kpiVal, { color: colors.emeraldBright }]}>{formatCredits(totalIssued)}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Total Issued</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="zap" size={18} color={colors.primary} />
            <Text style={[styles.kpiVal, { color: colors.primary }]}>{formatCredits(totalRetired)}</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Retired</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="percent" size={18} color={colors.gold} />
            <Text style={[styles.kpiVal, { color: colors.gold }]}>{pctRetired}%</Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Retired Rate</Text>
          </View>
        </View>

        <View style={[styles.ctaBanner, { backgroundColor: colors.card, borderColor: colors.emeraldBright }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Retire Carbon Credits</Text>
            <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>
              Connect wallet to permanently retire OsanCarbon (ERC-1155) credits on-chain. Each retired credit offsets 1 tonne CO₂.
            </Text>
          </View>
          <Pressable style={[styles.ctaBtn, { backgroundColor: colors.emeraldBright }]} onPress={handleRetire}>
            <Text style={[styles.ctaBtnText, { color: colors.background }]}>Retire</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Projects</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          projects.map((project, i) => {
            const issuedN = Number(project.totalIssued ?? 0);
            const retiredN = Number(project.totalRetired ?? 0);
            const retiredPct = issuedN > 0 ? Math.round((retiredN / issuedN) * 100) : 0;
            const imageUrl = PROJECT_IMAGES[project.id] ?? PROJECT_IMAGES[1];

            return (
              <View key={project.id} style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.projectImage}
                  resizeMode="cover"
                />
                <View style={styles.projectBody}>
                  <View style={styles.projectHeader}>
                    <View style={styles.projectLeft}>
                      <Text style={styles.projectFlag}>{project.flag}</Text>
                      <View>
                        <Text style={[styles.projectName, { color: colors.foreground }]}>{project.name}</Text>
                        <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>
                          {project.region} · Vintage {project.vintage}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.projectBadges}>
                      <View style={[styles.badge, { backgroundColor: project.verified ? `${colors.emeraldBright}15` : `${colors.amber}15` }]}>
                        <Text style={[styles.badgeText, { color: project.verified ? colors.emeraldBright : colors.amber }]}>
                          {project.verified ? "Verified" : "Pending"}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{project.methodology}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.projectDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {project.description}
                  </Text>

                  <View style={styles.projectMetrics}>
                    <View style={styles.projectMetric}>
                      <Text style={[styles.projectMetricVal, { color: colors.foreground }]}>{formatCredits(project.totalIssued)}</Text>
                      <Text style={[styles.projectMetricLabel, { color: colors.mutedForeground }]}>Issued</Text>
                    </View>
                    <View style={styles.projectMetric}>
                      <Text style={[styles.projectMetricVal, { color: colors.primary }]}>{formatCredits(project.totalRetired)}</Text>
                      <Text style={[styles.projectMetricLabel, { color: colors.mutedForeground }]}>Retired</Text>
                    </View>
                    <View style={styles.projectMetric}>
                      <Text style={[styles.projectMetricVal, { color: colors.gold }]}>{retiredPct}%</Text>
                      <Text style={[styles.projectMetricLabel, { color: colors.mutedForeground }]}>Rate</Text>
                    </View>
                  </View>

                  <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { width: `${retiredPct}%` as any, backgroundColor: colors.emeraldBright }]} />
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.retireBtn,
                      { backgroundColor: `${colors.emeraldBright}15`, borderColor: `${colors.emeraldBright}40`, opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={handleRetire}
                  >
                    <Feather name="zap" size={14} color={colors.emeraldBright} />
                    <Text style={[styles.retireBtnText, { color: colors.emeraldBright }]}>Retire Credits</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            OsanCarbon credits are issued as ERC-1155 tokens on Polygon. Retirement is permanent and on-chain. Credits are verified under Verra VCS, Gold Standard, or Plan Vivo methodologies.
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
  content: { paddingHorizontal: 16, gap: 16 },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 4 },
  kpiVal: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  kpiLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  ctaBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ctaTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  ctaDesc: { fontSize: 12, lineHeight: 17, marginTop: 4, fontFamily: "Inter_400Regular" },
  ctaBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22 },
  ctaBtnText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  projectCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  projectImage: { width: "100%", height: 130 },
  projectBody: { padding: 14, gap: 10 },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  projectLeft: { flexDirection: "row", gap: 10, alignItems: "center", flex: 1 },
  projectFlag: { fontSize: 24 },
  projectName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  projectMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  projectBadges: { gap: 4, alignItems: "flex-end" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  projectDesc: { fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  projectMetrics: { flexDirection: "row", gap: 20 },
  projectMetric: {},
  projectMetricVal: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  projectMetricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },
  progressTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  retireBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  retireBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular", flex: 1 },
});
