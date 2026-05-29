import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface CinematicSlide {
  url: string;
  kb?: 1 | 2 | 3 | 4 | 5;
  position?: string;
}

interface CinematicBackgroundProps {
  images: CinematicSlide[];
  interval?: number;
  overlayIntensity?: "light" | "medium" | "heavy";
  showGrid?: boolean;
  fadeBottomColor?: string;
}

const KB_DURATIONS = [20000, 22000, 18000, 24000, 20000] as const;

export default function CinematicBackground({
  images,
  interval = 9500,
  overlayIntensity = "medium",
  showGrid = true,
  fadeBottomColor = "hsl(212,58%,6%)",
}: CinematicBackgroundProps) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % images.length;
        setLoaded((prev) => new Set([...prev, next, (next + 1) % images.length]));
        return next;
      });
    }, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length, interval]);

  const overlays = {
    light: {
      primary: "rgba(7,14,26,0.42)",
      mid: "rgba(7,14,26,0.28)",
      bottom: "rgba(7,14,26,0.60)",
    },
    medium: {
      primary: "rgba(7,14,26,0.55)",
      mid: "rgba(7,14,26,0.35)",
      bottom: "rgba(7,14,26,0.78)",
    },
    heavy: {
      primary: "rgba(7,14,26,0.72)",
      mid: "rgba(7,14,26,0.55)",
      bottom: "rgba(7,14,26,0.92)",
    },
  }[overlayIntensity];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence initial={false}>
        {images.map((slide, i) =>
          i === current ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
              className="absolute inset-0 will-change-transform"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: loaded.has(i) ? `url(${slide.url})` : undefined,
                  backgroundPosition: slide.position ?? "center",
                  animation: `kb-${slide.kb ?? ((i % 5) + 1)} ${KB_DURATIONS[(slide.kb ?? (i % 5 + 1)) - 1]}ms ease-in-out forwards`,
                  willChange: "transform",
                }}
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Preload next images off-screen */}
      {images.map((slide, i) =>
        loaded.has(i) && i !== current ? (
          <div
            key={`preload-${i}`}
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{ backgroundImage: `url(${slide.url})`, backgroundSize: "1px 1px" }}
          />
        ) : null
      )}

      {/* Layer 1 — primary dark overlay, center lighter for content */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 30% 40%, ${overlays.mid} 0%, ${overlays.primary} 100%)`,
        }}
      />

      {/* Layer 2 — vertical gradient: dark top (nav readability) + very dark bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(7,14,26,0.45) 0%,
            rgba(7,14,26,0.10) 22%,
            rgba(7,14,26,0.10) 60%,
            ${overlays.bottom} 100%
          )`,
        }}
      />

      {/* Layer 3 — subtle brand tint (emerald + gold at very low opacity) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(14,124,102,0.06) 0%,
            transparent 45%,
            rgba(212,175,55,0.04) 100%
          )`,
        }}
      />

      {/* Layer 4 — edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 90% at 50% 50%, transparent 50%, rgba(3,7,18,0.55) 100%)",
        }}
      />

      {/* Layer 5 — grid overlay */}
      {showGrid && (
        <div className="absolute inset-0 bg-grid-overlay opacity-25 pointer-events-none" />
      )}

      {/* Layer 6 — bottom fade into page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${fadeBottomColor} 100%)`,
        }}
      />
    </div>
  );
}
