import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import type { Property } from '@workspace/api-client-react';
import ProgressBar from './ProgressBar';

type Props = { property: Property; compact?: boolean };

function formatNgn(n: number): string {
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
  return `₦${n}`;
}

export default function PropertyCard({ property, compact = false }: Props) {
  const colors = useColors();
  const pct = Math.min(100, (property.raised / property.targetRaise) * 100);

  const statusColor =
    property.status === 'live'
      ? colors.success
      : property.status === 'funding'
      ? colors.accent
      : colors.mutedForeground;
  const statusLabel =
    property.status === 'live'
      ? 'Live'
      : property.status === 'funding'
      ? 'Funding'
      : 'Closed';

  return (
    <Pressable
      testID={`property-card-${property.id}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          width: compact ? 260 : undefined,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        router.push(`/property/${property.id}`);
      }}
    >
      <View style={[styles.topBar, { backgroundColor: property.gradientFrom }]} />
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Text style={styles.flag}>{property.flag}</Text>
            <View style={[styles.badge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {property.type}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                borderColor: statusColor + '55',
                backgroundColor: statusColor + '20',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {property.name}
        </Text>
        <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
          {property.location}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: colors.primary }]}>
              {property.yieldApy}%
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>APY</Text>
          </View>
          <View style={[styles.statSep, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: colors.gold }]}>
              {formatNgn(property.tokenPrice)}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>/ token</Text>
          </View>
          <View style={[styles.statSep, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: colors.primary }]}>
              {property.carbonOffsetTonnes.toLocaleString()}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>tCO₂/yr</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.rowBetween}>
            <Text style={[styles.raisedText, { color: colors.mutedForeground }]}>
              {formatNgn(property.raised)} raised
            </Text>
            <Text style={[styles.raisedText, { color: colors.mutedForeground }]}>
              {pct.toFixed(0)}%
            </Text>
          </View>
          <ProgressBar value={pct} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  topBar: { height: 3 },
  body: { padding: 14 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 20 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  name: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 2, lineHeight: 20 },
  location: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  divider: { height: 1, marginBottom: 10 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  statLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statSep: { width: 1, height: 26 },
  progressSection: { gap: 5 },
  raisedText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
