import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, ChevronDown, LayoutDashboard, Building2, Map, Landmark, Vault, TrendingUp, Vote, Leaf, Shield, Briefcase, BadgeCheck, UserCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { OsanVaultLockup } from "@/components/ui/OsanVaultLogo";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/carbon", label: "Carbon Credits", icon: Leaf },
  { href: "/staking", label: "Staking", icon: TrendingUp },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
];

const SECONDARY_NAV = [
  { href: "/governance", label: "Governance", icon: Vote },
  { href: "/land-registry", label: "Land Registry", icon: Map },
  { href: "/government", label: "Government", icon: Landmark },
  { href: "/treasury", label: "Treasury", icon: Vault },
  { href: "/whitelist", label: "Whitelist", icon: UserCheck },
  { href: "/admin", label: "Admin", icon: Shield },
];

const ISSUER_LINK = { href: "/issuer", label: "List a Property", icon: BadgeCheck };

const EARLY_ACCESS_LINK = { href: "/early-access", label: "Early Investor Access", icon: Star };
const MOBILE_ALL_NAV = [EARLY_ACCESS_LINK, ...PRIMARY_NAV, ISSUER_LINK, ...SECONDARY_NAV];

export default function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="border-b border-white/[0.06] backdrop-blur-xl"
        style={{ background: "rgba(7, 17, 26, 0.92)" }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <OsanVaultLockup markSize={30} />
          </Link>

          {/* Nav row — scrollable primary links + More dropdown outside the overflow container */}
          <nav className="hidden lg:flex flex-1 min-w-0 items-center">
            {/* Scrollable primary links — overflow-x only, no y clipping */}
            <div className="flex min-w-0 flex-1 overflow-x-auto scrollbar-hide items-center gap-0.5">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                    isActive(link.href)
                      ? "text-white"
                      : "text-white/45 hover:text-white/85"
                  )}
                >
                  {isActive(link.href) && (
                    <span className="absolute inset-0 rounded-md bg-white/[0.07]" />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              ))}

              {/* List a Property — always-visible CTA tab */}
              <Link
                href="/issuer"
                className={cn(
                  "relative ml-1 shrink-0 flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                  isActive("/issuer")
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-primary/25 bg-primary/8 text-primary/75 hover:border-primary/50 hover:bg-primary/15 hover:text-primary"
                )}
              >
                <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                <span>List a Property</span>
              </Link>
            </div>

            {/* More dropdown — lives OUTSIDE the overflow container so the menu isn't clipped */}
            <div className="relative ml-0.5 shrink-0">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
                  moreOpen ? "text-white" : "text-white/45 hover:text-white/85"
                )}
              >
                More <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl border border-white/[0.08] py-1.5 shadow-2xl"
                    style={{ background: "rgba(10, 15, 28, 0.98)", backdropFilter: "blur(24px)" }}
                  >
                    {SECONDARY_NAV.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors",
                            isActive(link.href)
                              ? "text-primary font-medium bg-primary/5"
                              : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/early-access"
              className={cn(
                "hidden lg:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-all duration-150",
                isActive("/early-access")
                  ? "border-amber-400/60 bg-amber-400/15 text-amber-400"
                  : "border-amber-400/30 bg-amber-400/8 text-amber-400/80 hover:border-amber-400/55 hover:bg-amber-400/15 hover:text-amber-400"
              )}
            >
              <Star className="h-3 w-3 shrink-0" />
              Early Access
            </Link>
            <div className="hidden md:block">
              <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
            </div>
            <button
              className="lg:hidden rounded-md p-2 text-white/45 hover:text-white hover:bg-white/[0.07] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {mobileOpen && (
        <div
          className="lg:hidden border-b border-white/[0.06] overflow-y-auto"
          style={{ background: "rgba(7, 17, 26, 0.98)", maxHeight: "calc(100svh - 3.5rem)" }}
        >
          <div className="px-4 py-4 space-y-0.5">
            {MOBILE_ALL_NAV.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary/10 text-white"
                      : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 pb-1">
              <ConnectButton accountStatus="full" chainStatus="full" showBalance={false} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
