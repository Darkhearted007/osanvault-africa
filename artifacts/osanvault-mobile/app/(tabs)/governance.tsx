import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListGovernanceProposals, useListCarbonProjects } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

type Tab = "proposals" | "carbon";

export default function GovernanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("proposals");

  const { data: proposalsData, isLoading: propLoading } = useListGovernanceProposals();
  const { data: carbonData, isLoading: carbonLoading } = useListCarbonProjects();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 100;

  const proposals = proposalsData ?? [];
  const carbonProjects = carbonData ?? [];

  const statusColor = (s: string) => {
    if (s === "active") return colors.primary;
    if (s === "passed") return colors.emeraldBright;
    if (s === "failed") return colors.destructive;
    if (s === "pending") return colors.amber;
    return colors.mutedForeground;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Governance</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>On-chain decisions & carbon credits</Text>
        <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[styles.tab, activeTab === "proposals" && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab("proposals")}
          >
            <Text style={[styles.tabText, { color: activeTab === "proposals" ? colors.primaryForeground : colors.mutedForeground }]}>
              Proposals
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "carbon" && { backgroundColor: colors.emeraldBright }]}
            onPress={() => setActiveTab("carbon")}
          >
            <Text style={[styles.tabText, { color: activeTab === "carbon" ? "#07111A" : colors.mutedForeground }]}>
              Carbon Credits
            </Text>
          </Pressable>
        </View>
      </View>

      {activeTab === "proposals" ? (
        propLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={proposals}
            keyExtractor={(p) => String(p.id)}
            contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
            scrollEnabled={proposals.length > 0}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="inbox" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No proposals</Text>
              </View>
            }
            renderItem={({ item: p }) => {
              const totalVotes = Number(p.votesFor ?? 0) + Number(p.votesAgainst ?? 0);
              const forPct = totalVotes > 0 ? Math.round((Number(p.votesFor ?? 0) / totalVotes) * 100) : 0;
              return (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor(p.status)}20` }]}>
                      <Text style={[styles.statusText, { color: statusColor(p.status) }]}>
                        {p.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.proposalId, { color: colors.mutedForeground }]}>#{p.id}</Text>
                  </View>
                  <Text style={[styles.proposalTitle, { color: colors.foreground }]}>{p.title}</Text>
                  <Text style={[styles.proposalDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {p.description}
                  </Text>
                  <View style={styles.voteSection}>
                    <View style={styles.voteRow}>
                      <Text style={[styles.voteLabel, { color: colors.mutedForeground }]}>For</Text>
                      <Text style={[styles.votePct, { color: colors.primary }]}>{forPct}%</Text>
                    </View>
                    <View style={[styles.voteBar, { backgroundColor: colors.muted }]}>
                      <View
                        style={[
                          styles.voteFill,
                          { width: `${forPct}%` as any, backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                    <View style={styles.voteStats}>
                      <Text style={[styles.voteStat, { color: colors.mutedForeground }]}>
                        {Number(p.votesFor ?? 0).toLocaleString()} for
                      </Text>
                      <Text style={[styles.voteStat, { color: colors.mutedForeground }]}>
                        {Number(p.votesAgainst ?? 0).toLocaleString()} against
                      </Text>
                    </View>
                  </View>
                  {p.endTime && (
                    <View style={styles.deadline}>
                      <Feather name="clock" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.deadlineText, { color: colors.mutedForeground }]}>
                        Ends {new Date(p.endTime).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        )
      ) : carbonLoading ? (
        <ActivityIndicator color={colors.emeraldBright} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={carbonProjects}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
          scrollEnabled={carbonProjects.length > 0}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="wind" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No carbon projects</Text>
            </View>
          }
          renderItem={({ item: c }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.carbonHeader}>
                <View style={[styles.carbonIcon, { backgroundColor: `${colors.emeraldBright}20` }]}>
                  <Feather name="wind" size={20} color={colors.emeraldBright} />
                </View>
                <View style={styles.carbonMeta}>
                  <Text style={[styles.proposalTitle, { color: colors.foreground }]}>{c.name}</Text>
                  <Text style={[styles.proposalDesc, { color: colors.mutedForeground }]}>
                    {c.region} · {c.methodology}
                  </Text>
                </View>
              </View>
              <View style={styles.carbonMetrics}>
                <View style={styles.carbonMetric}>
                  <Text style={[styles.carbonMetricVal, { color: colors.emeraldBright }]}>
                    {Number(c.totalIssued ?? 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.carbonMetricLabel, { color: colors.mutedForeground }]}>tCO₂e Total</Text>
                </View>
                <View style={styles.carbonMetric}>
                  <Text style={[styles.carbonMetricVal, { color: colors.gold }]}>
                    {Number(c.totalRetired ?? 0).toLocaleString()}
                  </Text>
                  <Text style={[styles.carbonMetricLabel, { color: colors.mutedForeground }]}>Retired</Text>
                </View>
                <View style={styles.carbonMetric}>
                  <View style={[styles.statusBadge, { backgroundColor: `${colors.emeraldBright}20` }]}>
                    <Text style={[styles.statusText, { color: colors.emeraldBright }]}>VERIFIED</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, marginTop: 2, fontFamily: "Inter_400Regular", marginBottom: 14 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  listContent: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  proposalId: { fontSize: 13, fontFamily: "Inter_500Medium" },
  proposalTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  proposalDesc: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular", marginBottom: 14 },
  voteSection: { gap: 6 },
  voteRow: { flexDirection: "row", justifyContent: "space-between" },
  voteLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  votePct: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  voteBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  voteFill: { height: "100%", borderRadius: 3 },
  voteStats: { flexDirection: "row", justifyContent: "space-between" },
  voteStat: { fontSize: 11, fontFamily: "Inter_400Regular" },
  deadline: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 },
  deadlineText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  carbonHeader: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 14 },
  carbonIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  carbonMeta: { flex: 1 },
  carbonMetrics: { flexDirection: "row", gap: 16 },
  carbonMetric: { flex: 1 },
  carbonMetricVal: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  carbonMetricLabel: { fontSize: 11, marginTop: 2, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
