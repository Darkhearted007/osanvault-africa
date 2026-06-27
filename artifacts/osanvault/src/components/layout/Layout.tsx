import type { ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const ROUTE_META: Record<string, { label: string; parent?: string; parentLabel?: string }> = {
  "/dashboard":     { label: "Dashboard" },
  "/properties":    { label: "Properties" },
  "/land-registry": { label: "Land Registry" },
  "/government":    { label: "Government PPP" },
  "/treasury":      { label: "Treasury" },
  "/staking":       { label: "Staking" },
  "/governance":    { label: "Governance" },
  "/carbon":        { label: "Carbon Credits" },
  "/portfolio":     { label: "Portfolio" },
  "/admin":         { label: "Admin" },
  "/about":         { label: "About" },
  "/tokenomics":    { label: "Tokenomics" },
};

function Breadcrumb() {
  const [location] = useLocation();

  if (location === "/") return null;

  const isPropertyDetail = /^\/properties\/\d+/.test(location);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  if (isPropertyDetail) {
    return (
      <div
        className="border-b border-white/[0.05]"
        style={{ background: "rgba(7,17,26,0.6)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/35 hover:text-white text-xs font-medium transition-colors group"
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
          <ChevronRight className="h-3 w-3 text-white/20" />
          <Link href="/properties">
            <span className="text-xs text-white/35 hover:text-white/70 transition-colors cursor-pointer">
              Properties
            </span>
          </Link>
          <ChevronRight className="h-3 w-3 text-white/20" />
          <span className="text-xs text-white/55">Property Detail</span>
        </div>
      </div>
    );
  }

  const meta = ROUTE_META[location];
  if (!meta) return null;

  return (
    <div
      className="border-b border-white/[0.05]"
      style={{ background: "rgba(7,17,26,0.6)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 flex items-center gap-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-white/35 hover:text-white text-xs font-medium transition-colors group"
        >
          <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
        <ChevronRight className="h-3 w-3 text-white/20" />
        <Link href="/">
          <span className="text-xs text-white/35 hover:text-white/70 transition-colors cursor-pointer">
            Home
          </span>
        </Link>
        <ChevronRight className="h-3 w-3 text-white/20" />
        <span className="text-xs text-white/55">{meta.label}</span>
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Breadcrumb />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
