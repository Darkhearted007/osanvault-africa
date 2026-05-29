import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import ProgressBar from '@/components/ProgressBar';

const TABS = ['Properties', 'Carbon', 'Staking', 'History'] as const;
type Tab = typeof TABS[number];

const MOCK_HOLDINGS = [
  { id: 1, name: 'Ekiti LandBank Phase 1', flag: '🇳🇬', tokens: 50, tokenPrice: 1_000, yieldApy: 14.5, status: 'live' },
  { id: 3, name: 'Abuja Premium Residences', flag: '🇳🇬', tokens: 20, tokenPrice: 5_000, yieldApy: 11.2, status: 'funding' },
];

const MOCK_CARBON_HOLDINGS = [
  { id: 1, name: 'Congo Basin Reforestation', credits: 250, methodology: 'VCS', verified: true },
  { id: 2, name: 'Lagos Solar Energy Credits', credits: 96, methodology: 'Gold Standard', verified: true },
];

const MOCK_STAKING = {
  tier: 'Gold',
  amount: 200_000,
  apr: 18,
  lockDays: 180,
  daysRemaining: 97,
  earned: 14_440,
};

const MOCK_HISTORY = [
  { type: 'purchase', label: 'Bought 50 tokens — Ekiti LandBank', amount: '₦50K', date: '3 days ago', icon: 'arrow-down-circle' as const },
  { type: 'staked', label: 'Staked 200K OSANV — Gold Tier', amount: '200K OSANV', date: '8 days ago', icon: 'trending-up' as const },
  { type: 'purchase', label: 'Bought 20 tokens — Abuja Premium', amount: '₦100K', date: '14 days ago', icon: 'arrow-down-circle' as const },
  { type: 'retired', label: 'Retired 50 tCO₂ — Congo Basin', amount: '50 tCO₂', date: '21 days ago', icon: 'leaf' as const },
];

