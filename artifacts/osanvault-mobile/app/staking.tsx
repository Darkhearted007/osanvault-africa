import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const STAKING_TIERS = [
  { name: "Bronze", emoji: "🥉", lock: 30, apr: 8, minStake: 50_000, color: "#B45309", bg: "#B4530920" },
  { name: "Silver", emoji: "🥈", lock: 90, apr: 12, minStake: 100_000, color: "#94A3B8", bg: "#94A3B820" },
  { name: "Gold", emoji: "🥇", lock: 180, apr: 18, minStake: 200_000, color: "#D97706", bg: "#D9770620" },
  { name: "Platinum", emoji: "💎", lock: 365, apr: 22, minStake: 500_000, color: "#7C3AED", bg: "#7C3AED20" },
];

const PLATFORM_STAKING = {
  totalStaked: 42_500_000,
  stakersCount: 3_841,
  osanvPrice: 0.042,
};

export default function StakingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [selectedTier, setSelectedTier] = useState(0);
  const [stakeAmount, setStakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const [isConnected] = useState(false);

  const tier = STAKING_TIERS[selectedTier];
  const parsedAmount = parseFloat(stakeAmount) || 0;
  const estimatedYearlyReward = parsedAmount * (tier.apr / 100);
  const estimatedMonthlyReward = estimatedYearlyReward / 12;

  function handleAction() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Contract Not Yet Deployed",
      "StakingVault.sol is not yet deployed to Polygon Mainnet. Staking will be available at launch.",
      [{ text: "OK" }]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>OSANV Staking</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 40 }]}
      >
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.gold }]}>
              {PLATFORM_STAKING.totalStaked.toLocaleString()}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>OSANV Staked</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.primary }]}>
              {PLATFORM_STAKING.stakersCount.toLocaleString()}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>Stakers</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.kpiVal, { color: colors.foreground }]}>
              ${PLATFORM_STAKING.osanvPrice}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>OSANV Price</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose Tier</Text>
        {STAKING_TIERS.map((t, i) => (
          <Pressable
            key={t.name}
            style={[
              styles.tierCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedTier === i ? t.color : colors.border,
                borderWidth: selectedTier === i ? 2 : 1,
              },
            ]}
            onPress={() => { setSelectedTier(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <View style={styles.tierHeader}>
              <View style={styles.tierLeft}>
                <Text style={styles.tierEmoji}>{t.emoji}</Text>
                <Text style={[styles.tierName, { color: t.color }]}>{t.name}</Text>
              </View>
              <View style={[styles.aprBadge, { backgroundColor: t.bg }]}>
                <Text style={[styles.aprText, { color: t.color }]}>{t.apr}% APR</Text>
              </View>
            </View>
            <View style={styles.tierMetrics}>
              <View style={styles.tierMetric}>
                <Text style={[styles.tierMetricVal, { color: colors.foreground }]}>{t.lock}d</Text>
                <Text style={[styles.tierMetricLabel, { color: colors.mutedForeground }]}>Lock Period</Text>
              </View>
              <View style={styles.tierMetric}>
                <Text style={[styles.tierMetricVal, { color: colors.foreground }]}>
                  {t.minStake.toLocaleString()}
                </Text>
                <Text style={[styles.tierMetricLabel, { color: colors.mutedForeground }]}>Min Stake</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <View style={[styles.stakePanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
            <Pressable
              style={[styles.tab, activeTab === "stake" && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab("stake")}
            >
              <Text style={[styles.tabText, { color: activeTab === "stake" ? colors.primaryForeground : colors.mutedForeground }]}>
                Stake
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "unstake" && { backgroundColor: colors.secondary }]}
              onPress={() => setActiveTab("unstake")}
            >
              <Text style={[styles.tabText, { color: activeTab === "unstake" ? colors.foreground : colors.mutedForeground }]}>
                Unstake
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Amount (OSANV)</Text>
          <View style={[styles.amountInput, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <TextInput
              style={[styles.amountInputText, { color: colors.foreground }]}
              placeholder={`Min ${tier.minStake.toLocaleString()}`}
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              value={stakeAmount}
              onChangeText={setStakeAmount}
            />
            <Pressable onPress={() => setStakeAmount(tier.minStake.toString())}>
              <Text style={[styles.maxBtn, { color: colors.primary }]}>MIN</Text>
            </Pressable>
          </View>

          {parsedAmount > 0 && (
            <View style={[styles.rewardEstimate, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
              <View style={styles.rewardRow}>
                <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>Monthly Yield</Text>
                <Text style={[styles.rewardVal, { color: colors.primary }]}>
                  +{Math.round(estimatedMonthlyReward).toLocaleString()} OSANV
                </Text>
              </View>
              <View style={styles.rewardRow}>
                <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>Yearly Yield</Text>
                <Text style={[styles.rewardVal, { color: colors.gold }]}>
                  +{Math.round(estimatedYearlyReward).toLocaleString()} OSANV
                </Text>
              </View>
              <View style={styles.rewardRow}>
                <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>Unlock Date</Text>
                <Text style={[styles.rewardVal, { color: colors.foreground }]}>
                  {new Date(Date.now() + tier.lock * 86400000).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          <Pressable
            style={[styles.actionBtn, { backgroundColor: isConnected ? colors.primary : colors.muted }]}
            onPress={handleAction}
          >
            <Feather name={isConnected ? "lock" : "link"} size={16} color={isConnected ? colors.primaryForeground : colors.foreground} />
            <Text style={[styles.actionBtnText, { color: isConnected ? colors.primaryForeground : colors.foreground }]}>
              {isConnected ? (activeTab === "stake" ? "Stake OSANV" : "Unstake OSANV") : "Connect Wallet"}
            </Text>
          </Pressable>

          {!isConnected && (
            <Text style={[styles.walletHint, { color: colors.mutedForeground }]}>
              Connect a Polygon-compatible wallet to stake OSANV
            </Text>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Staking locks OSANV for the full lock period. Early withdrawal is not available. Rewards are distributed on-chain at unlock.
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
  content: { paddingHorizontal: 16, gap: 16 },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  kpiVal: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  kpiLabel: { fontSize: 10, marginTop: 3, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  tierCard: { borderRadius: 14, padding: 14, gap: 12 },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tierLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  tierEmoji: { fontSize: 22 },
  tierName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  aprBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  aprText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tierMetrics: { flexDirection: "row", gap: 32 },
  tierMetric: {},
  tierMetricVal: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  tierMetricLabel: { fontSize: 11, marginTop: 2, fontFamily: "Inter_400Regular" },
  stakePanel: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  tabRow: { flexDirection: "row", borderRadius: 10, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 7, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  inputLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  amountInputText: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  maxBtn: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  rewardEstimate: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  rewardRow: { flexDirection: "row", justifyContent: "space-between" },
  rewardLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rewardVal: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  walletHint: { fontSize: 12, textAlign: "center", fontFamily: "Inter_400Regular" },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular", flex: 1 },
});
