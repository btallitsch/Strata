"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: "+ Log Workout" button added a hardcoded template session.
//
// AFTER:  Button opens LogWorkoutModal. The modal handles all form state
//         locally (draft exercises, validation, volume preview) and calls
//         addWorkout() on save — writing to the Zustand store + Dexie.
//         WorkoutView itself only manages: modal open/closed + selected session.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Tag from "@/components/ui/Tag";
import { SectionLabel, RPEBadge } from "@/components/ui/misc";
import LogWorkoutModal from "@/components/workout/LogWorkoutModal"; // ← NEW
import { C, font } from "@/lib/constants/tokens";

import { useWorkouts, useWorkoutActions } from "@/store";
import { calcExerciseVolume, formatVolume } from "@/lib/utils/workout";

export default function WorkoutView() {
  const workouts = useWorkouts();
  const { addWorkout } = useWorkoutActions();

  // UI-only state
  const [selectedId, setSelectedId] = useState(workouts[0]?.id);
  const [modalOpen,  setModalOpen]  = useState(false); // ← NEW

  const session = workouts.find((w) => w.id === selectedId) ?? workouts[0];

  return (
    <>
      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {/* ✅ NEW: replaces the QUICK_LOG_TEMPLATE hack */}
      {modalOpen && (
        <LogWorkoutModal
          onSave={(draft) => {
            addWorkout(draft);
            // Select the new session — it'll land at workouts[0] next render
            // We can't read the new id synchronously, so we just clear
            // selectedId and let the "?? workouts[0]" fallback do the work.
            setSelectedId(undefined as unknown as number);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}

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

          {/* ✅ NEW: opens the real modal instead of adding a template */}
          <button
            onClick={() => setModalOpen(true)}
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
          {/* Session list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Recent Sessions</SectionLabel>

            {workouts.length === 0 ? (
              <div style={{
                padding: "32px 16px", textAlign: "center",
                border: `1px dashed ${C.border}`, borderRadius: 4,
              }}>
                <div style={{ fontFamily: font.mono, fontSize: 11, color: C.muted, marginBottom: 8 }}>No sessions yet</div>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{
                    background: "none", border: "none",
                    color: C.accent, fontFamily: font.mono, fontSize: 11,
                    cursor: "pointer", letterSpacing: "0.06em",
                  }}
                >
                  Log your first workout →
                </button>
              </div>
            ) : (
              workouts.map((s) => (
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
              ))
            )}
          </div>

          {/* Session detail — unchanged */}
          {session ? (
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
          ) : (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px dashed ${C.border}`, borderRadius: 4, minHeight: 200,
            }}>
              <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted }}>
                Select a session to view details
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
