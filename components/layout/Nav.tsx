"use client";

import { C, font } from "@/lib/constants/tokens";
import Tag from "@/components/ui/Tag";
import type { NavItem, NavView } from "@/types";

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Intelligence", icon: "◈" },
  { id: "workout",   label: "Workouts",     icon: "↑" },
  { id: "nutrition", label: "Nutrition",    icon: "◎" },
  { id: "goals",     label: "Goals",        icon: "◆" },
];

interface NavProps {
  active: NavView;
  setActive: (view: NavView) => void;
}

export default function Nav({ active, setActive }: NavProps) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: C.bg + "ee",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        height: 56,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginRight: 40,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        >
          <span
            style={{ fontSize: 12, fontWeight: 900, color: C.bg }}
          >
            FI
          </span>
        </div>
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 13,
            fontWeight: 600,
            color: C.heading,
            letterSpacing: "0.05em",
          }}
        >
          FITNESS<span style={{ color: C.accent }}>IQ</span>
        </span>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              background: active === item.id ? C.accentMuted : "transparent",
              border: "none",
              color: active === item.id ? C.accent : C.muted,
              fontFamily: font.mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              padding: "6px 16px",
              cursor: "pointer",
              borderRadius: 3,
              textTransform: "uppercase" as const,
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Tag color={C.amber}>Week 8 of 12</Tag>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #4d9fff, #b8ff57)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font.mono,
            fontSize: 12,
            fontWeight: 700,
            color: C.bg,
          }}
        >
          A
        </div>
      </div>
    </nav>
  );
}
