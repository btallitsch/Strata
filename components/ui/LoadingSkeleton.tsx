import { C, font } from "@/lib/constants/tokens";

// ─── SKELETON BLOCK ───────────────────────────────────────────────────────────

function SkeletonBlock({
  width = "100%",
  height = 20,
  style = {},
}: {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${C.surface} 25%, ${C.surfaceAlt} 50%, ${C.surface} 75%)`,
        backgroundSize: "200% 100%",
        borderRadius: 3,
        animation: "shimmer 1.4s infinite",
        ...style,
      }}
    />
  );
}

// ─── LOADING SKELETON ────────────────────────────────────────────────────────

export default function LoadingSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonBlock width={220} height={12} />
          <SkeletonBlock width={420} height={36} />
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <SkeletonBlock width={90} height={10} />
              <SkeletonBlock width={70} height={28} />
              <SkeletonBlock width={110} height={10} />
            </div>
          ))}
        </div>

        {/* Chart row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "20px 24px" }}>
            <SkeletonBlock width={180} height={14} style={{ marginBottom: 20 }} />
            <SkeletonBlock width="100%" height={160} />
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "20px 24px" }}>
            <SkeletonBlock width={120} height={14} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[...Array(5)].map((_, i) => (
                <SkeletonBlock key={i} width="100%" height={12} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "20px 24px" }}>
              <SkeletonBlock width={160} height={14} style={{ marginBottom: 16 }} />
              <SkeletonBlock width="100%" height={130} />
            </div>
          ))}
        </div>

        {/* Status label */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, padding: "16px 0",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: C.accent,
            animation: "pulse 1.2s ease-in-out infinite",
          }} />
          <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>
            LOADING FROM LOCAL DATABASE...
          </span>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px ${C.accent}; }
            50%       { opacity: 0.4; box-shadow: none; }
          }
        `}</style>
      </div>
    </>
  );
}
