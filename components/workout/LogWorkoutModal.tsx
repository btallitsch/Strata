"use client";

import { useState, useCallback, useMemo } from "react";
import { C, font } from "@/lib/constants/tokens";
import ExerciseRow, { type DraftExercise, emptyExercise } from "./ExerciseRow";
import type { Exercise, ExerciseSet } from "@/types";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toNumber(s: string, fallback = 0): number {
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}

/** Convert draft exercise → final Exercise type, validating as we go */
function draftToExercise(d: DraftExercise): Exercise {
  const sets: ExerciseSet[] = d.sets
    .filter((s) => s.reps !== "")  // skip totally empty rows
    .map((s) => ({
      weight: toNumber(s.weight, 0),
      reps:   toNumber(s.reps, 0),
    }));

  return {
    name: d.name.trim() || "Unknown Exercise",
    sets: sets.length > 0 ? sets : [{ weight: 0, reps: 0 }],
    rpe:  toNumber(d.rpe, 8),
  };
}

/** Live volume preview — same formula as calcSessionVolume */
function calcDraftVolume(exercises: DraftExercise[]): number {
  return exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((s, set) => {
      return s + toNumber(set.weight) * toNumber(set.reps);
    }, 0);
  }, 0);
}

function formatVol(lbs: number): string {
  return lbs >= 1000 ? `${(lbs / 1000).toFixed(1)}k` : `${lbs}`;
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function validate(
  label: string,
  exercises: DraftExercise[]
): ValidationResult {
  const errors: string[] = [];

  if (!label.trim()) errors.push("Session name is required.");

  if (exercises.length === 0) errors.push("Add at least one exercise.");

  exercises.forEach((ex, i) => {
    if (!ex.name.trim()) errors.push(`Exercise ${i + 1} needs a name.`);
    const validSets = ex.sets.filter((s) => s.reps !== "");
    if (validSets.length === 0)
      errors.push(`Exercise ${i + 1} needs at least one completed set.`);
  });

  return { ok: errors.length === 0, errors };
}

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface LogWorkoutModalProps {
  onSave:  (session: Omit<import("@/types").WorkoutSession, "id" | "volume" | "prs">) => void;
  onClose: () => void;
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

export default function LogWorkoutModal({ onSave, onClose }: LogWorkoutModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [label,     setLabel]     = useState("Workout");
  const [date,      setDate]      = useState(today);
  const [exercises, setExercises] = useState<DraftExercise[]>([emptyExercise()]);
  const [errors,    setErrors]    = useState<string[]>([]);
  const [saving,    setSaving]    = useState(false);

  // ── Exercise list operations ───────────────────────────────────────────────
  const updateExercise = useCallback((i: number, updated: DraftExercise) => {
    setExercises((prev) => prev.map((ex, idx) => idx === i ? updated : ex));
  }, []);

  const removeExercise = useCallback((i: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const addExercise = () => {
    setExercises((prev) => [...prev, emptyExercise()]);
    // Scroll to bottom of modal so new row is visible
    setTimeout(() => {
      document.getElementById("modal-scroll-anchor")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // ── Live volume preview ────────────────────────────────────────────────────
  const draftVolume = useMemo(() => calcDraftVolume(exercises), [exercises]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const result = validate(label, exercises);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    setSaving(true);

    const finalExercises = exercises.map(draftToExercise);
    onSave({ label: label.trim(), date, exercises: finalExercises });
    onClose();
  };

  // ── Input style helper ────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: C.surfaceAlt, border: `1px solid ${C.border}`,
    borderRadius: 3, padding: "9px 12px", color: C.heading,
    fontFamily: font.mono, fontSize: 12, outline: "none", width: "100%",
  };

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)",
        }}
      />

      {/* ── Panel ───────────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 101,
        width: "min(560px, 95vw)",
        background: C.bg, borderLeft: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>
              New Session
            </p>
            <h2 style={{ fontFamily: font.display, fontSize: 22, color: C.heading, margin: 0 }}>
              Log Workout
            </h2>
          </div>

          {/* Live volume badge */}
          {draftVolume > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                Volume
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 22, fontWeight: 700, color: C.accent }}>
                {formatVol(draftVolume)}
                <span style={{ fontSize: 11, color: C.body, marginLeft: 3 }}>lbs</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              background: "none", border: `1px solid ${C.border}`, borderRadius: 3,
              color: C.muted, fontSize: 16, width: 32, height: 32,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* Session details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 24 }}>
            <div>
              <label style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                Session Name
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Upper A, Leg Day…"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e)  => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div>
              <label style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  ...inputStyle, width: "auto",
                  colorScheme: "dark",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.accent)}
                onBlur={(e)  => (e.target.style.borderColor = C.border)}
              />
            </div>
          </div>

          {/* Quick-add buttons */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Quick Add
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Squat", "Bench Press", "Deadlift", "OHP", "Barbell Row", "Pull-ups"].map((name) => (
                <button
                  key={name}
                  onClick={() => setExercises((prev) => [...prev, { name, sets: [{ weight: "", reps: "" }], rpe: "8" }])}
                  style={{
                    background: C.surfaceAlt, border: `1px solid ${C.border}`,
                    color: C.body, fontFamily: font.mono, fontSize: 10,
                    padding: "4px 10px", borderRadius: 2, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor = C.accentDim;
                    (e.target as HTMLElement).style.color = C.accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor = C.border;
                    (e.target as HTMLElement).style.color = C.body;
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

          {/* Exercise list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {exercises.map((ex, i) => (
              <ExerciseRow
                key={i}
                index={i}
                exercise={ex}
                onChange={(updated) => updateExercise(i, updated)}
                onRemove={() => removeExercise(i)}
                isOnly={exercises.length === 1}
              />
            ))}
          </div>

          {/* Add exercise */}
          <button
            onClick={addExercise}
            style={{
              width: "100%", marginTop: 12,
              background: "transparent", border: `1px dashed ${C.border}`,
              color: C.muted, fontFamily: font.mono, fontSize: 11,
              padding: "12px", borderRadius: 3, cursor: "pointer",
              letterSpacing: "0.08em", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = C.accent;
              (e.target as HTMLElement).style.color = C.accent;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = C.border;
              (e.target as HTMLElement).style.color = C.muted;
            }}
          >
            + Add Exercise
          </button>

          {/* Scroll anchor */}
          <div id="modal-scroll-anchor" style={{ height: 1 }} />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {/* Validation errors */}
          {errors.length > 0 && (
            <div style={{
              marginBottom: 12, padding: "10px 14px",
              background: C.red + "12", border: `1px solid ${C.red}40`,
              borderRadius: 3,
            }}>
              {errors.map((err, i) => (
                <div key={i} style={{ fontFamily: font.mono, fontSize: 11, color: C.red }}>
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Summary row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 20 }}>
              <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted }}>
                <span style={{ color: C.heading }}>{exercises.length}</span> exercise{exercises.length !== 1 ? "s" : ""}
              </span>
              <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted }}>
                <span style={{ color: C.heading }}>{exercises.reduce((s, ex) => s + ex.sets.length, 0)}</span> sets
              </span>
              {draftVolume > 0 && (
                <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted }}>
                  <span style={{ color: C.accent }}>{formatVol(draftVolume)}</span> lbs
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, background: "transparent",
                border: `1px solid ${C.border}`, borderRadius: 3,
                color: C.muted, fontFamily: font.mono, fontSize: 11,
                padding: "11px", cursor: "pointer", letterSpacing: "0.06em",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, background: C.accent, border: "none", borderRadius: 3,
                color: C.bg, fontFamily: font.mono, fontSize: 12, fontWeight: 700,
                padding: "11px", cursor: saving ? "default" : "pointer",
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                opacity: saving ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >
              {saving ? "Saving..." : "Save Session"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
