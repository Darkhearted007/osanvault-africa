import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetProperty } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import ProgressBar from '@/components/ProgressBar';

function formatNgn(n: number): string {
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
  return `₦${n}`;
}

export default function PropertyDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { id } = useLocalSearchParams<{ id: string }>();
  const [qty, setQty] = useState('1');

  const { data: property, isLoading, isError } = useGetProperty(Number(id));

  const pct = property
    ? Math.min(100, (property.raised / property.targetRaise) * 100)
    : 0;

  const totalCost = property ? Number(qty || '0') * property.tokenPrice : 0;

  function handleBuy() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Testnet Simulation',
      `Purchasing ${qty} token(s) of ${property?.name} for ${formatNgn(totalCost)}.\n\nContract not deployed on mainnet yet. Transaction will be live after mainnet launch.`,
      [{ text: 'OK' }]
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading property...</Text>
      </View>
    );
  }

  if (isError || !property) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Property not found</Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const statusColor =
    property.status === 'live'
      ? colors.success
      : property.status === 'funding'
      ? colors.gold
      : colors.mutedForeground;

  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.heroHeader,
          {
            backgroundColor: property.gradientFrom,
            paddingTop: topPad + 8,
          },
        ]}
      >
        <View style={styles.heroNav}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.navBtn, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <View style={styles.heroTags}>
            <Text style={styles.heroFlag}>{property.flag}</Text>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
              <Text style={styles.heroBadgeText}>{property.type}</Text>
            </View>
            <View
              style={[
                styles.heroStatus,
                { borderColor: statusColor + '88', backgroundColor: statusColor + '33' },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.heroStatusText, { color: statusColor }]}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.heroName}>{property.name}</Text>
        <Text style={styles.heroLoc}>{property.location}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 34 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          {[
            { label: 'Token Price', value: formatNgn(property.tokenPrice), color: colors.gold },
            { label: 'Annual Yield', value: `${property.yieldApy}% APY`, color: colors.primary },
            { label: 'Total Supply', value: `${(property.totalTokens / 1e3).toFixed(0)}K`, color: colors.foreground },
            { label: 'Carbon Offset', value: `${property.carbonOffsetTonnes.toLocaleString()} tCO₂`, color: colors.primary },
          ].map(({ label, value, color }) => (
            <View
              key={label}
              style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <Text style={[styles.statBoxVal, { color }]} numberOfLines={1} adjustsFontSizeToFit>
                {value}
              </Text>
              <Text style={[styles.statBoxLbl, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Funding Progress</Text>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {formatNgn(property.raised)} raised
            </Text>
            <Text style={[styles.progressText, { color: colors.primary }]}>
              {pct.toFixed(1)}% of {formatNgn(property.targetRaise)}
            </Text>
          </View>
          <ProgressBar value={pct} height={8} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {property.description}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Legal & Compliance</Text>
          {[
            { label: 'Size', value: property.size },
            { label: 'Jurisdiction', value: property.jurisdiction },
            { label: 'Indigenous Authority', value: property.indigenousAuthority },
            { label: 'Legal Doc CID', value: property.legalDocCid, mono: true },
          ].map(({ label, value, mono }) => (
            <View key={label} style={[styles.infoRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <Text
                style={[styles.infoValue, { color: colors.foreground, fontFamily: mono ? 'Inter_400Regular' : 'Inter_500Medium' }]}
                numberOfLines={1}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.trustSection, { borderColor: colors.border }]}>
          {[
            { icon: 'shield-checkmark' as const, text: 'SEC ARIP Sandbox', color: colors.primary },
            { icon: 'logo-buffer' as const, text: 'Polygon Network', color: colors.primary },
            { icon: 'document-lock' as const, text: 'Dual Land Verified', color: colors.primary },
          ].map(({ icon, text, color }) => (
            <View key={text} style={styles.trustItem}>
              <Ionicons name={icon} size={12} color={color} />
              <Text style={[styles.trustText, { color: colors.mutedForeground }]}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.buyBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: isWeb ? 34 : insets.bottom + 8,
          },
        ]}
      >
        <View style={[styles.qtyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.qtyLabel, { color: colors.mutedForeground }]}>Tokens</Text>
          <TextInput
            style={[styles.qtyInput, { color: colors.foreground }]}
            value={qty}
            onChangeText={(t) => setQty(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            selectTextOnFocus
            maxLength={6}
          />
        </View>
        <Pressable
          testID="buy-fractions-btn"
          style={({ pressed }) => [
            styles.buyBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
              borderRadius: colors.radius,
              flex: 1,
            },
          ]}
          onPress={handleBuy}
        >
          <View style={styles.buyBtnInner}>
            <Text style={styles.buyBtnLabel}>Buy Fractions</Text>
            <Text style={styles.buyBtnAmount}>{formatNgn(totalCost)}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  backBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  heroHeader: { paddingHorizontal: 16, paddingBottom: 18 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  navBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heroTags: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroFlag: { fontSize: 22 },
  heroBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_500Medium' },
  heroStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  heroStatusText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  heroName: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 28, letterSpacing: -0.5, marginBottom: 4 },
  heroLoc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statBox: { flex: 1, minWidth: '45%', padding: 12, borderWidth: 1, alignItems: 'center', gap: 3 },
  statBoxVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  statBoxLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  section: { padding: 14, borderWidth: 1, marginBottom: 10, gap: 6 },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  description: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, gap: 12 },
  infoLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 12, flex: 1, textAlign: 'right' },
  trustSection: { flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderRadius: 10, padding: 12 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  buyBar: { borderTopWidth: 1, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  qtyBox: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, minWidth: 80, alignItems: 'center' },
  qtyLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  qtyInput: { fontSize: 20, fontFamily: 'Inter_700Bold', textAlign: 'center', width: 60 },
  buyBtn: { paddingVertical: 14, alignItems: 'center' },
  buyBtnInner: { alignItems: 'center' },
  buyBtnLabel: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
  buyBtnAmount: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
});
