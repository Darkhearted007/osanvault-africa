import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Tab = "sec-arip" | "terms" | "privacy" | "risk";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "sec-arip", label: "SEC ARIP", icon: "shield" },
  { id: "terms", label: "Terms", icon: "file-text" },
  { id: "privacy", label: "Privacy", icon: "lock" },
  { id: "risk", label: "Risk", icon: "alert-triangle" },
];

const SEC_CONDITIONS = [
  "Max 200 retail participants per offering during sandbox period",
  "Individual cap of ₦1,000,000 per offering for non-accredited investors",
  "All offering documents filed with SEC Nigeria Innovation Hub prior to launch",
  "Quarterly reporting on investor numbers, funds raised, and token activity",
  "Properties must pass dual verification before tokenization",
  "Smart contracts audited by SEC-approved firm before mainnet deployment",
  "All marketing materials carry the sandbox disclosure statement",
  "Exit mechanisms disclosed to investors at the point of subscription",
];

const SEC_MILESTONES = [
  { label: "ARIP Application Filed", date: "Q4 2024", status: "done" },
  { label: "In-Principle Approval", date: "Q1 2025", status: "done" },
  { label: "Sandbox Live", date: "Q2 2025", status: "active" },
  { label: "Full License Application", date: "Q4 2025", status: "upcoming" },
];

const TERMS_SECTIONS = [
  {
    title: "1. Definitions",
    body: `"Platform" means the OsanVault Africa application and associated smart contracts. "SPV" means a Special Purpose Vehicle established to hold a specific real estate asset. "Token" or "Property Token" means an ERC-1155 digital token representing a fractional beneficial interest in an SPV. "OSANV" means the OsanVault governance and staking token.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years of age to use the Platform. Use of the Platform is prohibited in jurisdictions where tokenized securities offerings are not permitted. During the SEC ARIP Sandbox period, retail investor participation is subject to the individual investment caps published by the SEC Nigeria.`,
  },
  {
    title: "3. Nature of Tokens",
    body: `Property Tokens represent a fractional beneficial interest in the underlying SPV, not a direct ownership interest in real property. Token holders do not hold legal title to the physical asset. OSANV tokens are governance and utility tokens; they do not represent equity in ÒsánVault Africa Ltd and confer no dividend rights.`,
  },
  {
    title: "4. Sandbox Limitations",
    body: `The Platform currently operates under the SEC Nigeria ARIP Sandbox — a supervised testing environment and not a full capital market licence. Participant numbers, investment limits, and eligible offerings are subject to sandbox conditions. We will notify users of any material regulatory changes.`,
  },
  {
    title: "5. Risk Warning",
    body: `Investing in tokenized real estate carries significant risk including loss of capital, illiquidity, smart contract vulnerabilities, and regulatory changes. Investment decisions should not be made solely on information from this Platform. Past performance is not indicative of future results.`,
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `Wallet Data: Your Ethereum-compatible wallet address when you connect. We do not collect private keys.\n\nIdentity Data (KYC): For regulated offerings, we may collect your full name, date of birth, government ID, and proof of address.\n\nUsage Data: IP address, browser type, pages viewed, and interaction events via first-party analytics.\n\nOn-Chain Data: All blockchain transactions are publicly visible on the Polygon network. We do not control visibility of on-chain data.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to: provide Platform services; conduct KYC verification for regulated offerings; send regulatory notices and material updates; detect and prevent fraud; comply with applicable laws and SEC Nigeria reporting obligations.`,
  },
  {
    title: "3. Data Sharing",
    body: `We share data with KYC verification providers, legal and regulatory authorities when required by law, and SEC Nigeria as required by our ARIP Sandbox conditions. We do not sell personal data to third parties.`,
  },
  {
    title: "4. Data Retention",
    body: `We retain KYC records for a minimum of 7 years from your last transaction, as required by Nigerian AML regulations. On-chain data is permanent and cannot be deleted.`,
  },
];

const RISK_ITEMS = [
  { icon: "trending-down", title: "Investment & Capital Risk", body: `Property Token values may fall as well as rise. You may receive back less than you invest. Real estate valuations are subject to market cycles, interest rate movements, and macroeconomic conditions across African markets.` },
  { icon: "cpu", title: "Smart Contract Risk", body: `All token functions are executed by smart contracts on Polygon. Although contracts undergo independent audits, no audit can guarantee the absence of bugs. A vulnerability could result in partial or total loss of funds.` },
  { icon: "lock", title: "Custody & Key Risk", body: `Tokens are held in self-custodied wallets. ÒsánVault Africa Ltd does not hold custody of your assets. Loss of your private key means permanent, irrecoverable loss of your tokens.` },
  { icon: "bar-chart", title: "Liquidity Risk", body: `Property Tokens are illiquid instruments. There is currently no active secondary market. You should be prepared to hold your tokens until a secondary market is established or until an SPV liquidation event occurs.` },
  { icon: "globe", title: "Regulatory Risk", body: `ÒsánVault Africa operates under the SEC Nigeria ARIP Sandbox, not a full capital market licence. The regulatory status of tokenized securities is evolving. Regulatory changes could require material platform restructuring.` },
  { icon: "dollar-sign", title: "Currency & FX Risk", body: `Property values are denominated in Nigerian Naira (₦). The Naira has experienced significant volatility. Investors converting to or from other currencies accept full foreign exchange risk.` },
  { icon: "wind", title: "Carbon Credit Risk", body: `Carbon credits may have their verification status revoked by the issuing body if a project fails to meet ongoing monitoring standards. Retired credits cannot be unretired and have no secondary market value.` },
];

