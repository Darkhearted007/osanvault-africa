import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetPlatformStats } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import StakingTierCard, { type StakingTier } from '@/components/StakingTierCard';

const TIERS: StakingTier[] = [
  { name: 'Bronze', apr: 8, lockDays: 30, minStake: 50_000 },
  { name: 'Silver', apr: 12, lockDays: 90, minStake: 100_000 },
  { name: 'Gold', apr: 18, lockDays: 180, minStake: 200_000 },
  { name: 'Platinum', apr: 22, lockDays: 365, minStake: 500_000 },
];

export default function StakingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const { data: stats } = useGetPlatformStats();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Staking</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Lock OSANV, earn yield + governance weight
            </Text>
          </View>
          <View style={[styles.tokenBadge, { backgroundColor: colors.gold + '22', borderColor: colors.gold + '55' }]}>
            <Ionicons name="diamond" size={12} color={colors.gold} />
            <Text style={[styles.tokenText, { color: colors.gold }]}>OSANV</Text>
          </View>
        </View>

        {stats && (
          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.gold }]}>
                {(stats.osanvStaked / 1e6).toFixed(1)}M
              </Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>OSANV Staked</Text>
            </View>
            <View style={[styles.statSep, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.primary }]}>8–22%</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>APR Range</Text>
            </View>
            <View style={[styles.statSep, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.foreground }]}>4</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Tiers</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '33' }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Staking rewards accrue from FeeRouter allocation (40% of platform fees). Contracts are in testnet — staking is simulated until mainnet launch.
          </Text>
        </View>

        {TIERS.map((tier) => (
          <StakingTierCard key={tier.name} tier={tier} />
        ))}

        <View style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.feeTitle, { color: colors.foreground }]}>FeeRouter Distribution</Text>
          {[
            { label: 'Staking Rewards', pct: '40%', color: colors.primary },
            { label: 'Treasury', pct: '30%', color: colors.gold },
            { label: 'OSANV Burn', pct: '20%', color: colors.destructive },
            { label: 'Team', pct: '10%', color: colors.mutedForeground },
          ].map(({ label, pct, color }) => (
            <View key={label} style={styles.feeRow}>
              <View style={[styles.feeDot, { backgroundColor: color }]} />
              <Text style={[styles.feeLbl, { color: colors.mutedForeground }]}>{label}</Text>
              <Text style={[styles.feePct, { color }]}>{pct}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  tokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  tokenText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  statsRow: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  statLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statSep: { width: 1 },
  body: { padding: 16, gap: 0 },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  feeCard: { padding: 14, borderWidth: 1, marginTop: 4 },
  feeTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  feeDot: { width: 8, height: 8, borderRadius: 4 },
  feeLbl: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  feePct: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
