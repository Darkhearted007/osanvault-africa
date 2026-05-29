import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import type { CarbonProject } from '@workspace/api-client-react';

type Props = { project: CarbonProject };

function formatCredits(value: string): string {
  const num = parseFloat(value) / 1e18;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
}

export default function CarbonCard({ project }: Props) {
  const colors = useColors();
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
      <View style={styles.header}>
        <View style={styles.row}>
          <Text style={styles.flag}>{project.flag}</Text>
          <View>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {project.name}
            </Text>
            <Text style={[styles.region, { color: colors.mutedForeground }]}>
              {project.region} · {project.vintage}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.verBadge,
            {
              backgroundColor: project.verified ? colors.primary + '22' : colors.muted,
              borderColor: project.verified ? colors.primary + '55' : colors.border,
            },
          ]}
        >
          <Ionicons
            name={project.verified ? 'shield-checkmark' : 'time-outline'}
            size={10}
            color={project.verified ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.verText,
              { color: project.verified ? colors.primary : colors.mutedForeground },
            ]}
          >
            {project.verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>

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
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  flag: { fontSize: 24 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold', flex: 1 },
  region: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  verBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  verText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
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
