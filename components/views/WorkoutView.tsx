"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: workoutLog imported directly from mockData. Selecting a session
//         used local useState with a hardcoded ID. "Log Workout" button
//         did nothing.
//
// AFTER:  workouts come from the Zustand store via useWorkouts().
//         addWorkout() from useWorkoutActions() writes a new session
//         into the store — which immediately re-renders this view AND
//         the Dashboard (consistency score, volume KPI).
//         Selected session ID is still local state (fine — it's UI-only).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Tag from "@/components/ui/Tag";
import { SectionLabel, RPEBadge } from "@/components/ui/misc";
import { C, font } from "@/lib/constants/tokens";

// ✅ NEW: store replaces mockData
import { useWorkouts, useWorkoutActions } from "@/store";
import { calcExerciseVolume, formatVolume } from "@/lib/utils/workout";

// ─── QUICK-LOG TEMPLATE ───────────────────────────────────────────────────────
// Real app: replace with a proper form. For now, one-tap adds a
// representative session so you can see the store react.

const QUICK_LOG_TEMPLATE = {
  date: new Date().toISOString().split("T")[0],
  label: "Quick Session",
  exercises: [
    {
      name: "Squat",
      sets: [
        { weight: 250, reps: 4 },
        { weight: 250, reps: 4 },
        { weight: 255, reps: 3 },
      ],
      rpe: 8.5,
    },
    {
      name: "Bench Press",
      sets: [
        { weight: 190, reps: 5 },
        { weight: 190, reps: 4 },
      ],
      rpe: 8,
    },
  ],
};

export default function WorkoutView() {
  // ✅ NEW: live from store instead of imported mockData array
  const workouts = useWorkouts();
  const { addWorkout } = useWorkoutActions();

  // UI-only state — fine to keep local
  const [selectedId, setSelectedId] = useState(workouts[0]?.id);

  const session = workouts.find((w) => w.id === selectedId) ?? workouts[0];

  // ✅ NEW: writes to the store → Dashboard KPIs update immediately
  const handleLogWorkout = () => {
    addWorkout(QUICK_LOG_TEMPLATE);
    // Auto-select the new session (it lands at index 0 after prepend)
    // We read the updated workouts in the next render, so use Date.now()
    // approximation — a real form would get the id back from addWorkout.
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
            Workout Tracker
          </p>
          <h1 style={{ fontFamily: font.display, fontSize: 32, color: C.heading, margin: 0 }}>
            Session History
          </h1>
        </div>
        {/* ✅ NEW: button now calls addWorkout() on the store */}
        <button
          onClick={handleLogWorkout}
          style={{
            background: C.accent, color: C.bg, border: "none",
            fontFamily: font.mono, fontSize: 11, fontWeight: 700,
            padding: "10px 20px", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.08em", textTransform: "uppercase" as const,
          }}
        >
          + Log Workout
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Session list — ✅ iterates live workouts from store */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>Recent Sessions</SectionLabel>
          {workouts.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                background: selectedId === s.id ? C.accentMuted : C.surface,
                border: `1px solid ${selectedId === s.id ? C.accent + "50" : C.border}`,
                borderLeft: `3px solid ${selectedId === s.id ? C.accent : C.border}`,
                borderRadius: 3, padding: "14px 16px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontFamily: font.mono, fontSize: 12, color: selectedId === s.id ? C.accent : C.heading, fontWeight: 600 }}>
                  {s.label}
                </span>
                {s.prs > 0 && <Tag color={C.amber} bg="#2e1e00">PR ×{s.prs}</Tag>}
              </div>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>{s.date}</span>
              <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                <span style={{ fontFamily: font.mono, fontSize: 11, color: C.body }}>{s.exercises.length} exercises</span>
                <span style={{ fontFamily: font.mono, fontSize: 11, color: C.body }}>{formatVolume(s.volume)} vol</span>
              </div>
            </div>
          ))}
        </div>

        {/* Session detail — unchanged structure, data now from store */}
        {session && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionLabel>{session.date} — {session.label}</SectionLabel>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Card><Stat label="Total Volume" value={formatVolume(session.volume)} unit="lbs" /></Card>
              <Card><Stat label="Exercises"    value={session.exercises.length} /></Card>
              <Card><Stat label="PRs"          value={session.prs} accent={session.prs > 0 ? C.amber : undefined} /></Card>
            </div>

            {session.exercises.map((ex, i) => {
              const exVol = calcExerciseVolume(ex.sets);
              return (
                <Card key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontFamily: font.mono, fontSize: 13, color: C.heading, fontWeight: 600 }}>{ex.name}</span>
                    <RPEBadge rpe={ex.rpe} />
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    {ex.sets.map((set, j) => (
                      <div key={j} style={{
                        background: C.surfaceAlt, border: `1px solid ${C.border}`,
                        borderRadius: 3, padding: "8px 14px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                        minWidth: 70,
                      }}>
                        <span style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: C.heading }}>
                          {set.weight > 0 ? set.weight : "BW"}
                        </span>
                        <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>{set.weight > 0 ? "lbs" : ""}</span>
                        <span style={{ fontFamily: font.mono, fontSize: 11, color: C.accent }}>×{set.reps}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 12, fontFamily: font.mono, fontSize: 10, color: C.muted }}>
                    Volume: {exVol.toLocaleString()} lbs
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
