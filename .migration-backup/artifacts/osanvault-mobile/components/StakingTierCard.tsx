import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

export type StakingTier = {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  apr: number;
  lockDays: number;
  minStake: number;
};

const TIER_COLORS: Record<string, string> = {
  Bronze: '#B87333',
  Silver: '#94A3B8',
  Gold: '#D4AF37',
  Platinum: '#A78BFA',
};

const TIER_ICONS: Record<string, 'medal-outline' | 'ribbon-outline' | 'trophy-outline' | 'diamond-outline'> = {
  Bronze: 'medal-outline',
  Silver: 'ribbon-outline',
  Gold: 'trophy-outline',
  Platinum: 'diamond-outline',
};

type Props = { tier: StakingTier };

export default function StakingTierCard({ tier }: Props) {
  const colors = useColors();
  const tierColor = TIER_COLORS[tier.name] ?? colors.primary;
  const tierIcon = TIER_ICONS[tier.name] ?? 'medal-outline';

  function handleStake() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Testnet Mode',
      `Staking ${tier.minStake.toLocaleString()} OSANV in ${tier.name} tier (${tier.apr}% APR) — contract not deployed on mainnet yet.`,
      [{ text: 'OK' }]
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: tierColor + '44',
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.topStripe, { backgroundColor: tierColor + '33' }]}>
        <View style={[styles.iconCircle, { backgroundColor: tierColor + '22', borderColor: tierColor + '55' }]}>
          <Ionicons name={tierIcon} size={22} color={tierColor} />
        </View>
        <View style={styles.tierNameRow}>
          <Text style={[styles.tierName, { color: tierColor }]}>{tier.name}</Text>
          <Text style={[styles.aprBig, { color: colors.foreground }]}>{tier.apr}% APR</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoVal, { color: colors.foreground }]}>
              {tier.lockDays} days
            </Text>
            <Text style={[styles.infoLbl, { color: colors.mutedForeground }]}>Lock period</Text>
          </View>
          <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
          <View style={styles.infoItem}>
            <Text style={[styles.infoVal, { color: colors.foreground }]}>
              {tier.minStake >= 1_000_000
                ? `${(tier.minStake / 1_000_000).toFixed(1)}M`
                : `${(tier.minStake / 1_000).toFixed(0)}K`}{' '}
              OSANV
            </Text>
            <Text style={[styles.infoLbl, { color: colors.mutedForeground }]}>Min stake</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.stakeBtn,
            {
              backgroundColor: tierColor,
              opacity: pressed ? 0.8 : 1,
              borderRadius: colors.radius - 2,
            },
          ]}
          onPress={handleStake}
          testID={`stake-btn-${tier.name}`}
        >
          <Text style={[styles.stakeBtnText, { color: '#000' }]}>Stake {tier.name}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  topStripe: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierNameRow: { flex: 1 },
  tierName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  aprBig: { fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 1 },
  body: { padding: 14, paddingTop: 10 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  infoLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  infoSep: { width: 1, height: 30 },
  stakeBtn: { paddingVertical: 12, alignItems: 'center' },
  stakeBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