export default function LegalScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 40;

  const [activeTab, setActiveTab] = useState<Tab>((params.tab as Tab) ?? "sec-arip");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Legal & Compliance</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.tab, activeTab === t.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(t.id)}
          >
            <Feather name={t.icon as any} size={14} color={activeTab === t.id ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === t.id ? colors.primary : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        {activeTab === "sec-arip" && (
          <>
            <View style={[styles.regBadge, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
              <Feather name="shield" size={16} color={colors.primary} />
              <Text style={[styles.regBadgeText, { color: colors.primary }]}>Regulatory Status Active</Text>
            </View>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>SEC ARIP Sandbox</Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
              ÒsánVault Africa operates under the Securities and Exchange Commission Nigeria Alternative Investment Regulatory Initiative (ARIP) Sandbox — a formal regulatory framework for testing innovative capital market products.
            </Text>

            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Sandbox Conditions</Text>
            {SEC_CONDITIONS.map((c, i) => (
              <View key={i} style={styles.conditionRow}>
                <View style={[styles.conditionNum, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={[styles.conditionNumText, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.conditionText, { color: colors.mutedForeground }]}>{c}</Text>
              </View>
            ))}

            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Regulatory Milestones</Text>
            {SEC_MILESTONES.map((m) => (
              <View key={m.label} style={styles.milestoneRow}>
                <Feather
                  name={m.status === "done" ? "check-circle" : m.status === "active" ? "circle" : "clock"}
                  size={16}
                  color={m.status === "done" ? colors.primary : m.status === "active" ? colors.gold : colors.mutedForeground}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.milestoneLabel, { color: colors.foreground }]}>{m.label}</Text>
                  <Text style={[styles.milestoneDate, { color: colors.mutedForeground }]}>{m.date}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "terms" && (
          <>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Terms of Service</Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
              Last updated: 1 June 2025. By accessing or using the Platform you agree to these Terms of Service. Please read them carefully.
            </Text>
            {TERMS_SECTIONS.map((s) => (
              <View key={s.title} style={styles.docSection}>
                <Text style={[styles.docSectionTitle, { color: colors.foreground }]}>{s.title}</Text>
                <Text style={[styles.docSectionBody, { color: colors.mutedForeground }]}>{s.body}</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === "privacy" && (
          <>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Privacy Policy</Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
              Last updated: 1 June 2025. This policy explains how we collect, use, and protect your personal information.
            </Text>
            {PRIVACY_SECTIONS.map((s) => (
              <View key={s.title} style={styles.docSection}>
                <Text style={[styles.docSectionTitle, { color: colors.foreground }]}>{s.title}</Text>
                <Text style={[styles.docSectionBody, { color: colors.mutedForeground }]}>{s.body}</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === "risk" && (
          <>
            <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Risk Disclosure</Text>
            <View style={[styles.riskWarning, { backgroundColor: `${colors.rose}15`, borderColor: `${colors.rose}30` }]}>
              <Feather name="alert-triangle" size={16} color={colors.rose} />
              <Text style={[styles.riskWarningText, { color: colors.rose }]}>
                Investing in tokenized real estate involves significant risk of loss. Only invest what you can afford to lose.
              </Text>
            </View>
            {RISK_ITEMS.map((r) => (
              <View key={r.title} style={[styles.riskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.riskIcon, { backgroundColor: `${colors.rose}15` }]}>
                  <Feather name={r.icon as any} size={16} color={colors.rose} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.riskTitle, { color: colors.foreground }]}>{r.title}</Text>
                  <Text style={[styles.riskBody, { color: colors.mutedForeground }]}>{r.body}</Text>
                </View>
              </View>
            ))}
          </>
        )}
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  regBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  regBadgeText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sectionHeading: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 4 },
  bodyText: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  conditionRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  conditionNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  conditionNumText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  conditionText: { flex: 1, fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  milestoneRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  milestoneLabel: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  milestoneDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  docSection: { gap: 6 },
  docSectionTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  docSectionBody: { fontSize: 13, lineHeight: 20, fontFamily: "Inter_400Regular" },
  riskWarning: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
  },
  riskWarningText: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_500Medium", flex: 1 },
  riskCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  riskIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  riskTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  riskBody: { fontSize: 12, lineHeight: 18, marginTop: 4, fontFamily: "Inter_400Regular" },
});
