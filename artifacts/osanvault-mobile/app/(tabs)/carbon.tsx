import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import * as Haptics from 'expo-haptics';
import { useListCarbonProjects } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import CarbonCard from '@/components/CarbonCard';
import type { CarbonProject } from '@workspace/api-client-react';

const TABS = ['Browse', 'Invest', 'Retire'] as const;
type Tab = typeof TABS[number];

const CARBON_PHOTOS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=70',
  2: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=70',
  3: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=400&q=70',
  4: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=400&q=70',
  5: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=400&q=70',
};

const CREDIT_PRICE_NGN = 12_500;

function formatCreditsTotal(projects: { totalIssued: string; totalRetired: string }[]): { issued: string; retired: string } {
  const totalIssued = projects.reduce((acc, p) => acc + parseFloat(p.totalIssued), 0);
  const totalRetired = projects.reduce((acc, p) => acc + parseFloat(p.totalRetired), 0);
  const fmt = (n: number) => (n / 1e18 >= 1e6 ? `${(n / 1e18 / 1e6).toFixed(2)}M` : n / 1e18 >= 1e3 ? `${(n / 1e18 / 1e3).toFixed(1)}K` : (n / 1e18).toFixed(0));
  return { issued: fmt(totalIssued), retired: fmt(totalRetired) };
}

function InvestCard({ project }: { project: CarbonProject }) {
  const colors = useColors();
  const [qty, setQty] = useState('10');
  const photo = CARBON_PHOTOS[project.id];
  const qtyNum = Math.max(0, parseFloat(qty) || 0);
  const totalNgn = qtyNum * CREDIT_PRICE_NGN;

  function handleBuy() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Testnet Simulation',
      `Purchasing ${qtyNum} tCO₂e from "${project.name}" for ₦${totalNgn.toLocaleString()}.\n\nContracts are not deployed on mainnet yet — this is a simulated transaction.`,
      [{ text: 'OK' }]
    );
  }

  return (
    <View style={[styles.investCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.investPhotoWrap, { backgroundColor: colors.primary + '22' }]}>
        {photo ? (
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : null}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
        <View style={styles.investOverlay}>
          <Text style={styles.investFlag}>{project.flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.investPhotoName} numberOfLines={1}>{project.name}</Text>
            <Text style={styles.investPhotoRegion}>{project.region}</Text>
          </View>
          <View style={[styles.methodBadge, { backgroundColor: 'rgba(14,124,102,0.85)' }]}>
            <Text style={styles.methodText}>{project.methodology}</Text>
          </View>
        </View>
      </View>

      <View style={styles.investBody}>
        <View style={styles.investPriceRow}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Price per tCO₂e</Text>
            <Text style={[styles.priceVal, { color: colors.gold }]}>
              ₦{CREDIT_PRICE_NGN.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.verPill, { backgroundColor: project.verified ? colors.primary + '18' : colors.muted, borderColor: project.verified ? colors.primary + '44' : colors.border }]}>
            <Ionicons name={project.verified ? 'shield-checkmark' : 'time-outline'} size={10} color={project.verified ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.verPillText, { color: project.verified ? colors.primary : colors.mutedForeground }]}>
              {project.verified ? 'VCS Verified' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={[styles.qtyRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            onPress={() => setQty(String(Math.max(1, qtyNum - 10)))}
            style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="remove" size={16} color={colors.foreground} />
          </Pressable>
          <TextInput
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            style={[styles.qtyInput, { color: colors.foreground }]}
            selectTextOnFocus
          />
          <Text style={[styles.qtyUnit, { color: colors.mutedForeground }]}>tCO₂e</Text>
          <Pressable
            onPress={() => setQty(String(qtyNum + 10))}
            style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="add" size={16} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={[styles.totalRow, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25', borderRadius: 8 }]}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total cost</Text>
          <Text style={[styles.totalVal, { color: colors.primary }]}>
            ₦{totalNgn.toLocaleString()}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.buyBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, borderRadius: colors.radius - 2 }]}
          onPress={handleBuy}
        >
          <Ionicons name="leaf" size={15} color="#fff" />
          <Text style={styles.buyBtnText}>Buy {qtyNum} tCO₂e</Text>
        </Pressable>
      </View>
    </View>
  );
}

const RETIRE_REASONS = [
  { emoji: '🌍', label: 'Corporate ESG' },
  { emoji: '✈️', label: 'Travel offset' },
  { emoji: '🌱', label: 'Personal offset' },
  { emoji: '🏢', label: 'Compliance' },
];

