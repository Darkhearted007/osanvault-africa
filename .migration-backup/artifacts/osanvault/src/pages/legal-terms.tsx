import { motion } from "framer-motion";
import { FileText } from "lucide-react";
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
    title: "1. Definitions",
    body: `"Platform" means the OsanVault Africa web application and associated smart contracts. "SPV" means a Special Purpose Vehicle established to hold a specific real estate asset. "Token" or "Property Token" means an ERC-1155 digital token representing a fractional beneficial interest in an SPV. "OSANV" means the OsanVault governance and staking token. "User" means any person who accesses the Platform. "Offering" means any tokenized real estate offering made available through the Platform.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years of age to use the Platform. Use of the Platform is prohibited in jurisdictions where tokenized securities offerings are not permitted. By accessing the Platform you represent that you are legally permitted to do so under the laws of your jurisdiction. During the SEC ARIP Sandbox period, participation by retail investors is subject to the individual investment caps published by the SEC Nigeria and displayed on each Offering page.`,
  },
  {
    title: "3. Nature of Tokens",
    body: `Property Tokens represent a fractional beneficial interest in the underlying SPV, not a direct ownership interest in real property. Token holders do not hold legal title to the physical asset. Returns from token holdings depend on the performance of the underlying property, including rental income and capital appreciation, and are not guaranteed. OSANV tokens are governance and utility tokens; they do not represent equity in ÒsánVault Africa Ltd and confer no dividend rights.`,
  },
  {
    title: "4. Sandbox Limitations",
    body: `The Platform currently operates under the SEC Nigeria ARIP Sandbox. This is a supervised testing environment and not a full capital market licence. Participant numbers, investment limits, and eligible offerings are subject to sandbox conditions as communicated by the SEC Nigeria. The regulatory framework may change when ÒsánVault transitions to full licensure. We will notify users of any material regulatory changes by email and through a prominent Platform notice.`,
  },
  {
    title: "5. Smart Contracts and Blockchain Risk",
    body: `All token transactions are executed on the Polygon blockchain. Smart contracts are immutable once deployed and may contain unforeseen bugs or vulnerabilities despite independent auditing. Blockchain transactions are irreversible. ÒsánVault Africa Ltd is not responsible for losses arising from: (a) bugs or exploits in smart contracts not attributable to gross negligence; (b) network congestion or gas fee volatility; (c) loss of private keys or wallet access; (d) phishing attacks or unauthorised access to your wallet.`,
  },
  {
    title: "6. Land Verification",
    body: `Prior to tokenization, each property SPV must pass dual verification: a government title hash and an indigenous authority approval, both recorded on-chain via LandRegistry.sol. While this process provides a higher standard of verification than traditional fractional property platforms in Nigeria, it does not eliminate the risk of title disputes, government acquisition, or regulatory changes affecting land ownership. Investors should read the legal documentation provided for each Offering.`,
  },
  {
    title: "7. Fees",
    body: `Platform transaction fees are routed through FeeRouter.sol: 30% to the TreasuryVault, 20% as a permanent OSANV burn, 40% distributed to OSANV stakers, and 10% to the team. Fee rates may be adjusted through a governance vote. Current fees for each Offering are displayed at the point of purchase. Gas fees paid to the Polygon network are separate and are the investor's responsibility.`,
  },
  {
    title: "8. No Financial Advice",
    body: `Nothing on the Platform constitutes financial, investment, legal, or tax advice. All content is for informational purposes only. You should seek independent professional advice before making any investment decision. Past performance of any property or SPV is not indicative of future results.`,
  },
  {
    title: "9. Intellectual Property",
    body: `All Platform content, including the OsanVault name, logo, design system, smart contract source code, and written content, is the intellectual property of ÒsánVault Africa Ltd unless otherwise noted. Open-source components are used under their respective licences. You may not reproduce, distribute, or create derivative works from Platform content without prior written permission.`,
  },
  {
    title: "10. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, ÒsánVault Africa Ltd and its directors, employees, and contractors shall not be liable for: (a) any loss of profits, revenue, or data; (b) any indirect, incidental, or consequential damages; (c) loss arising from smart contract exploits not attributable to gross negligence. Our total liability to any user shall not exceed the fees paid by that user in the 12 months preceding the relevant claim.`,
  },
  {
    title: "11. Governing Law & Disputes",
    body: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall first be referred to mediation. If unresolved within 30 days, disputes shall be finally settled by arbitration in Lagos, Nigeria, under the Lagos Court of Arbitration Rules.`,
  },
  {
    title: "12. Amendments",
    body: `We may update these Terms from time to time. Material changes will be communicated by email and a 14-day notice period will be provided before changes take effect, except where immediate changes are required by law or regulation. Your continued use of the Platform after the notice period constitutes acceptance of the updated Terms.`,
  },
];

export default function LegalTermsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
            <FileText className="h-3 w-3" /> Legal
          </span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-display text-4xl font-bold text-white mb-3">
          Terms of Service
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-sm text-white/30 mb-10">
          Last updated: 1 May 2025 · Effective immediately upon publication
        </motion.p>

        <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="text-sm text-white/50 leading-relaxed mb-10">
          These Terms of Service ("Terms") govern your use of the OsanVault Africa platform
          operated by ÒsánVault Africa Ltd, a company incorporated in the Federal Republic
          of Nigeria ("we", "us", "our"). By accessing or using the Platform you agree to
          be bound by these Terms. If you do not agree, do not use the Platform.
        </motion.p>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }, i) => (
            <motion.div key={title} custom={i + 4} variants={fadeUp} initial="hidden" animate="visible">
              <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div custom={SECTIONS.length + 5} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-12 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-white/25">
            ÒsánVault Africa Ltd · RC 123456 · Lagos, Nigeria ·{" "}
            <a href="mailto:legal@osanvault.africa" className="text-primary hover:underline">
              legal@osanvault.africa
            </a>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
