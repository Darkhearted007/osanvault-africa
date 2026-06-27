import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const INVESTOR_TYPES = ["Individual", "HNI", "Institutional", "Fund"];
const JURISDICTIONS = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "United Kingdom", "United States", "UAE", "Singapore", "Other"];

export default function WhitelistScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const [form, setForm] = useState({
    name: "",
    email: "",
    walletAddress: "",
    investorType: "Individual",
    jurisdiction: "Nigeria",
    investmentCap: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!form.name || !form.email || !form.walletAddress) {
      Alert.alert("Missing Fields", "Please fill in your name, email, and wallet address.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Early Access</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="check-circle" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Application Submitted!</Text>
          <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
            Your whitelist application is under review. We will contact you at {form.email} within 3–5 business days.
          </Text>
          <Pressable
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.doneBtnText, { color: colors.primaryForeground }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Early Access</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={[styles.heroBanner, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Feather name="star" size={24} color={colors.gold} />
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Whitelist Application</Text>
          <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
            Join a curated group of accredited investors for early access to OsanVault Africa's tokenized real estate SPVs.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formSection, { color: colors.foreground }]}>Personal Information</Text>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            placeholder="John Doe"
            placeholderTextColor={colors.mutedForeground}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email Address *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            placeholder="investor@example.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Polygon Wallet Address *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="0x..."
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            value={form.walletAddress}
            onChangeText={(v) => setForm((f) => ({ ...f, walletAddress: v }))}
          />

          <Text style={[styles.formSection, { color: colors.foreground, marginTop: 8 }]}>Investment Profile</Text>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Investor Type</Text>
          <View style={styles.chipRow}>
            {INVESTOR_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.chip,
                  {
                    backgroundColor: form.investorType === t ? colors.primary : colors.muted,
                    borderColor: form.investorType === t ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setForm((f) => ({ ...f, investorType: t }))}
              >
                <Text style={[styles.chipText, { color: form.investorType === t ? colors.primaryForeground : colors.mutedForeground }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Jurisdiction</Text>
          <View style={styles.chipRow}>
            {JURISDICTIONS.slice(0, 6).map((j) => (
              <Pressable
                key={j}
                style={[
                  styles.chip,
                  {
                    backgroundColor: form.jurisdiction === j ? colors.primary : colors.muted,
                    borderColor: form.jurisdiction === j ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setForm((f) => ({ ...f, jurisdiction: j }))}
              >
                <Text style={[styles.chipText, { color: form.jurisdiction === j ? colors.primaryForeground : colors.mutedForeground }]}>{j}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Investment Capacity (₦)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. 10,000,000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            value={form.investmentCap}
            onChangeText={(v) => setForm((f) => ({ ...f, investmentCap: v }))}
          />
        </View>

        <View style={[styles.disclaimerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            By applying you confirm that you are an accredited investor and comply with your jurisdiction's securities laws. Investment involves risk including loss of principal.
          </Text>
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Feather name="send" size={16} color={colors.primaryForeground} />
          <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>Submit Application</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  successIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  successDesc: { fontSize: 15, lineHeight: 22, textAlign: "center", fontFamily: "Inter_400Regular" },
  doneBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
  doneBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16, gap: 16 },
  heroBanner: { borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: "center", gap: 8 },
  heroTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroDesc: { fontSize: 14, lineHeight: 21, textAlign: "center", fontFamily: "Inter_400Regular" },
  formCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  formSection: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 4, marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 4 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  disclaimerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  disclaimerText: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular", flex: 1 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