function RetirePanel({ projects }: { projects: CarbonProject[] }) {
  const colors = useColors();
  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(1);
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? 1);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const selected = projects.find((p) => p.id === selectedId);

  function handleRetire() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setStep('done'), 600);
  }

  if (step === 'done') {
    return (
      <View style={[styles.retireSuccess, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Credits Retired!</Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
          {amount} tCO₂e permanently retired from{'\n'}{selected?.name}
        </Text>
        <Text style={[styles.successNote, { color: colors.mutedForeground }]}>
          Simulated transaction — contracts deploy on mainnet.
        </Text>
        <Pressable
          style={[styles.retireAgainBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 2 }]}
          onPress={() => { setStep(1); setAmount(''); setReason(''); }}
        >
          <Text style={styles.retireAgainText}>Retire More</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.retireCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={styles.stepRow}>
        {[1, 2, 3].map((n) => {
          const done = step > n;
          const active = step === n;
          return (
            <View key={n} style={styles.stepItem}>
              <View style={[styles.stepCircle, {
                backgroundColor: done ? colors.primary : active ? colors.primary + '25' : colors.muted,
                borderColor: active ? colors.primary : 'transparent',
              }]}>
                {done ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: active ? colors.primary : colors.mutedForeground }]}>{n}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: active ? colors.foreground : colors.mutedForeground }]}>
                {['Select', 'Reason', 'Confirm'][n - 1]}
              </Text>
              {n < 3 && <View style={[styles.stepLine, { backgroundColor: done ? colors.primary : colors.border }]} />}
            </View>
          );
        })}
      </View>

      {step === 1 && (
        <View style={styles.retireBody}>
          <Text style={[styles.retireBodyTitle, { color: colors.foreground }]}>Select Project & Amount</Text>

          {projects.map((p) => {
            const active = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedId(p.id)}
                style={[
                  styles.projectOption,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary + '10' : colors.background,
                    borderRadius: 10,
                  },
                ]}
              >
                <Text style={styles.projectOptionFlag}>{p.flag}</Text>
                <Text style={[styles.projectOptionName, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>{p.name}</Text>
                {active && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
              </Pressable>
            );
          })}

          <View style={[styles.amtRow, { borderColor: colors.border, backgroundColor: colors.background, borderRadius: 10 }]}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount (tCO₂e)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.amtInput, { color: colors.foreground }]}
            />
            <Text style={[styles.amtUnit, { color: colors.mutedForeground }]}>tCO₂e</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.retireNextBtn,
              { backgroundColor: (!amount || parseFloat(amount) <= 0) ? colors.muted : colors.primary, opacity: pressed ? 0.85 : 1, borderRadius: colors.radius - 2 },
            ]}
            disabled={!amount || parseFloat(amount) <= 0}
            onPress={() => setStep(2)}
          >
            <Text style={[styles.retireNextText, { color: (!amount || parseFloat(amount) <= 0) ? colors.mutedForeground : '#fff' }]}>
              Continue
            </Text>
            <Ionicons name="chevron-forward" size={16} color={(!amount || parseFloat(amount) <= 0) ? colors.mutedForeground : '#fff'} />
          </Pressable>
        </View>
      )}

      {step === 2 && (
        <View style={styles.retireBody}>
          <Text style={[styles.retireBodyTitle, { color: colors.foreground }]}>Retirement Reason</Text>

          <View style={styles.reasonGrid}>
            {RETIRE_REASONS.map(({ emoji, label }) => (
              <Pressable
                key={label}
                onPress={() => setReason(label)}
                style={[
                  styles.reasonChip,
                  {
                    borderColor: reason === label ? colors.primary : colors.border,
                    backgroundColor: reason === label ? colors.primary + '12' : colors.background,
                    borderRadius: 10,
                  },
                ]}
              >
                <Text style={styles.reasonEmoji}>{emoji}</Text>
                <Text style={[styles.reasonLabel, { color: reason === label ? colors.primary : colors.foreground }]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Or enter custom reason..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.reasonInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          />

          <View style={styles.twoBtn}>
            <Pressable style={[styles.backBtn, { borderColor: colors.border, borderRadius: colors.radius - 2 }]} onPress={() => setStep(1)}>
              <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.retireNextBtn,
                { flex: 1, backgroundColor: !reason.trim() ? colors.muted : colors.primary, opacity: pressed ? 0.85 : 1, borderRadius: colors.radius - 2 },
              ]}
              disabled={!reason.trim()}
              onPress={() => setStep(3)}
            >
              <Text style={[styles.retireNextText, { color: !reason.trim() ? colors.mutedForeground : '#fff' }]}>Continue</Text>
              <Ionicons name="chevron-forward" size={16} color={!reason.trim() ? colors.mutedForeground : '#fff'} />
            </Pressable>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.retireBody}>
          <Text style={[styles.retireBodyTitle, { color: colors.foreground }]}>Confirm Retirement</Text>

          <View style={[styles.confirmBox, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '22', borderRadius: 10 }]}>
            {[
              { label: 'Project', value: `${selected?.flag} ${selected?.name}` },
              { label: 'Amount', value: `${amount} tCO₂e` },
              { label: 'Reason', value: reason },
            ].map(({ label, value }) => (
              <View key={label} style={[styles.confirmRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.confirmLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.confirmValue, { color: colors.foreground }]} numberOfLines={2}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.warningBox, { backgroundColor: '#92400E18', borderColor: '#92400E44', borderRadius: 8 }]}>
            <Ionicons name="alert-circle" size={14} color="#D97706" />
            <Text style={[styles.warningText, { color: '#D97706' }]}>
              Retirement is permanent and irreversible. Credits will be burned forever.
            </Text>
          </View>

          <View style={styles.twoBtn}>
            <Pressable style={[styles.backBtn, { borderColor: colors.border, borderRadius: colors.radius - 2 }]} onPress={() => setStep(2)}>
              <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.confirmRetireBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, borderRadius: colors.radius - 2 }]}
              onPress={handleRetire}
            >
              <Ionicons name="leaf" size={14} color="#fff" />
              <Text style={styles.confirmRetireText}>Confirm Retire</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function CarbonScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const [tab, setTab] = useState<Tab>('Browse');

  const { data: projects, isLoading, isError, refetch } = useListCarbonProjects();
  const totals = projects ? formatCreditsTotal(projects) : null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Carbon Credits</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Verified African climate projects</Text>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 10 }}>
          {TABS.map((t) => {
            const active = t === tab;
            const icon = t === 'Browse' ? 'grid-outline' : t === 'Invest' ? 'trending-up-outline' : 'leaf-outline';
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabChip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border, borderRadius: 20 }]}
              >
                <Ionicons name={icon as any} size={12} color={active ? '#fff' : colors.mutedForeground} />
                <Text style={[styles.tabText, { color: active ? '#fff' : colors.mutedForeground }]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Failed to load carbon projects</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 34 : insets.bottom + 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'Browse' && (projects ?? []).map((p) => (
            <CarbonCard key={p.id} project={p} />
          ))}

          {tab === 'Invest' && (
            <>
              <View style={[styles.investInfoBox, { backgroundColor: colors.gold + '12', borderColor: colors.gold + '33', borderRadius: 10 }]}>
                <Ionicons name="information-circle-outline" size={15} color={colors.gold} />
                <Text style={[styles.investInfoText, { color: colors.mutedForeground }]}>
                  Each credit represents 1 tCO₂e removed or avoided. Credits are ERC-1155 tokens on Polygon — trading is simulated until mainnet launch.
                </Text>
              </View>

              {(projects ?? []).map((p) => (
                <InvestCard key={p.id} project={p} />
              ))}
            </>
          )}

          {tab === 'Retire' && projects && projects.length > 0 && (
            <RetirePanel projects={projects} />
          )}

          {tab === 'Retire' && (!projects || projects.length === 0) && (
            <View style={styles.center}>
              <Ionicons name="leaf-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.errorText, { color: colors.mutedForeground }]}>No projects available</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 0, borderBottomWidth: 1 },
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
  tabChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  tabText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, minHeight: 200 },
  errorText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },

  investInfoBox: { flexDirection: 'row', gap: 8, padding: 12, borderWidth: 1, alignItems: 'flex-start' },
  investInfoText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },

  investCard: { overflow: 'hidden', borderWidth: 1 },
  investPhotoWrap: { height: 90, overflow: 'hidden' },
  investOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  investFlag: { fontSize: 20 },
  investPhotoName: { color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' },
  investPhotoRegion: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  methodBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  methodText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
  investBody: { padding: 14, gap: 10 },
  investPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  priceVal: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 1 },
  verPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  verPillText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { flex: 1, textAlign: 'center', fontSize: 18, fontFamily: 'Inter_700Bold', paddingVertical: 10 },
  qtyUnit: { fontSize: 12, fontFamily: 'Inter_400Regular', paddingRight: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  totalLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  totalVal: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  buyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13 },
  buyBtnText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },

  retireCard: { borderWidth: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 0 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  stepLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  stepLine: { width: 20, height: 1, marginHorizontal: 4 },
  retireBody: { padding: 16, gap: 10 },
  retireBodyTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  projectOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1 },
  projectOptionFlag: { fontSize: 20 },
  projectOptionName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  amtRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12 },
  amtInput: { flex: 1, fontSize: 16, fontFamily: 'Inter_700Bold', paddingVertical: 12 },
  amtUnit: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, minWidth: '45%' },
  reasonEmoji: { fontSize: 16 },
  reasonLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  reasonInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontFamily: 'Inter_400Regular' },
  twoBtn: { flexDirection: 'row', gap: 10 },
  backBtn: { paddingHorizontal: 18, paddingVertical: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  retireNextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  retireNextText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  confirmBox: { borderWidth: 1, overflow: 'hidden' },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 10, borderBottomWidth: 1 },
  confirmLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  confirmValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', maxWidth: '60%', textAlign: 'right' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderWidth: 1 },
  warningText: { flex: 1, fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  confirmRetireBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  confirmRetireText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },

  retireSuccess: { borderWidth: 1, padding: 32, alignItems: 'center', gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  successSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  successNote: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', opacity: 0.6 },
  retireAgainBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center' },
  retireAgainText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
});
