interface MarkProps {
  size?: number;
  className?: string;
}

export function OsanVaultMark({ size = 36, className = "" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ov-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0fa882" />
          <stop offset="100%" stopColor="#054f3a" />
        </linearGradient>
        <linearGradient id="ov-shimmer" x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ov-gold" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#F0D060" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id="ov-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect width="44" height="44" rx="11" fill="url(#ov-bg)" />

      {/* Inner border highlight */}
      <rect x="1" y="1" width="42" height="42" rx="10.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* Top shimmer streak */}
      <rect x="4" y="3" width="36" height="2.5" rx="1.25" fill="url(#ov-shimmer)" />

      {/* ── SKYLINE ── */}

      {/* Ground / base platform */}
      <rect x="6" y="33" width="32" height="2.5" rx="1.2" fill="white" fillOpacity="0.75" />

      {/* Far-left low building */}
      <rect x="7" y="27" width="5.5" height="8" rx="1" fill="white" fillOpacity="0.35" />

      {/* Left mid building */}
      <rect x="11" y="23" width="6" height="12" rx="1" fill="white" fillOpacity="0.55" />
      {/* window */}
      <rect x="12.5" y="25" width="3" height="2" rx="0.5" fill="#D4AF37" fillOpacity="0.6" />

      {/* Center TALL building — hero element */}
      <rect x="18" y="14" width="8" height="21" rx="1.5" fill="white" fillOpacity="0.95" />
      {/* Center windows */}
      <rect x="19.5" y="17" width="5" height="2.5" rx="0.5" fill="#D4AF37" fillOpacity="0.9" />
      <rect x="19.5" y="21.5" width="5" height="2.5" rx="0.5" fill="#D4AF37" fillOpacity="0.65" />
      <rect x="19.5" y="26" width="5" height="2.5" rx="0.5" fill="#D4AF37" fillOpacity="0.4" />

      {/* Right mid building */}
      <rect x="27" y="20" width="6" height="15" rx="1" fill="white" fillOpacity="0.55" />
      {/* window */}
      <rect x="28.5" y="22" width="3" height="2" rx="0.5" fill="#D4AF37" fillOpacity="0.6" />

      {/* Far-right low building */}
      <rect x="32" y="26" width="5.5" height="9" rx="1" fill="white" fillOpacity="0.35" />

      {/* ── GOLD DIAMOND CROWN (token) on center tower ── */}
      <g filter="url(#ov-glow)">
        <polygon
          points="22,5.5  25.2,10  22,13.5  18.8,10"
          fill="url(#ov-gold)"
        />
        <polygon
          points="22,5.5  25.2,10  22,13.5  18.8,10"
          fill="none"
          stroke="#F5E080"
          strokeWidth="0.5"
          strokeOpacity="0.8"
        />
        {/* inner highlight */}
        <polygon
          points="22,7.5  24,10  22,12  20,10"
          fill="white"
          fillOpacity="0.25"
        />
      </g>
    </svg>
  );
}

interface LockupProps {
  markSize?: number;
  className?: string;
  variant?: "full" | "stacked" | "mark-only";
}

export function OsanVaultLockup({ markSize = 36, className = "", variant = "full" }: LockupProps) {
  if (variant === "mark-only") return <OsanVaultMark size={markSize} className={className} />;

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <OsanVaultMark size={markSize} />
        <div className="text-center leading-none">
          <div className="font-display font-bold text-white tracking-tight" style={{ fontSize: markSize * 0.38 }}>ÒsánVault</div>
          <div className="font-medium uppercase tracking-[0.18em] text-amber-400" style={{ fontSize: markSize * 0.22, marginTop: 2 }}>Africa</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <OsanVaultMark size={markSize} />
      <div className="leading-none select-none">
        <div className="font-display font-bold text-white tracking-tight" style={{ fontSize: markSize * 0.41, lineHeight: 1.1 }}>
          ÒsánVault
        </div>
        <div
          className="font-semibold uppercase tracking-[0.2em]"
          style={{
            fontSize: markSize * 0.24,
            marginTop: 1,
            background: "linear-gradient(90deg, #D4AF37 0%, #F0D060 50%, #B8860B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Africa
        </div>
      </div>
    </div>
  );
}
