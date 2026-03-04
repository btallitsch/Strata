import { C, font } from "@/lib/constants/tokens";
import { rpeColor } from "@/lib/utils/workout";
import { CSSProperties } from "react";

// ─── DIVIDER ─────────────────────────────────────────────────────────────────

interface DividerProps {
  style?: CSSProperties;
}

export function Divider({ style }: DividerProps) {
  return <div style={{ height: 1, background: C.border, ...style }} />;
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────

interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: 10,
        color: C.muted,
        textTransform: "uppercase" as const,
        letterSpacing: "0.15em",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ width: 16, height: 1, background: C.border }} />
      {children}
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ─── RPE BADGE ────────────────────────────────────────────────────────────────

interface RPEBadgeProps {
  rpe: number;
}

export function RPEBadge({ rpe }: RPEBadgeProps) {
  const color = rpeColor(rpe);
  return (
    <span
      style={{
        fontFamily: font.mono,
        fontSize: 11,
        color,
        border: `1px solid ${color}55`,
        padding: "1px 6px",
        borderRadius: 2,
      }}
    >
      RPE {rpe}
    </span>
  );
}

// ─── CHART TOOLTIP ────────────────────────────────────────────────────────────

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  unit?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: C.surfaceAlt,
        border: `1px solid ${C.borderBright}`,
        borderRadius: 3,
        padding: "8px 14px",
      }}
    >
      <div
        style={{
          fontFamily: font.mono,
          fontSize: 10,
          color: C.muted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            fontFamily: font.mono,
            fontSize: 12,
            color: p.color ?? C.heading,
          }}
        >
          {p.name}: {p.value}
          {unit}
        </div>
      ))}
    </div>
  );
}
