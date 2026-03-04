// ─── COLOR TOKENS ─────────────────────────────────────────────────────────────

export const C = {
  bg: "#0a0a0b",
  surface: "#111113",
  surfaceAlt: "#17171a",
  border: "#222226",
  borderBright: "#303036",
  accent: "#b8ff57",       // electric lime
  accentDim: "#7db33c",
  accentMuted: "#1e2e12",
  red: "#ff4444",
  amber: "#ffb547",
  blue: "#4d9fff",
  muted: "#555560",
  body: "#9999aa",
  heading: "#e8e8f0",
  white: "#f0f0f8",
} as const;

// ─── FONT TOKENS ──────────────────────────────────────────────────────────────

export const font = {
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  display: "'DM Serif Display', 'Georgia', serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
} as const;

// ─── LIFT COLORS ──────────────────────────────────────────────────────────────

export const liftColors = {
  squat: C.accent,
  bench: C.blue,
  deadlift: C.amber,
} as const;

// ─── GOAL TYPE COLORS ─────────────────────────────────────────────────────────

export const goalTypeColors = {
  strength: C.accent,
  fat_loss: C.blue,
  endurance: C.amber,
} as const;

// ─── GOAL STATUS CONFIG ───────────────────────────────────────────────────────

export const goalStatusConfig = {
  on_track:  { color: C.accent, label: "On Track",  icon: "↗" },
  at_risk:   { color: C.amber,  label: "At Risk",   icon: "⚠" },
  off_track: { color: C.red,    label: "Off Track", icon: "↘" },
} as const;
