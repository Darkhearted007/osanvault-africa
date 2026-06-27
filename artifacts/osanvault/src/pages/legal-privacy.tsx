import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect the following categories of information when you use the Platform:

Wallet Data: Your Ethereum-compatible wallet address is collected when you connect your wallet. We do not collect private keys.

Identity Data (KYC): For regulated offerings, we may collect your full name, date of birth, government-issued identification document, proof of address, and selfie verification, processed by our third-party KYC provider.

Usage Data: IP address, browser type, pages viewed, time spent, referral source, and interaction events, collected via first-party analytics.

Communication Data: Any information you submit through support forms, emails, or social channels.

On-Chain Data: All blockchain transactions are publicly visible on the Polygon network. We do not control the visibility of on-chain data.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We process your information for the following purposes:

– To operate the Platform and process token purchases and staking transactions.
– To verify your identity and comply with anti-money laundering (AML) and know-your-customer (KYC) obligations under Nigerian law.
– To report to the SEC Nigeria as required under our ARIP Sandbox conditions.
– To send you transactional notifications (investment confirmations, yield distributions, governance alerts).
– To improve the Platform through anonymised analytics.
– To respond to support enquiries.
– To comply with legal obligations and prevent fraud.`,
  },
  {
    title: "3. Legal Basis for Processing",
    body: `We process your data on the following legal bases under the Nigeria Data Protection Act 2023 (NDPA):

Contract: Processing necessary to deliver the Platform services you have requested.

Legal Obligation: Processing required to comply with SEC Nigeria reporting, AML/KYC regulations, and tax obligations.

Legitimate Interests: Fraud prevention, platform security, and improving our services.

Consent: Marketing communications (you may withdraw consent at any time).`,
  },
  {
    title: "4. Data Sharing",
    body: `We share your data only in the following circumstances:

KYC Providers: We use a regulated third-party identity verification provider to process KYC data. Their privacy policy governs the handling of that data.

Regulatory Authorities: We will share data with the SEC Nigeria and other relevant authorities when required by law.

Service Providers: Trusted providers operating on our behalf (cloud hosting, email delivery, analytics) under data processing agreements.

Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity.

We do not sell, rent, or trade your personal data to any third party for marketing purposes.`,
  },
  {
    title: "5. Data Retention",
    body: `KYC and AML records are retained for a minimum of 5 years following the end of your relationship with the Platform, as required by Nigerian AML regulations.

Transaction records are retained for 7 years for tax and regulatory purposes.

Usage and analytics data is retained for 24 months.

Support communications are retained for 2 years.

You may request deletion of data that is not subject to a legal retention requirement by contacting us at privacy@osanvault.africa.`,
  },
  {
    title: "6. Your Rights (NDPA 2023)",
    body: `Under the Nigeria Data Protection Act 2023, you have the following rights:

Access: Request a copy of the personal data we hold about you.
Correction: Request correction of inaccurate data.
Deletion: Request deletion of data not subject to a legal retention obligation.
Portability: Receive your data in a machine-readable format.
Objection: Object to processing based on legitimate interests.
Restriction: Request restriction of processing in certain circumstances.

To exercise any right, email privacy@osanvault.africa with subject "Data Rights Request". We will respond within 30 days.`,
  },
  {
    title: "7. Cookies & Analytics",
    body: `We use first-party cookies for session management and platform functionality. We use anonymised first-party analytics (no third-party tracking pixels). We do not use advertising cookies or cross-site tracking. You may disable cookies in your browser settings; this may affect Platform functionality.`,
  },
  {
    title: "8. Security",
    body: `We implement industry-standard security measures including TLS encryption for data in transit, AES-256 encryption for sensitive data at rest, access controls limiting data access to authorised personnel, and regular security audits. Despite these measures, no system is completely secure. You are responsible for maintaining the security of your wallet and private keys.`,
  },
  {
    title: "9. International Transfers",
    body: `Your data may be transferred to and processed in countries outside Nigeria, including where our cloud infrastructure providers operate. Such transfers are made under appropriate safeguards consistent with the NDPA 2023, including standard contractual clauses.`,
  },
  {
    title: "10. Updates to This Policy",
    body: `We may update this Privacy Policy from time to time. Material changes will be communicated by email with 14 days' notice. The date of the latest revision is shown at the top of this page. Continued use of the Platform after the notice period constitutes acceptance.`,
  },
];

export default function LegalPrivacyPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
            <Lock className="h-3 w-3" /> Privacy
          </span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-display text-4xl font-bold text-white mb-3">
          Privacy Policy
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-sm text-white/30 mb-10">
          Last updated: 1 May 2025 · Governed by the Nigeria Data Protection Act 2023
        </motion.p>

        <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="text-sm text-white/50 leading-relaxed mb-10">
          This Privacy Policy explains how ÒsánVault Africa Ltd ("we", "us") collects,
          uses, and protects your personal data when you use the OsanVault Africa
          platform. We are committed to handling your data responsibly and in compliance
          with the Nigeria Data Protection Act 2023 (NDPA) and applicable SEC Nigeria
          regulations.
        </motion.p>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }, i) => (
            <motion.div key={title} custom={i + 4} variants={fadeUp} initial="hidden" animate="visible">
              <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
              <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div custom={SECTIONS.length + 5} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-12 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-white/25">
            Data Controller: ÒsánVault Africa Ltd · Lagos, Nigeria ·{" "}
            <a href="mailto:privacy@osanvault.africa" className="text-primary hover:underline">
              privacy@osanvault.africa
            </a>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
