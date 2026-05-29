import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Globe, Lock, Cpu, Building2, Leaf, Gavel } from "lucide-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

const RISKS = [
  {
    icon: TrendingDown,
    title: "Investment & Capital Risk",
    body: `The value of Property Tokens may fall as well as rise. You may receive back less than you invest. Real estate valuations are subject to market cycles, interest rate movements, and macroeconomic conditions across Nigeria, Ghana, Kenya, and other African markets where we operate. Rental income from underlying properties is not guaranteed and may be interrupted by vacancy, non-paying tenants, or property damage.`,
  },
  {
    icon: Cpu,
    title: "Smart Contract Risk",
    body: `All token issuance, transfer, staking, and governance functions are executed by smart contracts on the Polygon blockchain. Although our contracts undergo independent audits before mainnet deployment, no audit process can guarantee the absence of bugs. A critical vulnerability could result in partial or total loss of funds held in or managed by smart contracts. Smart contract code is immutable once deployed.`,
  },
  {
    icon: Lock,
    title: "Custody & Key Risk",
    body: `Tokens are held in self-custodied wallets. ÒsánVault Africa Ltd does not hold custody of your assets. Loss of your private key or seed phrase means permanent, irrecoverable loss of your tokens. We strongly recommend using a hardware wallet and maintaining secure, offline backups of your seed phrase. We cannot reverse blockchain transactions or recover lost wallets.`,
  },
  {
    icon: Globe,
    title: "Liquidity Risk",
    body: `Property Tokens are illiquid instruments. There is currently no active secondary market for buying or selling tokens between investors outside of the Platform's primary offering mechanism. You should be prepared to hold your tokens until a secondary market is established or until an SPV liquidation event occurs. Liquidation timelines depend on property market conditions and may take years.`,
  },
  {
    icon: Building2,
    title: "Real Estate & Title Risk",
    body: `Despite dual verification by government authorities and indigenous land authorities on-chain via LandRegistry.sol, title disputes, compulsory government acquisition, or changes in land use designations could materially affect the value or legal status of underlying properties. African real estate markets carry additional risks including currency controls on foreign investment, varying tenant protection laws, and infrastructure dependencies.`,
  },
  {
    icon: Gavel,
    title: "Regulatory & Legal Risk",
    body: `ÒsánVault Africa currently operates under the SEC Nigeria ARIP Sandbox, which is not a full capital market licence. The regulatory status of tokenized securities in Nigeria, Ghana, and Kenya is evolving. Regulatory changes could require material platform restructuring, restrict token transfers, or require investors to return capital. There is no guarantee that a full licence will be granted at the conclusion of the sandbox period. The legal enforceability of token-based beneficial ownership structures in African courts has not been fully tested.`,
  },
  {
    icon: Globe,
    title: "Currency & FX Risk",
    body: `Property values are denominated in Nigerian Naira (₦). The Naira has experienced significant volatility against major currencies. Investors converting to or from USD, GBP, EUR, or other currencies accept full foreign exchange risk. OSANV token value is subject to crypto market volatility and may not track the underlying real estate portfolio. Naira devaluation could reduce the USD-equivalent value of your investment even if property values are stable in local terms.`,
  },
  {
    icon: Cpu,
    title: "Blockchain & Network Risk",
    body: `The Polygon network may experience congestion, downtime, or technical failures that delay or prevent transactions. Network upgrades or hard forks may require us to migrate contracts or update the Platform. Gas fee spikes on Polygon may increase the cost of transactions in ways that were not anticipated at the time of investment. We have no control over the Polygon network's operation or continued availability.`,
  },
  {
    icon: Leaf,
    title: "Carbon Credit Risk",
    body: `Carbon credits issued via OsanCarbon (ERC-1155) are linked to verified climate projects. Verification status may be revoked by the issuing body (VCS, Gold Standard, Plan Vivo) if a project fails to meet ongoing monitoring standards. Carbon credit market prices are volatile and subject to policy changes affecting voluntary and compliance carbon markets. Retired credits cannot be unretired and have no secondary market value.`,
  },
];

export default function LegalRiskPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4A017] uppercase tracking-widest bg-[#D4A017]/10 border border-[#D4A017]/20 px-3 py-1.5 rounded-full">
            <AlertTriangle className="h-3 w-3" /> Risk
          </span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-display text-4xl font-bold text-white mb-3">
          Risk Disclosure
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-sm text-white/30 mb-8">
          Last updated: 1 May 2025 · Please read carefully before investing
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl border border-[#D4A017]/20 bg-[#D4A017]/5 p-5 mb-10 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-[#D4A017] shrink-0 mt-0.5" />
          <p className="text-sm text-white/60 leading-relaxed">
            Investing in tokenized real estate and digital assets involves significant risk.
            The risks below are not exhaustive. You should only invest amounts you can afford
            to lose in full. This document does not constitute financial advice. Seek independent
            professional advice before making any investment decision.
          </p>
        </motion.div>

        <div className="space-y-8">
          {RISKS.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              custom={i + 4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex gap-4"
            >
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white mb-2">{title}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div custom={RISKS.length + 5} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-sm font-semibold text-white mb-2">Acknowledgement</p>
          <p className="text-sm text-white/50 leading-relaxed">
            By using the Platform and participating in any Offering, you acknowledge that you have
            read and understood this Risk Disclosure, that you understand the risks involved, and
            that you accept those risks as part of your decision to invest. You further acknowledge
            that past performance of any property, SPV, or token is not indicative of future results.
          </p>
        </motion.div>

        <motion.div custom={RISKS.length + 6} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-white/25">
            ÒsánVault Africa Ltd · Lagos, Nigeria ·{" "}
            <a href="mailto:compliance@osanvault.africa" className="text-primary hover:underline">
              compliance@osanvault.africa
            </a>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
