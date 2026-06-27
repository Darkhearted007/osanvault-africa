import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import type { CarbonProject } from '@workspace/api-client-react';

type Props = { project: CarbonProject };

const CARBON_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=70',
  2: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=70',
  3: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=800&q=70',
  4: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=70',
  5: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=70',
};

function formatCredits(value: string): string {
  const num = parseFloat(value) / 1e18;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
}

export default function CarbonCard({ project }: Props) {
  const colors = useColors();
  const photoUrl = CARBON_PHOTOS[project.id];
  const retiredPct =
    project.totalIssued !== '0'
      ? Math.min(100, (parseFloat(project.totalRetired) / parseFloat(project.totalIssued)) * 100)
      : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={[styles.photoContainer, { backgroundColor: colors.primary + '22' }]}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.60)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.photoOverlay}>
          <View style={styles.photoLeft}>
            <Text style={styles.photoFlag}>{project.flag}</Text>
            <View>
              <Text style={styles.photoName} numberOfLines={1}>{project.name}</Text>
              <Text style={styles.photoRegion}>{project.region} · {project.vintage}</Text>
            </View>
          </View>
          <View
            style={[
              styles.verBadge,
              {
                backgroundColor: project.verified ? 'rgba(14,124,102,0.85)' : 'rgba(0,0,0,0.45)',
                borderColor: project.verified ? colors.primary + '99' : 'rgba(255,255,255,0.25)',
              },
            ]}
          >
            <Ionicons
              name={project.verified ? 'shield-checkmark' : 'time-outline'}
              size={10}
              color="#fff"
            />
            <Text style={styles.verText}>
              {project.verified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {project.description}
        </Text>

        <View style={[styles.row, { gap: 0, marginVertical: 10 }]}>
          <View style={styles.creditStat}>
            <Text style={[styles.creditVal, { color: colors.foreground }]}>
              {formatCredits(project.totalIssued)} tCO₂
            </Text>
            <Text style={[styles.creditLbl, { color: colors.mutedForeground }]}>Issued</Text>
          </View>
          <View style={[styles.creditSep, { backgroundColor: colors.border }]} />
          <View style={styles.creditStat}>
            <Text style={[styles.creditVal, { color: colors.primary }]}>
              {formatCredits(project.totalRetired)} tCO₂
            </Text>
            <Text style={[styles.creditLbl, { color: colors.mutedForeground }]}>Retired</Text>
          </View>
          <View style={[styles.creditSep, { backgroundColor: colors.border }]} />
          <View style={styles.creditStat}>
            <Text style={[styles.creditVal, { color: colors.gold }]}>{project.methodology}</Text>
            <Text style={[styles.creditLbl, { color: colors.mutedForeground }]}>Standard</Text>
          </View>
        </View>

        <View style={[styles.track, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.fill,
              { width: `${retiredPct}%` as `${number}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <View style={styles.rowBetween}>
          <Text style={[styles.creditLbl, { color: colors.mutedForeground }]}>
            Retirement progress
          </Text>
          <Text style={[styles.creditLbl, { color: colors.mutedForeground }]}>
            {retiredPct.toFixed(1)}%
          </Text>
        </View>

        {project.linkedPropertyId != null && (
          <View style={[styles.linkedChip, { backgroundColor: colors.gold + '18', borderColor: colors.gold + '44' }]}>
            <Ionicons name="link" size={10} color={colors.gold} />
            <Text style={[styles.linkedText, { color: colors.gold }]}>
              Linked to Property #{project.linkedPropertyId}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: 1, marginBottom: 12 },
  photoContainer: { height: 110, overflow: 'hidden' },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 10,
  },
  photoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  photoFlag: { fontSize: 22 },
  photoName: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold', flex: 1 },
  photoRegion: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  verBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  verText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  body: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  desc: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  creditStat: { flex: 1, alignItems: 'center' },
  creditVal: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  creditLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  creditSep: { width: 1, height: 30 },
  track: { height: 4, borderRadius: 99, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 99 },
  linkedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  linkedText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
});
