import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useGetPlatformStats,
  useListActivity,
  useListProperties,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import PropertyCard from '@/components/PropertyCard';
import StatCard from '@/components/StatCard';

function formatNgn(n: number): string {
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
  return `₦${n}`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const ACTIVITY_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  purchase: { name: 'arrow-down-circle', color: '#0E7C66' },
  staked: { name: 'trending-up', color: '#D4AF37' },
  retired: { name: 'leaf', color: '#22C55E' },
  issued: { name: 'add-circle', color: '#3B82F6' },
  vote: { name: 'megaphone', color: '#A78BFA' },
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetPlatformStats();
  const { data: properties, isLoading: propsLoading, refetch: refetchProps } = useListProperties();
  const { data: activity, isLoading: actLoading, refetch: refetchAct } = useListActivity({ limit: 8 });

  const isRefreshing = statsLoading || propsLoading || actLoading;

  function onRefresh() {
    refetchStats();
    refetchProps();
    refetchAct();
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            paddingBottom: 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View>
          <Text style={[styles.wordmark, { color: colors.foreground }]}>OsanVault</Text>
          <Text style={[styles.subtitle, { color: colors.gold }]}>AFRICA</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.trustChip, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' }]}>
            <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
            <Text style={[styles.trustText, { color: colors.primary }]}>Polygon</Text>
          </View>
          <View style={[styles.trustChip, { backgroundColor: colors.gold + '22', borderColor: colors.gold + '55' }]}>
            <Ionicons name="document-text" size={10} color={colors.gold} />
            <Text style={[styles.trustText, { color: colors.gold }]}>SEC ARIP</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.heroBanner, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '33' }]}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Africa's Real Estate,{'\n'}Tokenized.
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Fractional ownership from ₦1,000. Polygon blockchain. Dual land verification.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.heroBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, borderRadius: colors.radius },
            ]}
            onPress={() => router.push('/(tabs)/properties')}
            testID="browse-properties-btn"
          >
            <Feather name="arrow-right" size={16} color="#fff" />
            <Text style={styles.heroBtnText}>Browse Properties</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Platform Overview</Text>
        {statsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
        ) : stats ? (
          <View style={styles.statsGrid}>
            <StatCard label="Total TVL" value={formatNgn(stats.tvlNgn)} />
            <StatCard label="Investors" value={stats.totalInvestors.toLocaleString()} />
            <StatCard label="OSANV Staked" value={`${(stats.osanvStaked / 1e6).toFixed(1)}M`} accent />
            <StatCard label="Avg Yield" value={`${stats.avgPropertyYield}%`} accent />
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>
            Featured Properties
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/properties')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>

        {propsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
        ) : (
          <FlatList
            data={properties?.slice(0, 6) ?? []}
            keyExtractor={(p) => String(p.id)}
            renderItem={({ item }) => (
              <View style={{ marginRight: 12 }}>
                <PropertyCard property={item} compact />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
            scrollEnabled={(properties?.length ?? 0) > 0}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>
            Live Activity
          </Text>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
        </View>

        {actLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : (
          <View style={[styles.activityList, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {(activity ?? []).slice(0, 8).map((evt, i) => {
              const icon = ACTIVITY_ICONS[evt.type] ?? ACTIVITY_ICONS.purchase;
              const isLast = i === Math.min((activity?.length ?? 0) - 1, 7);
              return (
                <View key={`${evt.txHash}-${i}`}>
                  <View style={styles.actItem}>
                    <View
                      style={[
                        styles.actIconWrap,
                        { backgroundColor: icon.color + '22' },
                      ]}
                    >
                      <Ionicons name={icon.name} size={14} color={icon.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actType, { color: colors.foreground }]}>
                        {evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                        {evt.propertyName ? ` · ${evt.propertyName}` : ''}
                        {evt.projectName ? ` · ${evt.projectName}` : ''}
                      </Text>
                      <Text style={[styles.actAddr, { color: colors.mutedForeground }]}>
                        {evt.address.slice(0, 8)}…{evt.address.slice(-6)}
                      </Text>
                    </View>
                    <Text style={[styles.actTime, { color: colors.mutedForeground }]}>
                      {timeAgo(evt.timestamp)}
                    </Text>
                  </View>
                  {!isLast && <View style={[styles.actDivider, { backgroundColor: colors.border }]} />}
                </View>
              );
            })}
            {(activity?.length ?? 0) === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="pulse-outline" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No recent activity
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.trustBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {[
            { icon: 'shield-checkmark' as const, text: 'SEC ARIP Sandbox' },
            { icon: 'logo-buffer' as const, text: 'Polygon Network' },
            { icon: 'document-lock' as const, text: 'Dual Land Verified' },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.trustItem}>
              <Ionicons name={icon} size={12} color={colors.primary} />
              <Text style={[styles.trustBarText, { color: colors.mutedForeground }]}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  wordmark: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 3 },
  headerRight: { flexDirection: 'row', gap: 6 },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  trustText: { fontSize: 9, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 0 },
  heroBanner: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSub: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 16 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  heroBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 20 },
  seeAll: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  activityList: { borderWidth: 1 },
  actItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  actIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actType: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  actAddr: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  actTime: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  actDivider: { height: 1, marginLeft: 52 },
  emptyState: { alignItems: 'center', padding: 24, gap: 8 },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  trustBar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, padding: 12, borderWidth: 1 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustBarText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
});
