import { C, font } from "@/lib/constants/tokens";

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: string;
}

export default function Stat({ label, value, unit, sub, accent }: StatProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: font.mono,
          fontSize: 10,
          color: C.muted,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: font.mono,
          fontSize: 26,
          fontWeight: 700,
          color: accent ?? C.heading,
          lineHeight: 1,
        }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 13, color: C.body, marginLeft: 3 }}>
            {unit}
          </span>
        )}
      </span>
      {sub && (
        <span style={{ fontFamily: font.body, fontSize: 11, color: C.muted }}>
          {sub}
        </span>
      )}
    </div>
  );
}
