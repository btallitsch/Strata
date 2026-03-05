"use client";

import { C, font } from "@/lib/constants/tokens";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface DraftSet {
  weight: string; // string so inputs are controlled without NaN flicker
  reps: string;
}

export interface DraftExercise {
  name: string;
  sets: DraftSet[];
  rpe: string;
}

export function emptyExercise(): DraftExercise {
  return { name: "", sets: [{ weight: "", reps: "" }], rpe: "8" };
}

// ─── COMMON EXERCISE SUGGESTIONS ─────────────────────────────────────────────

const SUGGESTIONS = [
  "Squat", "Bench Press", "Deadlift", "Overhead Press", "Barbell Row",
  "Pull-ups", "RDL", "Leg Press", "Incline Bench", "Dumbbell Row",
  "Lat Pulldown", "Cable Row", "Dumbbell Curl", "Tricep Pushdown",
  "Hip Thrust", "Bulgarian Split Squat", "Dumbbell Shoulder Press",
  "Face Pull", "Leg Curl", "Leg Extension",
];

// ─── SMALL REUSABLE INPUT ────────────────────────────────────────────────────

function NumInput({
  value, onChange, placeholder, width = 64,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width?: number;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width, background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: 3, padding: "6px 8px", color: C.heading,
        fontFamily: font.mono, fontSize: 13, textAlign: "center",
        outline: "none", appearance: "none" as const,
      }}
      onFocus={(e) => (e.target.style.borderColor = C.accent)}
      onBlur={(e)  => (e.target.style.borderColor = C.border)}
    />
  );
}

// ─── EXERCISE ROW ─────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  index: number;
  exercise: DraftExercise;
  onChange: (updated: DraftExercise) => void;
  onRemove: () => void;
  isOnly: boolean; // disable remove button when it's the last exercise
}

export default function ExerciseRow({
  index, exercise, onChange, onRemove, isOnly,
}: ExerciseRowProps) {

  const update = (patch: Partial<DraftExercise>) =>
    onChange({ ...exercise, ...patch });

  const updateSet = (i: number, patch: Partial<DraftSet>) =>
    update({
      sets: exercise.sets.map((s, idx) => idx === i ? { ...s, ...patch } : s),
    });

  const addSet = () => {
    // Pre-fill weight from last set so user doesn't have to retype
    const last = exercise.sets[exercise.sets.length - 1];
    update({ sets: [...exercise.sets, { weight: last?.weight ?? "", reps: "" }] });
  };

  const removeSet = (i: number) =>
    update({ sets: exercise.sets.filter((_, idx) => idx !== i) });

  // Autocomplete: filter suggestions that match current input
  const matches = exercise.name.length >= 1
    ? SUGGESTIONS.filter((s) =>
        s.toLowerCase().startsWith(exercise.name.toLowerCase()) &&
        s.toLowerCase() !== exercise.name.toLowerCase()
      ).slice(0, 5)
    : [];

  const rpeNum = parseFloat(exercise.rpe) || 0;
  const rpeColor =
    rpeNum >= 9 ? C.red : rpeNum >= 8 ? C.amber : C.accent;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.borderBright}`,
      borderRadius: 4, padding: "16px 18px",
    }}>
      {/* ── Exercise header ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, width: 18 }}>
          {index + 1}.
        </span>

        {/* Name + autocomplete */}
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={exercise.name}
            placeholder="Exercise name"
            onChange={(e) => update({ name: e.target.value })}
            style={{
              width: "100%", background: C.surfaceAlt,
              border: `1px solid ${C.border}`, borderRadius: 3,
              padding: "8px 12px", color: C.heading,
              fontFamily: font.mono, fontSize: 12,
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => {
              e.target.style.borderColor = C.border;
            }}
          />
          {/* Suggestions dropdown */}
          {matches.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
              background: C.surfaceAlt, border: `1px solid ${C.borderBright}`,
              borderTop: "none", borderRadius: "0 0 3px 3px",
            }}>
              {matches.map((s) => (
                <div
                  key={s}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur before click
                    update({ name: s });
                  }}
                  style={{
                    padding: "8px 12px", fontFamily: font.mono, fontSize: 11,
                    color: C.body, cursor: "pointer",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = C.bg)}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RPE */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>RPE</span>
          <input
            type="number"
            min={6} max={10} step={0.5}
            value={exercise.rpe}
            onChange={(e) => update({ rpe: e.target.value })}
            style={{
              width: 52, background: C.bg, border: `1px solid ${rpeColor}55`,
              borderRadius: 3, padding: "6px 8px", color: rpeColor,
              fontFamily: font.mono, fontSize: 12, textAlign: "center",
              fontWeight: 700, outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = rpeColor)}
            onBlur={(e)  => (e.target.style.borderColor = rpeColor + "55")}
          />
        </div>

        {/* Remove exercise */}
        <button
          onClick={onRemove}
          disabled={isOnly}
          style={{
            background: "none", border: "none",
            color: isOnly ? C.border : C.muted,
            cursor: isOnly ? "default" : "pointer",
            fontSize: 16, lineHeight: 1, padding: "2px 4px",
            borderRadius: 2, transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { if (!isOnly) (e.target as HTMLElement).style.color = C.red; }}
          onMouseLeave={(e) => { if (!isOnly) (e.target as HTMLElement).style.color = C.muted; }}
          title="Remove exercise"
        >
          ×
        </button>
      </div>

      {/* ── Set table ─────────────────────────────────────────────────── */}
      <div style={{ marginLeft: 30 }}>
        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "28px 80px 80px 1fr",
          gap: 8, marginBottom: 6, paddingRight: 28,
        }}>
          {["Set", "Weight", "Reps", ""].map((h) => (
            <span key={h} style={{ fontFamily: font.mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Set rows */}
        {exercise.sets.map((set, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "28px 80px 80px 1fr",
            gap: 8, alignItems: "center", marginBottom: 6,
          }}>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textAlign: "center" }}>
              {i + 1}
            </span>
            <NumInput
              value={set.weight}
              onChange={(v) => updateSet(i, { weight: v })}
              placeholder="lbs"
              width={80}
            />
            <NumInput
              value={set.reps}
              onChange={(v) => updateSet(i, { reps: v })}
              placeholder="reps"
              width={80}
            />
            <button
              onClick={() => removeSet(i)}
              disabled={exercise.sets.length === 1}
              style={{
                background: "none", border: "none",
                color: exercise.sets.length === 1 ? C.border : C.muted,
                cursor: exercise.sets.length === 1 ? "default" : "pointer",
                fontSize: 13, padding: "0 4px",
              }}
              onMouseEnter={(e) => { if (exercise.sets.length > 1) (e.target as HTMLElement).style.color = C.red; }}
              onMouseLeave={(e) => { if (exercise.sets.length > 1) (e.target as HTMLElement).style.color = C.muted; }}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add set */}
        <button
          onClick={addSet}
          style={{
            background: "none", border: `1px dashed ${C.border}`,
            color: C.muted, fontFamily: font.mono, fontSize: 10,
            padding: "5px 12px", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.06em", marginTop: 4,
            transition: "all 0.15s",
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
          + Add Set
        </button>
      </div>
    </div>
  );
}
