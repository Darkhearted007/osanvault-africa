import { motion } from "framer-motion";
import { Shield, ExternalLink, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const SANDBOX_CONDITIONS = [
  "Maximum of 200 retail participants per offering during the sandbox period",
  "Individual investment cap of ₦1,000,000 per offering for non-accredited investors",
  "All offering documents must be filed with the SEC Nigeria Innovation Hub prior to launch",
  "Quarterly reporting to the SEC Nigeria on investor numbers, funds raised, and token activity",
  "Properties must pass dual verification (government title + indigenous authority) before tokenization",
  "Smart contracts must be audited by a SEC-approved firm before mainnet deployment",
  "All marketing materials must carry the sandbox disclosure statement",
  "Exit mechanisms must be disclosed to investors at the point of subscription",
];

const MILESTONES = [
  { label: "ARIP Application Filed", date: "Q4 2024", status: "done" },
  { label: "In-Principle Approval", date: "Q1 2025", status: "done" },
  { label: "Sandbox Live", date: "Q2 2025", status: "active" },
  { label: "Full License Application", date: "Q4 2025", status: "upcoming" },
];

export default function LegalSecAripPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
            <Shield className="h-3 w-3" /> Regulatory Status
          </span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="font-display text-4xl font-bold text-white mb-4">
          SEC ARIP Sandbox
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-lg text-white/50 mb-10 leading-relaxed">
          ÒsánVault Africa operates under the Securities and Exchange Commission Nigeria
          Alternative Investment Regulatory Initiative (ARIP) Sandbox — a formal regulatory
          framework for testing innovative capital market products.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-8 flex gap-4">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Current Status: Sandbox Active</p>
            <p className="text-sm text-white/50 leading-relaxed">
              ÒsánVault Africa has received in-principle approval from the SEC Nigeria Innovation Hub
              and is currently operating under the ARIP Sandbox framework. We are not yet
              fully licensed; the sandbox is a supervised testing environment with defined
              participant and investment limits.
            </p>
          </div>
        </motion.div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">What Is the ARIP Sandbox?</h2>
          <p className="text-sm text-white/50 leading-relaxed mb-4">
            The SEC Nigeria ARIP Sandbox allows fintech and capital market innovators to test
            novel products and services in a live environment under SEC supervision, with
            temporary exemptions from certain regulatory requirements that would otherwise
            apply to a fully licensed operator.
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            Participation in the sandbox does not constitute a full capital market licence.
            Investors in sandbox offerings accept that the regulatory framework governing
            their investment may change as ÒsánVault transitions from sandbox to full
            licensure.
          </p>
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Sandbox Conditions</h2>
          <p className="text-sm text-white/50 mb-5">
            The following conditions apply during our sandbox period and govern all
            token offerings on the platform:
          </p>
          <ul className="space-y-3">
            {SANDBOX_CONDITIONS.map((condition, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {condition}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-5">Regulatory Roadmap</h2>
          <div className="space-y-4">
            {MILESTONES.map(({ label, date, status }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  status === "done" ? "bg-primary" :
                  status === "active" ? "bg-gold-gradient animate-pulse" :
                  "bg-white/15"
                }`} />
                <span className={`text-sm flex-1 ${status === "upcoming" ? "text-white/30" : "text-white/70"}`}>
                  {label}
                </span>
                <span className={`text-xs ${status === "active" ? "text-[#D4A017] font-semibold" : "text-white/30"}`}>
                  {date}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex gap-4">
          <AlertCircle className="h-5 w-5 text-[#D4A017] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Investor Notice</p>
            <p className="text-sm text-white/50 leading-relaxed">
              Investing in tokenized real estate is subject to capital loss risk. The ARIP
              Sandbox approval is not a guarantee of investment returns or platform solvency.
              Always read the full offering document for each property SPV before investing.
              For enquiries, contact{" "}
              <a href="mailto:compliance@osanvault.africa" className="text-primary hover:underline">
                compliance@osanvault.africa
              </a>.
            </p>
          </div>
        </motion.div>

        <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="mt-8 pt-6 border-t border-white/[0.06]">
          <a
            href="https://sec.gov.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Securities and Exchange Commission Nigeria <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </motion.div>
      </div>
    </Layout>
  );
}
