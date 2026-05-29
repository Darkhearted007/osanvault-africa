import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListCarbonProjects } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import CarbonCard from '@/components/CarbonCard';

function formatCreditsTotal(projects: { totalIssued: string; totalRetired: string }[]): {
  issued: string;
  retired: string;
} {
  const totalIssued = projects.reduce((acc, p) => acc + parseFloat(p.totalIssued), 0);
  const totalRetired = projects.reduce((acc, p) => acc + parseFloat(p.totalRetired), 0);
  const fmtIssuedNum = totalIssued / 1e18;
  const fmtRetiredNum = totalRetired / 1e18;
  const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toFixed(0));
  return { issued: fmt(fmtIssuedNum), retired: fmt(fmtRetiredNum) };
}

export default function CarbonScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const { data: projects, isLoading, isError, refetch } = useListCarbonProjects();

  const totals = projects ? formatCreditsTotal(projects) : null;

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
            <Text style={[styles.title, { color: colors.foreground }]}>Carbon Credits</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Verified African climate projects
            </Text>
          </View>
          <View style={[styles.leafBadge, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '44' }]}>
            <Ionicons name="leaf" size={14} color={colors.primary} />
            <Text style={[styles.leafText, { color: colors.primary }]}>OsanCarbon</Text>
          </View>
        </View>

        {totals && (
          <View style={[styles.statRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{totals.issued} tCO₂</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Total Issued</Text>
            </View>
            <View style={[styles.statSep, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.primary }]}>{totals.retired} tCO₂</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Total Retired</Text>
            </View>
            <View style={[styles.statSep, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: colors.gold }]}>{projects?.length ?? 0}</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Projects</Text>
            </View>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Failed to load carbon projects
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={projects ?? []}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <CarbonCard project={item} />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: isWeb ? 34 : insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!projects?.length}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="leaf-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
                No carbon projects found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  leafBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  leafText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statRow: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  statLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statSep: { width: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
