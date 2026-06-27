import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import type { Property } from '@workspace/api-client-react';
import ProgressBar from './ProgressBar';

type Props = { property: Property; compact?: boolean };

const PROPERTY_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=70',
  2: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=70',
  3: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=70',
  4: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=70',
  5: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=70',
  6: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=70',
};

function formatNgn(n: number): string {
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
  return `₦${n}`;
}

export default function PropertyCard({ property, compact = false }: Props) {
  const colors = useColors();
  const pct = Math.min(100, (property.raised / property.targetRaise) * 100);
  const photoUrl = PROPERTY_PHOTOS[property.id];
  const imageHeight = compact ? 110 : 150;

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
      <View style={[styles.imageContainer, { height: imageHeight, backgroundColor: property.gradientFrom }]}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.imageOverlay}>
          <View
            style={[
              styles.statusPill,
              {
                borderColor: statusColor + '88',
                backgroundColor: 'rgba(0,0,0,0.45)',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: '#fff' }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.flag}>{property.flag}</Text>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {property.type}
            </Text>
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
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  body: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