function formatNgn(n: number): string {
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
  return `₦${n}`;
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const [tab, setTab] = useState<Tab>('Properties');

  const totalValue = MOCK_HOLDINGS.reduce((acc, h) => acc + h.tokens * h.tokenPrice, 0);
  const totalEarned = MOCK_HOLDINGS.reduce(
    (acc, h) => acc + (h.tokens * h.tokenPrice * h.yieldApy) / 100 / 12,
    0
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
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
            <Text style={[styles.title, { color: colors.foreground }]}>Portfolio</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Simulation — connect wallet on mainnet
            </Text>
          </View>
          <View style={[styles.simBadge, { backgroundColor: colors.gold + '22', borderColor: colors.gold + '44' }]}>
            <Ionicons name="time-outline" size={10} color={colors.gold} />
            <Text style={[styles.simText, { color: colors.gold }]}>Testnet</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.primary }]}>{formatNgn(totalValue)}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Total Value</Text>
          </View>
          <View style={[styles.summarySep, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.gold }]}>{formatNgn(totalEarned)}</Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Est. Monthly</Text>
          </View>
          <View style={[styles.summarySep, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>
              {MOCK_STAKING.amount >= 1e6
                ? `${(MOCK_STAKING.amount / 1e6).toFixed(1)}M`
                : `${(MOCK_STAKING.amount / 1e3).toFixed(0)}K`}
            </Text>
            <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>OSANV Locked</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
        >
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 20,
                  },
                ]}
              >
                <Text style={[styles.tabText, { color: active ? '#fff' : colors.mutedForeground }]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 34 : insets.bottom + 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'Properties' && MOCK_HOLDINGS.map((h) => (
          <View
            key={h.id}
            style={[styles.holdingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={styles.holdingHeader}>
              <Text style={styles.holdingFlag}>{h.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.holdingName, { color: colors.foreground }]} numberOfLines={1}>
                  {h.name}
                </Text>
                <Text style={[styles.holdingMeta, { color: colors.mutedForeground }]}>
                  {h.tokens} tokens · {h.yieldApy}% APY
                </Text>
              </View>
              <View style={styles.holdingRight}>
                <Text style={[styles.holdingVal, { color: colors.primary }]}>
                  {formatNgn(h.tokens * h.tokenPrice)}
                </Text>
                <Text style={[styles.holdingLbl, { color: colors.mutedForeground }]}>Value</Text>
              </View>
            </View>
            <ProgressBar value={((h.tokens * h.tokenPrice) / 200_000) * 100} height={3} />
          </View>
        ))}

        {tab === 'Carbon' && MOCK_CARBON_HOLDINGS.map((c) => (
          <View
            key={c.id}
            style={[styles.holdingCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={styles.holdingHeader}>
              <View style={[styles.leafIcon, { backgroundColor: colors.primary + '22' }]}>
                <Ionicons name="leaf" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.holdingName, { color: colors.foreground }]} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={[styles.holdingMeta, { color: colors.mutedForeground }]}>
                  {c.methodology} · {c.verified ? 'Verified' : 'Pending'}
                </Text>
              </View>
              <View style={styles.holdingRight}>
                <Text style={[styles.holdingVal, { color: colors.primary }]}>{c.credits}</Text>
                <Text style={[styles.holdingLbl, { color: colors.mutedForeground }]}>tCO₂</Text>
              </View>
            </View>
          </View>
        ))}

        {tab === 'Staking' && (
          <View
            style={[styles.stakingCard, { backgroundColor: colors.card, borderColor: '#D4AF3755', borderRadius: colors.radius }]}
          >
            <View style={styles.stakingHeader}>
              <Ionicons name="trophy" size={20} color={colors.gold} />
              <Text style={[styles.stakingTier, { color: colors.gold }]}>{MOCK_STAKING.tier} Tier</Text>
              <Text style={[styles.stakingApr, { color: colors.foreground }]}>{MOCK_STAKING.apr}% APR</Text>
            </View>
            <View style={styles.stakingGrid}>
              {[
                { label: 'Staked', value: `${(MOCK_STAKING.amount / 1e3).toFixed(0)}K OSANV`, color: colors.gold },
                { label: 'Earned', value: `${(MOCK_STAKING.earned / 1e3).toFixed(1)}K OSANV`, color: colors.primary },
                { label: 'Lock', value: `${MOCK_STAKING.lockDays}d`, color: colors.foreground },
                { label: 'Remaining', value: `${MOCK_STAKING.daysRemaining}d`, color: colors.mutedForeground },
              ].map(({ label, value, color }) => (
                <View key={label} style={[styles.stakingCell, { borderColor: colors.border }]}>
                  <Text style={[styles.stakingVal, { color }]}>{value}</Text>
                  <Text style={[styles.stakingLbl, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>
            <ProgressBar
              value={((MOCK_STAKING.lockDays - MOCK_STAKING.daysRemaining) / MOCK_STAKING.lockDays) * 100}
              color={colors.gold}
              height={4}
            />
            <Text style={[styles.lockText, { color: colors.mutedForeground }]}>
              {MOCK_STAKING.daysRemaining} days until unlock
            </Text>
          </View>
        )}

        {tab === 'History' && MOCK_HISTORY.map((h, i) => (
          <View
            key={i}
            style={[styles.histItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={[styles.histIcon, { backgroundColor: colors.primary + '22' }]}>
              <Ionicons name={h.icon} size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.histLabel, { color: colors.foreground }]} numberOfLines={1}>
                {h.label}
              </Text>
              <Text style={[styles.histDate, { color: colors.mutedForeground }]}>{h.date}</Text>
            </View>
            <Text style={[styles.histAmount, { color: colors.foreground }]}>{h.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 0, borderBottomWidth: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  simBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  simText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  summaryCard: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  summaryVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  summaryLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  summarySep: { width: 1 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  tabText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  holdingCard: { padding: 14, borderWidth: 1, gap: 10 },
  holdingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  holdingFlag: { fontSize: 24 },
  holdingName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  holdingMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  holdingRight: { alignItems: 'flex-end' },
  holdingVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  holdingLbl: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  leafIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stakingCard: { padding: 16, borderWidth: 2, gap: 12 },
  stakingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stakingTier: { flex: 1, fontSize: 16, fontFamily: 'Inter_700Bold' },
  stakingApr: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  stakingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stakingCell: { flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  stakingVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  stakingLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  lockText: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 4 },
  histItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1 },
  histIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  histLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  histDate: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  histAmount: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
