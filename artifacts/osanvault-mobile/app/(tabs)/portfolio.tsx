import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

const PROPERTY_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?auto=format&fit=crop&w=400&q=70',
  2: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=70',
  3: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=400&q=70',
  4: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=400&q=70',
  5: 'https://images.unsplash.com/photo-1555436169-f2f2ec4748b4?auto=format&fit=crop&w=400&q=70',
  6: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=70',
};

const CARBON_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=70',
  2: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=70',
  3: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=400&q=70',
  4: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=400&q=70',
  5: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=400&q=70',
};

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

const HISTORY_COLORS: Record<string, string> = {
  purchase: '#0E7C66',
  staked: '#D4AF37',
  retired: '#3B82F6',
};

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
        {tab === 'Properties' && MOCK_HOLDINGS.map((h) => {
          const photo = PROPERTY_PHOTOS[h.id];
          const earned = (h.tokens * h.tokenPrice * h.yieldApy) / 100 / 12;
          return (
            <View
              key={h.id}
              style={[styles.propCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <View style={[styles.propPhoto, { backgroundColor: colors.primary + '22' }]}>
                {photo ? (
                  <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                ) : null}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.55)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.propPhotoOverlay}>
                  <Text style={styles.propFlag}>{h.flag}</Text>
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: h.status === 'live' ? colors.primary : colors.gold },
                    ]}
                  >
                    <Text style={styles.statusText}>{h.status === 'live' ? 'Live' : 'Funding'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.propBody}>
                <Text style={[styles.propName, { color: colors.foreground }]} numberOfLines={1}>
                  {h.name}
                </Text>
                <Text style={[styles.propMeta, { color: colors.mutedForeground }]}>
                  {h.tokens} tokens · {h.yieldApy}% APY
                </Text>

                <View style={styles.propStats}>
                  <View style={styles.propStat}>
                    <Text style={[styles.propStatVal, { color: colors.primary }]}>
                      {formatNgn(h.tokens * h.tokenPrice)}
                    </Text>
                    <Text style={[styles.propStatLbl, { color: colors.mutedForeground }]}>Value</Text>
                  </View>
                  <View style={[styles.propStatSep, { backgroundColor: colors.border }]} />
                  <View style={styles.propStat}>
                    <Text style={[styles.propStatVal, { color: colors.gold }]}>{formatNgn(earned)}/mo</Text>
                    <Text style={[styles.propStatLbl, { color: colors.mutedForeground }]}>Income</Text>
                  </View>
                </View>

                <ProgressBar value={((h.tokens * h.tokenPrice) / 200_000) * 100} height={3} />
                <Text style={[styles.progressLbl, { color: colors.mutedForeground }]}>
                  {((h.tokens * h.tokenPrice) / 200_000 * 100).toFixed(0)}% of allocation
                </Text>
              </View>
            </View>
          );
        })}

        {tab === 'Carbon' && MOCK_CARBON_HOLDINGS.map((c) => {
          const photo = CARBON_PHOTOS[c.id];
          return (
            <View
              key={c.id}
              style={[styles.carbonCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <View style={[styles.carbonPhoto, { backgroundColor: colors.primary + '22' }]}>
                {photo ? (
                  <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                ) : null}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.65)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.carbonOverlay}>
                  <View>
                    <Text style={styles.carbonName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.carbonMeta}>{c.methodology}</Text>
                  </View>
                  <View style={[styles.verBadge, { backgroundColor: c.verified ? 'rgba(14,124,102,0.85)' : 'rgba(0,0,0,0.5)' }]}>
                    <Ionicons name={c.verified ? 'shield-checkmark' : 'time-outline'} size={10} color="#fff" />
                    <Text style={styles.verText}>{c.verified ? 'Verified' : 'Pending'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.carbonBody}>
                <View style={styles.carbonRow}>
                  <View style={[styles.leafCircle, { backgroundColor: colors.primary + '22' }]}>
                    <Ionicons name="leaf" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.creditLabel, { color: colors.mutedForeground }]}>Credits held</Text>
                    <Text style={[styles.creditVal, { color: colors.primary }]}>
                      {c.credits} tCO₂
                    </Text>
                  </View>
                  <View style={[styles.creditValBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '33' }]}>
                    <Text style={[styles.creditValText, { color: colors.primary }]}>
                      ~{(c.credits * 12.5).toLocaleString()} OSANV
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {tab === 'Staking' && (
          <View
            style={[styles.stakingCard, { backgroundColor: colors.card, borderColor: '#D4AF3755', borderRadius: colors.radius }]}
          >
            <View style={[styles.stakingHeader, { borderBottomColor: '#D4AF3733' }]}>
              <View style={[styles.tierBadge, { backgroundColor: colors.gold + '22', borderColor: colors.gold + '44' }]}>
                <Ionicons name="trophy" size={18} color={colors.gold} />
                <Text style={[styles.stakingTier, { color: colors.gold }]}>{MOCK_STAKING.tier} Tier</Text>
              </View>
              <Text style={[styles.stakingApr, { color: colors.foreground }]}>{MOCK_STAKING.apr}% APR</Text>
            </View>

            <View style={styles.stakingGrid}>
              {[
                { label: 'Staked', value: `${(MOCK_STAKING.amount / 1e3).toFixed(0)}K OSANV`, color: colors.gold },
                { label: 'Earned', value: `${(MOCK_STAKING.earned / 1e3).toFixed(1)}K OSANV`, color: colors.primary },
                { label: 'Lock period', value: `${MOCK_STAKING.lockDays} days`, color: colors.foreground },
                { label: 'Remaining', value: `${MOCK_STAKING.daysRemaining} days`, color: colors.mutedForeground },
              ].map(({ label, value, color }) => (
                <View key={label} style={[styles.stakingCell, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Text style={[styles.stakingVal, { color }]}>{value}</Text>
                  <Text style={[styles.stakingLbl, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.lockSection}>
              <View style={styles.lockLabelRow}>
                <Text style={[styles.lockLbl, { color: colors.mutedForeground }]}>Lock progress</Text>
                <Text style={[styles.lockPct, { color: colors.gold }]}>
                  {(((MOCK_STAKING.lockDays - MOCK_STAKING.daysRemaining) / MOCK_STAKING.lockDays) * 100).toFixed(0)}%
                </Text>
              </View>
              <ProgressBar
                value={((MOCK_STAKING.lockDays - MOCK_STAKING.daysRemaining) / MOCK_STAKING.lockDays) * 100}
                color={colors.gold}
                height={6}
              />
              <Text style={[styles.lockText, { color: colors.mutedForeground }]}>
                {MOCK_STAKING.daysRemaining} days until unlock · {MOCK_STAKING.lockDays - MOCK_STAKING.daysRemaining} days elapsed
              </Text>
            </View>
          </View>
        )}

        {tab === 'History' && MOCK_HISTORY.map((h, i) => {
          const accentColor = HISTORY_COLORS[h.type] ?? colors.primary;
          return (
            <View
              key={i}
              style={[styles.histItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <View style={[styles.histIcon, { backgroundColor: accentColor + '22', borderColor: accentColor + '44' }]}>
                <Ionicons name={h.icon} size={16} color={accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.histLabel, { color: colors.foreground }]} numberOfLines={1}>
                  {h.label}
                </Text>
                <Text style={[styles.histDate, { color: colors.mutedForeground }]}>{h.date}</Text>
              </View>
              <View style={[styles.histAmountBox, { backgroundColor: accentColor + '15' }]}>
                <Text style={[styles.histAmount, { color: accentColor }]}>{h.amount}</Text>
              </View>
            </View>
          );
        })}
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

  propCard: { overflow: 'hidden', borderWidth: 1 },
  propPhoto: { height: 90, overflow: 'hidden' },
  propPhotoOverlay: { position: 'absolute', bottom: 8, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  propFlag: { fontSize: 22 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff' },
  propBody: { padding: 12, gap: 6 },
  propName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  propMeta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  propStats: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  propStat: { flex: 1, alignItems: 'center' },
  propStatVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  propStatLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  propStatSep: { width: 1, height: 30 },
  progressLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'right' },

  carbonCard: { overflow: 'hidden', borderWidth: 1 },
  carbonPhoto: { height: 80, overflow: 'hidden' },
  carbonOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 10 },
  carbonName: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold', maxWidth: 220 },
  carbonMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  verBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  verText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  carbonBody: { padding: 12 },
  carbonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  leafCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  creditLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  creditVal: { fontSize: 15, fontFamily: 'Inter_700Bold', marginTop: 1 },
  creditValBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  creditValText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

  stakingCard: { padding: 16, borderWidth: 2, gap: 14 },
  stakingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  stakingTier: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  stakingApr: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  stakingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stakingCell: { flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 12, borderRadius: 8, borderWidth: 1 },
  stakingVal: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  stakingLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  lockSection: { gap: 6 },
  lockLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lockLbl: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  lockPct: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  lockText: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  histItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1 },
  histIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  histLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  histDate: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  histAmountBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  histAmount: { fontSize: 12, fontFamily: 'Inter_700Bold' },
});
