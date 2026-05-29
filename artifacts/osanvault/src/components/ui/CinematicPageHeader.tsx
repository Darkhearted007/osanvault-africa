import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface CinematicPageHeaderProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  kbVariant?: 1 | 2 | 3 | 4 | 5;
  imagePosition?: string;
  stats?: Array<{ label: string; value: string; color?: string }>;
  right?: React.ReactNode;
}

export default function CinematicPageHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  imageUrl,
  kbVariant = 2,
  imagePosition = "center 40%",
  stats,
  right,
}: CinematicPageHeaderProps) {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: 210 }}>
      {/* ── Ken Burns background image ──────────────────── */}
      <div
        className="absolute inset-0 bg-cover will-change-transform"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: imagePosition,
          animation: `kb-${kbVariant} ${[20000, 22000, 18000, 24000, 20000][kbVariant - 1]}ms ease-in-out forwards`,
        }}
        aria-hidden="true"
      />

      {/* ── Overlay stack ────────────────────────────────── */}
      {/* 1. Radial centre vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(7,14,26,0.50) 0%, rgba(7,14,26,0.82) 100%)" }}
        aria-hidden="true"
      />
      {/* 2. Top-heavy vertical gradient (nav reads above, content below) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(7,14,26,0.55) 0%, rgba(7,14,26,0.18) 50%, rgba(7,14,26,0.72) 100%)" }}
        aria-hidden="true"
      />
      {/* 3. Subtle brand tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(14,124,102,0.07) 0%, transparent 60%, rgba(212,175,55,0.04) 100%)" }}
        aria-hidden="true"
      />
      {/* 4. Grid overlay */}
      <div className="absolute inset-0 bg-grid-overlay opacity-20" aria-hidden="true" />
      {/* 5. Bottom fade to page bg */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(212,58%,6%) 100%)" }}
        aria-hidden="true"
      />
      {/* 6. Left accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(14,124,102,0.4) 40%, rgba(212,175,55,0.3) 70%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{eyebrow}</p>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 backdrop-blur-sm">
                <Icon className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
              </div>
              <h1
                className="font-display text-2xl sm:text-3xl font-bold text-white"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
              >
                {title}
              </h1>
            </div>
            {subtitle && (
              <p
                className="text-sm text-white/55 max-w-xl leading-relaxed"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
              >
                {subtitle}
              </p>
            )}
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-3">
                {stats.map(({ label, value, color }) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <span className={`text-base font-bold font-display ${color ?? "text-white"}`}>{value}</span>
                    <span className="text-xs text-white/35">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {right && (
            <div className="flex-shrink-0">{right}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
