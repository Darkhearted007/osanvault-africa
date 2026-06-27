import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Building2, MapPin, TrendingUp, Leaf, ArrowRight, Search } from "lucide-react";
import {
  PLATFORM_STATS,
  formatNgn,
  fundingPct,
} from "@/lib/mock-data";
import type { Property } from "@workspace/api-client-react";
import { useListProperties, useGetPlatformStats } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";

const PROPERTY_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=70",
  2: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=70",
  3: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=70",
  4: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=70",
  5: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=70",
  6: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=70",
};

type FilterType = "All" | "LandBank" | "Commercial" | "Residential" | "Industrial" | "Mixed";
type FilterStatus = "All" | "live" | "funding" | "closed";

const TYPE_FILTERS: FilterType[] = ["All", "LandBank", "Commercial", "Residential", "Industrial", "Mixed"];
const STATUS_COLORS: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  funding: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  closed: "bg-muted text-muted-foreground",
};
const TYPE_COLORS: Record<string, string> = {
  LandBank: "bg-primary/10 text-primary",
  Commercial: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Residential: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Industrial: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Mixed: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function PropertyCard({ property }: { property: Property }) {
  const pct = fundingPct(property);
  const cardImg = PROPERTY_IMAGES[property.id as keyof typeof PROPERTY_IMAGES];
  return (
    <Link href={`/properties/${property.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col group"
      >
        {/* Photo header */}
        <div
          className="h-36 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${property.gradientFrom}, ${property.gradientTo})` }}
        >
          {cardImg && (
            <img
              src={cardImg}
              alt={property.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          {/* dark-to-transparent overlay for readability */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,14,26,0.15) 0%, rgba(7,14,26,0.60) 100%)" }} />
          {/* brand tint */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${property.gradientFrom}55 0%, transparent 65%)` }} />
          <div className="absolute inset-0 flex items-end p-4 z-10">
            <div className="flex items-center justify-between w-full">
              <span className="text-3xl drop-shadow">{property.flag}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize backdrop-blur-sm ${STATUS_COLORS[property.status]}`}>
                  {property.status}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${TYPE_COLORS[property.type]}`}>
                  {property.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground leading-tight mb-1">{property.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            {property.location}
          </div>

          {/* Funding progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Funding</span>
              <span className="font-semibold text-foreground">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatNgn(property.raised)}</span>
              <span>{formatNgn(property.targetRaise)}</span>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-muted/50 rounded-lg py-2">
              <div className="text-xs text-muted-foreground mb-0.5">APY</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{property.yieldApy}%</div>
            </div>
            <div className="bg-muted/50 rounded-lg py-2">
              <div className="text-xs text-muted-foreground mb-0.5">From</div>
              <div className="text-sm font-bold text-foreground">₦{property.tokenPrice.toLocaleString()}</div>
            </div>
            <div className="bg-muted/50 rounded-lg py-2">
              <div className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-0.5"><Leaf className="h-2.5 w-2.5" />CO₂e</div>
              <div className="text-sm font-bold text-foreground">{(property.carbonOffsetTonnes / 1000).toFixed(1)}K</div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between text-sm">
            <span className="text-muted-foreground text-xs">{property.size}</span>
            <span className="font-medium text-primary flex items-center gap-1 text-sm">
              View SPV <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function PropertiesPage() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");

  const { data: propertiesData } = useListProperties();
  const { data: statsData } = useGetPlatformStats();
  const allProperties = propertiesData ?? [];
  const stats = statsData ?? PLATFORM_STATS;

  const filtered = allProperties.filter((p) => {
    if (typeFilter !== "All" && p.type !== typeFilter) return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <CinematicPageHeader
        icon={Building2}
        eyebrow="Real Estate"
        title="Property SPVs"
        subtitle="Tokenized African real estate — fractional ownership from ₦1,000 across Nigeria, Ghana &amp; Kenya"
        imageUrl="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
        kbVariant={3}
        imagePosition="center 50%"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tokenized Properties</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {stats.propertiesLive} verified real estate SPVs across Africa — own fractions on-chain.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-card border border-card-border rounded-lg px-3 py-2">
                <div className="text-sm font-bold text-foreground">{stats.propertiesLive}</div>
                <div className="text-xs text-muted-foreground">Properties</div>
              </div>
              <div className="bg-card border border-card-border rounded-lg px-3 py-2">
                <div className="text-sm font-bold text-foreground">{formatNgn(stats.tvlNgn)}</div>
                <div className="text-xs text-muted-foreground">TVL</div>
              </div>
              <div className="bg-card border border-card-border rounded-lg px-3 py-2">
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.avgPropertyYield}%</div>
                <div className="text-xs text-muted-foreground">Avg APY</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search properties"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["All", "live", "funding"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as FilterStatus)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-primary/10 text-primary ring-1 ring-primary/40"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t === "All" ? <Building2 className="h-3 w-3" /> : null}
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground font-medium">No properties match your filter.</p>
            <button onClick={() => { setTypeFilter("All"); setStatusFilter("All"); setSearch(""); }} className="mt-3 text-sm text-primary hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              >
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Trust signal */}
        <div className="mt-10 bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/15 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <TrendingUp className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">All SPVs are Dual-Verified</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every property undergoes government title verification (hash stored on-chain) +
              indigenous authority approval via <span className="font-mono">LandRegistry.sol</span> before tokenization.
              Operating under SEC Nigeria ARIP Sandbox.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
