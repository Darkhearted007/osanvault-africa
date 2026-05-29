import { Link } from "wouter";
import { ExternalLink, Shield, Zap, Globe } from "lucide-react";
import { OsanVaultLockup } from "@/components/ui/OsanVaultLogo";
import { IS_CONTRACT_DEPLOYED, POLYGONSCAN_BASE, PROPERTY_NFT_ADDRESS } from "@/lib/contract";

const FOOTER_LINKS = {
  Platform: [
    { label: "Properties", href: "/properties" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Staking", href: "/staking" },
    { label: "Governance", href: "/governance" },
    { label: "Treasury", href: "/treasury" },
    { label: "Carbon Credits", href: "/carbon" },
  ],
  Protocol: [
    { label: "Tokenomics", href: "/tokenomics" },
    { label: "About", href: "/about" },
    { label: "Roadmap", href: "/about#roadmap" },
    { label: "Security", href: "/about#security" },
  ],
  Legal: [
    { label: "SEC ARIP Sandbox", href: "/sec-arip" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Risk Disclosure", href: "/risk-disclosure" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20" style={{ background: "rgba(7, 17, 26, 0.97)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <OsanVaultLockup markSize={40} />
            </Link>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs mb-5">
              Institutional-grade tokenized real estate infrastructure for African assets. Own fractions of premium properties from ₦1,000.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Shield, label: "SEC ARIP Sandbox" },
                { icon: Zap, label: "Polygon Network" },
                { icon: Globe, label: "Dual Verification" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs text-white/30 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                  <Icon className="h-3 w-3" /> {label}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white/25 uppercase tracking-widest mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            © 2025 ÒsánVault Africa Ltd. All rights reserved. Not financial advice.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Polygon Amoy Testnet
            </span>
            {IS_CONTRACT_DEPLOYED ? (
              <a
                href={`${POLYGONSCAN_BASE}/address/${PROPERTY_NFT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/50 transition-colors flex items-center gap-1"
              >
                Contract live <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ) : (
              <span>Pre-mainnet</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
