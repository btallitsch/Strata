import { C } from "@/lib/constants/tokens";
import { CSSProperties } from "react";

interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  accent?: string;
}

export default function Card({ children, style, accent }: CardProps) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${accent ? accent + "40" : C.border}`,
        borderTop: accent ? `2px solid ${accent}` : undefined,
        borderRadius: 4,
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
