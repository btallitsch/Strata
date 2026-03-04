import { C, font } from "@/lib/constants/tokens";

interface TagProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}

export default function Tag({
  children,
  color = C.accent,
  bg = C.accentMuted,
}: TagProps) {
  return (
    <span
      style={{
        fontFamily: font.mono,
        fontSize: 10,
        fontWeight: 600,
        color,
        background: bg,
        border: `1px solid ${color}33`,
        padding: "2px 7px",
        borderRadius: 2,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </span>
  );
}
