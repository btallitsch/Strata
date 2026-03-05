"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: All status items were hardcoded strings. DB status was fake.
//
// AFTER:  useDBStatus() checks IndexedDB availability and workout count.
//         The "Offline Mode" indicator is now real — green dot if IndexedDB
//         is available, amber if not (e.g. private browsing).
//         Workout count comes from the actual Dexie workouts table.
// ─────────────────────────────────────────────────────────────────────────────

import { C, font } from "@/lib/constants/tokens";
import { useDBStatus } from "@/hooks/useDBStatus";

export default function StatusBar() {
  // ✅ NEW: real DB status
  const { available, workoutCount, isChecking } = useDBStatus();

  const dbLabel = isChecking
    ? "Checking..."
    : available
      ? `IndexedDB · ${workoutCount} session${workoutCount !== 1 ? "s" : ""}`
      : "Unavailable (private mode?)";

  const dotColor = isChecking ? C.muted : available ? C.accent : C.amber;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: "8px 32px",
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* Static items */}
      {[
        { label: "Model Version", value: "v1.0.0" },
        { label: "Data Last Synced", value: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
      ].map((item) => (
        <span
          key={item.label}
          style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}
        >
          {item.label}:{" "}
          <span style={{ color: C.body }}>{item.value}</span>
        </span>
      ))}

      {/* ✅ NEW: live DB status */}
      <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>
        Local DB:{" "}
        <span style={{ color: available ? C.body : C.amber }}>{dbLabel}</span>
      </span>

      {/* Engine online indicator */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dotColor,
            boxShadow: available ? `0 0 8px ${dotColor}` : "none",
            transition: "all 0.3s ease",
          }}
        />
        <span style={{ fontFamily: font.mono, fontSize: 10, color: dotColor }}>
          {isChecking ? "Connecting..." : available ? "Engine Online" : "No Persistence"}
        </span>
      </div>
    </div>
  );
}
