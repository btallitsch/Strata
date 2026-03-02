import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, BarChart, Bar } from "recharts";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
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
};

const font = {
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  display: "'DM Serif Display', 'Georgia', serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const weightData = [
  { day: "W1", weight: 185.4, avg: 185.4 },
  { day: "W2", weight: 184.8, avg: 185.1 },
  { day: "W3", weight: 185.1, avg: 184.95 },
  { day: "W4", weight: 183.9, avg: 184.72 },
  { day: "W5", weight: 183.2, avg: 184.42 },
  { day: "W6", weight: 182.7, avg: 184.0 },
  { day: "W7", weight: 182.1, avg: 183.6 },
  { day: "W8", weight: 181.4, avg: 183.1 },
];

const strengthData = [
  { week: "W1", squat: 225, bench: 175, deadlift: 275 },
  { week: "W2", squat: 230, bench: 175, deadlift: 280 },
  { week: "W3", squat: 230, bench: 180, deadlift: 285 },
  { week: "W4", squat: 235, bench: 182, deadlift: 290 },
  { week: "W5", squat: 240, bench: 185, deadlift: 295 },
  { week: "W6", squat: 242, bench: 185, deadlift: 300 },
  { week: "W7", squat: 245, bench: 187, deadlift: 305 },
  { week: "W8", squat: 250, bench: 190, deadlift: 315 },
];

const calorieData = [
  { day: "Mon", actual: 2280, target: 2400 },
  { day: "Tue", actual: 2450, target: 2400 },
  { day: "Wed", actual: 2190, target: 2400 },
  { day: "Thu", actual: 2400, target: 2400 },
  { day: "Fri", actual: 2600, target: 2400 },
  { day: "Sat", actual: 2150, target: 2400 },
  { day: "Sun", actual: 2380, target: 2400 },
];

const workoutLog = [
  {
    id: 1, date: "2026-02-28", label: "Upper A", volume: 18240, prs: 1,
    exercises: [
      { name: "Bench Press", sets: [{w:185,r:5},{w:185,r:5},{w:185,r:4}], rpe: 8 },
      { name: "Barbell Row",  sets: [{w:155,r:6},{w:155,r:6},{w:155,r:6}], rpe: 7 },
      { name: "OHP",          sets: [{w:115,r:6},{w:115,r:5},{w:115,r:5}], rpe: 8.5 },
    ]
  },
  {
    id: 2, date: "2026-02-26", label: "Lower A", volume: 22400, prs: 0,
    exercises: [
      { name: "Squat",     sets: [{w:245,r:4},{w:245,r:4},{w:245,r:3}], rpe: 9 },
      { name: "RDL",       sets: [{w:195,r:6},{w:195,r:6},{w:195,r:6}], rpe: 7.5 },
      { name: "Leg Press", sets: [{w:360,r:10},{w:360,r:10}], rpe: 7 },
    ]
  },
  {
    id: 3, date: "2026-02-24", label: "Upper B", volume: 17100, prs: 2,
    exercises: [
      { name: "Deadlift", sets: [{w:315,r:3},{w:315,r:3},{w:315,r:2}], rpe: 9.5 },
      { name: "Pull-ups",  sets: [{w:0,r:8},{w:0,r:7},{w:0,r:7}], rpe: 8 },
    ]
  },
];

const goals = [
  { id: 1, type: "strength", label: "Squat 275 lbs", current: 250, target: 275, deadline: "2026-06-01", status: "on_track", warning: null },
  { id: 2, type: "fat_loss", label: "Reach 178 lbs", current: 181.4, target: 178, deadline: "2026-04-15", status: "at_risk", warning: "Current deficit may be insufficient" },
  { id: 3, type: "endurance", label: "5K under 24 min", current: 26.2, target: 24, deadline: "2026-05-01", status: "on_track", warning: null },
];

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────

const Tag = ({ children, color = C.accent, bg = C.accentMuted }) => (
  <span style={{
    fontFamily: font.mono, fontSize: 10, fontWeight: 600,
    color, background: bg, border: `1px solid ${color}33`,
    padding: "2px 7px", borderRadius: 2, letterSpacing: "0.08em",
    textTransform: "uppercase",
  }}>{children}</span>
);

const Divider = ({ style }) => (
  <div style={{ height: 1, background: C.border, ...style }} />
);

const Stat = ({ label, value, unit, sub, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
    <span style={{ fontFamily: font.mono, fontSize: 26, fontWeight: 700, color: accent || C.heading, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 13, color: C.body, marginLeft: 3 }}>{unit}</span>
    </span>
    {sub && <span style={{ fontFamily: font.body, fontSize: 11, color: C.muted }}>{sub}</span>}
  </div>
);

const Card = ({ children, style, accent }) => (
  <div style={{
    background: C.surface,
    border: `1px solid ${accent ? accent + "40" : C.border}`,
    borderTop: accent ? `2px solid ${accent}` : undefined,
    borderRadius: 4,
    padding: "20px 24px",
    ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: font.mono, fontSize: 10, color: C.muted,
    textTransform: "uppercase", letterSpacing: "0.15em",
    marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
  }}>
    <div style={{ width: 16, height: 1, background: C.border }} />
    {children}
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

const RPEBadge = ({ rpe }) => {
  const color = rpe >= 9 ? C.red : rpe >= 8 ? C.amber : C.accent;
  return (
    <span style={{ fontFamily: font.mono, fontSize: 11, color, border: `1px solid ${color}55`, padding: "1px 6px", borderRadius: 2 }}>
      RPE {rpe}
    </span>
  );
};

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.borderBright}`, borderRadius: 3, padding: "8px 14px" }}>
      <div style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: font.mono, fontSize: 12, color: p.color || C.heading }}>
          {p.name}: {p.value}{unit}
        </div>
      ))}
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Intelligence", icon: "◈" },
  { id: "workout",   label: "Workouts",     icon: "↑" },
  { id: "nutrition", label: "Nutrition",    icon: "◎" },
  { id: "goals",     label: "Goals",        icon: "◆" },
];

const Nav = ({ active, setActive }) => (
  <nav style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    background: C.bg + "ee",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center",
    padding: "0 32px", height: 56,
    gap: 0,
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
      <div style={{
        width: 28, height: 28, background: C.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 900, color: C.bg }}>FI</span>
      </div>
      <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 600, color: C.heading, letterSpacing: "0.05em" }}>
        FITNESS<span style={{ color: C.accent }}>IQ</span>
      </span>
    </div>

    {/* Nav items */}
    <div style={{ display: "flex", gap: 2 }}>
      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => setActive(item.id)} style={{
          background: active === item.id ? C.accentMuted : "transparent",
          border: "none",
          color: active === item.id ? C.accent : C.muted,
          fontFamily: font.mono, fontSize: 11, letterSpacing: "0.08em",
          padding: "6px 16px", cursor: "pointer", borderRadius: 3,
          textTransform: "uppercase",
          transition: "all 0.15s",
          display: "flex", alignItems: "center", gap: 7,
        }}>
          <span style={{ fontSize: 13 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
      <Tag color={C.amber}>Week 8 of 12</Tag>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: `linear-gradient(135deg, #4d9fff, #b8ff57)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: C.bg,
      }}>A</div>
    </div>
  </nav>
);

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
const DashboardView = () => {
  const [activeLift, setActiveLift] = useState("squat");
  const liftColors = { squat: C.accent, bench: C.blue, deadlift: C.amber };

  const adherence = useMemo(() => {
    const hits = calorieData.filter(d => Math.abs(d.actual - d.target) <= 150).length;
    return Math.round((hits / calorieData.length) * 100);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
            Weekly Intelligence Report — Week of Mar 2, 2026
          </p>
          <h1 style={{ fontFamily: font.display, fontSize: 36, color: C.heading, margin: 0, lineHeight: 1 }}>
            You're trending in the <span style={{ color: C.accent }}>right direction.</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Tag color={C.accent}>3 Workouts</Tag>
          <Tag color={C.blue}>Goal: Recomp</Tag>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Consistency Score", value: "87", unit: "%", sub: "↑ 4pts from last week", accent: C.accent },
          { label: "Calorie Adherence", value: adherence, unit: "%", sub: "5 of 7 days ±150 kcal" },
          { label: "Body Weight Trend", value: "−0.9", unit: "lb/wk", sub: "7-day moving avg", accent: C.accent },
          { label: "Volume Load", value: "57.7", unit: "k lbs", sub: "↑ 6% vs last week" },
        ].map((stat, i) => (
          <Card key={i} accent={stat.accent}>
            <Stat {...stat} />
          </Card>
        ))}
      </div>

      {/* Insights row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Strength trends */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>Strength Progression</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["squat","bench","deadlift"].map(l => (
                <button key={l} onClick={() => setActiveLift(l)} style={{
                  background: activeLift === l ? liftColors[l] + "22" : "transparent",
                  border: `1px solid ${activeLift === l ? liftColors[l] : C.border}`,
                  color: activeLift === l ? liftColors[l] : C.muted,
                  fontFamily: font.mono, fontSize: 10, padding: "3px 10px",
                  borderRadius: 2, cursor: "pointer", textTransform: "capitalize",
                  letterSpacing: "0.05em",
                }}>{l}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={strengthData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={liftColors[activeLift]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={liftColors[activeLift]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" lbs" />} />
              <Area type="monotone" dataKey={activeLift} stroke={liftColors[activeLift]} strokeWidth={2}
                fill="url(#liftGrad)" dot={false} activeDot={{ r: 4, fill: liftColors[activeLift] }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Intelligence flags */}
        <Card>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600, display: "block", marginBottom: 16 }}>
            Engine Signals
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "↗", color: C.accent, text: "Deadlift set a new 3RM PR (+5 lbs)" },
              { icon: "⚠", color: C.amber, text: "Friday surplus (+200 kcal) offset weekly deficit" },
              { icon: "↗", color: C.accent, text: "Weight trend aligned with fat loss goal" },
              { icon: "○", color: C.blue,  text: "Recovery looks adequate — HRV data missing" },
              { icon: "⚠", color: C.amber, text: "Squat volume dropped 12% — watch next session" },
            ].map((flag, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: font.mono, fontSize: 13, color: flag.color, flexShrink: 0, marginTop: 1 }}>{flag.icon}</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.body, lineHeight: 1.4 }}>{flag.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bodyweight + Calorie row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* BW trend */}
        <Card>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>Bodyweight Trend</span>
            <span style={{ fontFamily: font.mono, fontSize: 11, color: C.accent }}>−4.0 lbs / 8 wk</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={weightData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 1']} />
              <Tooltip content={<ChartTooltip unit=" lbs" />} />
              <Line type="monotone" dataKey="weight" stroke={C.borderBright} strokeWidth={1} dot={false} name="Daily" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="avg" stroke={C.accent} strokeWidth={2} dot={false} name="7-day avg" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 2, background: C.accent }} />
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>7-day avg</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 1, background: C.borderBright, borderTop: "1px dashed" }} />
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>daily</span>
            </div>
          </div>
        </Card>

        {/* Calorie adherence */}
        <Card>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>Calorie Adherence — This Week</span>
            <Tag>{adherence}% on target</Tag>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={calorieData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" kcal" />} />
              <ReferenceLine y={2400} stroke={C.accent} strokeDasharray="4 4" strokeWidth={1} />
              <Bar dataKey="actual" name="Actual" radius={[2,2,0,0]}
                fill={C.accentDim}
                // Color bars by over/under
              />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontFamily: font.body, fontSize: 11, color: C.muted, marginTop: 8 }}>
            Target: 2,400 kcal/day · Avg this week: 2,350 kcal
          </p>
        </Card>
      </div>
    </div>
  );
};

// ─── WORKOUT VIEW ─────────────────────────────────────────────────────────────
const WorkoutView = () => {
  const [selected, setSelected] = useState(workoutLog[0].id);
  const session = workoutLog.find(w => w.id === selected);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Workout Tracker</p>
          <h1 style={{ fontFamily: font.display, fontSize: 32, color: C.heading, margin: 0 }}>Session History</h1>
        </div>
        <button style={{
          background: C.accent, color: C.bg, border: "none",
          fontFamily: font.mono, fontSize: 11, fontWeight: 700,
          padding: "10px 20px", borderRadius: 3, cursor: "pointer",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>+ Log Workout</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Session list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionLabel>Recent Sessions</SectionLabel>
          {workoutLog.map(session => (
            <div key={session.id} onClick={() => setSelected(session.id)} style={{
              background: selected === session.id ? C.accentMuted : C.surface,
              border: `1px solid ${selected === session.id ? C.accent + "50" : C.border}`,
              borderLeft: `3px solid ${selected === session.id ? C.accent : C.border}`,
              borderRadius: 3, padding: "14px 16px", cursor: "pointer",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontFamily: font.mono, fontSize: 12, color: selected === session.id ? C.accent : C.heading, fontWeight: 600 }}>
                  {session.label}
                </span>
                {session.prs > 0 && <Tag color={C.amber} bg="#2e1e00">PR ×{session.prs}</Tag>}
              </div>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>{session.date}</span>
              <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                <span style={{ fontFamily: font.mono, fontSize: 11, color: C.body }}>{session.exercises.length} exercises</span>
                <span style={{ fontFamily: font.mono, fontSize: 11, color: C.body }}>{(session.volume / 1000).toFixed(1)}k vol</span>
              </div>
            </div>
          ))}
        </div>

        {/* Session detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>{session.date} — {session.label}</SectionLabel>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Card><Stat label="Total Volume" value={(session.volume / 1000).toFixed(1)} unit="k lbs" /></Card>
            <Card><Stat label="Exercises" value={session.exercises.length} unit="" /></Card>
            <Card><Stat label="PRs" value={session.prs} unit="" accent={session.prs > 0 ? C.amber : undefined} /></Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {session.exercises.map((ex, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: font.mono, fontSize: 13, color: C.heading, fontWeight: 600 }}>{ex.name}</span>
                  <RPEBadge rpe={ex.rpe} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ex.sets.map((set, j) => (
                    <div key={j} style={{
                      background: C.surfaceAlt, border: `1px solid ${C.border}`,
                      borderRadius: 3, padding: "8px 14px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      minWidth: 70,
                    }}>
                      <span style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: C.heading }}>
                        {set.w > 0 ? `${set.w}` : "BW"}
                      </span>
                      <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>
                        {set.w > 0 ? "lbs" : ""}
                      </span>
                      <span style={{ fontFamily: font.mono, fontSize: 11, color: C.accent }}>×{set.r}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontFamily: font.mono, fontSize: 10, color: C.muted }}>
                  Volume: {ex.sets.reduce((a, s) => a + s.w * s.r, 0).toLocaleString()} lbs
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── NUTRITION VIEW ───────────────────────────────────────────────────────────
const NutritionView = () => {
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("cut");
  const weight = 181.4;
  const height = 70; // inches

  const bmr = Math.round(10 * weight * 0.453592 + 6.25 * height * 2.54 - 5 * 28 + 5);
  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
  const targets = {
    cut: { calories: tdee - 350, protein: Math.round(weight * 1), carbs: Math.round((tdee - 350 - weight * 4 - weight * 0.35 * 9) / 4), fat: Math.round(weight * 0.35) },
    maintain: { calories: tdee, protein: Math.round(weight * 0.85), carbs: Math.round((tdee - weight * 3.4 - weight * 0.3 * 9) / 4), fat: Math.round(weight * 0.3) },
    bulk: { calories: tdee + 300, protein: Math.round(weight * 1.1), carbs: Math.round((tdee + 300 - weight * 4.4 - weight * 0.4 * 9) / 4), fat: Math.round(weight * 0.4) },
  };
  const macro = targets[goal];
  const proteinCals = macro.protein * 4;
  const carbCals = macro.carbs * 4;
  const fatCals = macro.fat * 9;

  const MacroBar = ({ label, grams, cals, color }) => {
    const pct = Math.round((cals / macro.calories) * 100);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: font.mono, fontSize: 11, color: C.body }}>{label}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>{grams}g</span>
            <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted }}>{pct}%</span>
          </div>
        </div>
        <div style={{ height: 6, background: C.surfaceAlt, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Nutrition Engine</p>
        <h1 style={{ fontFamily: font.display, fontSize: 32, color: C.heading, margin: 0 }}>Explainable Calorie Logic</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: formula + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionLabel>Mifflin-St Jeor Formula</SectionLabel>
            <div style={{ fontFamily: font.mono, fontSize: 11, color: C.body, lineHeight: 2 }}>
              <div style={{ padding: "10px 14px", background: C.surfaceAlt, borderRadius: 3, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 4 }}>BMR =</div>
                <div>10 × <span style={{ color: C.accent }}>{(weight * 0.453592).toFixed(1)}kg</span> + 6.25 × <span style={{ color: C.accent }}>{(height * 2.54).toFixed(1)}cm</span></div>
                <div>− 5 × <span style={{ color: C.blue }}>28yrs</span> + <span style={{ color: C.blue }}>5</span> = <span style={{ color: C.heading, fontWeight: 700, fontSize: 14 }}>{bmr} kcal</span></div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Activity Level</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["sedentary","light","moderate","active"].map(level => (
                  <button key={level} onClick={() => setActivityLevel(level)} style={{
                    background: activityLevel === level ? C.accentMuted : "transparent",
                    border: `1px solid ${activityLevel === level ? C.accent : C.border}`,
                    color: activityLevel === level ? C.accent : C.muted,
                    fontFamily: font.mono, fontSize: 10, padding: "5px 10px",
                    borderRadius: 2, cursor: "pointer", textTransform: "capitalize",
                  }}>{level}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Goal</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["cut","maintain","bulk"].map(g => {
                  const colors = { cut: C.red, maintain: C.blue, bulk: C.accent };
                  return (
                    <button key={g} onClick={() => setGoal(g)} style={{
                      background: goal === g ? colors[g] + "22" : "transparent",
                      border: `1px solid ${goal === g ? colors[g] : C.border}`,
                      color: goal === g ? colors[g] : C.muted,
                      fontFamily: font.mono, fontSize: 11, padding: "6px 16px",
                      borderRadius: 2, cursor: "pointer", textTransform: "capitalize",
                      fontWeight: 600,
                    }}>{g}</button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card accent={C.accent}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Stat label="TDEE" value={tdee} unit="kcal" sub="Total daily energy" />
              <Stat label="Target Calories" value={macro.calories} unit="kcal" sub={
                goal === "cut" ? `−${tdee - macro.calories} deficit` :
                goal === "bulk" ? `+${macro.calories - tdee} surplus` : "maintenance"
              } accent={C.accent} />
            </div>
            <Divider style={{ margin: "16px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <MacroBar label="Protein" grams={macro.protein} cals={proteinCals} color={C.accent} />
              <MacroBar label="Carbs" grams={macro.carbs} cals={carbCals} color={C.blue} />
              <MacroBar label="Fat" grams={macro.fat} cals={fatCals} color={C.amber} />
            </div>
          </Card>
        </div>

        {/* Right: explanation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionLabel>Why These Numbers</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { q: "Why 1g protein/lb?", a: "At a caloric deficit, higher protein intake (0.8–1.2g/lb) preserves lean mass and increases satiety. Your current weight-loss rate favors the upper bound." },
                { q: `Why a ${tdee - macro.calories} kcal deficit?`, a: "A 350 kcal daily deficit equates to ~0.7 lbs lost per week — aggressive enough for progress, conservative enough to preserve muscle given your training volume." },
                { q: "Confidence level?", a: "TDEE estimates via Mifflin-St Jeor have ±10–15% error. Your 7-day weight average suggests actual TDEE may be ~50 kcal higher than estimated." },
              ].map((item, i) => (
                <div key={i} style={{ padding: "12px 14px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 3 }}>
                  <div style={{ fontFamily: font.mono, fontSize: 11, color: C.accent, marginBottom: 6 }}>{item.q}</div>
                  <div style={{ fontFamily: font.body, fontSize: 12, color: C.body, lineHeight: 1.6 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card accent={C.amber}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, color: C.amber }}>⚠</span>
              <div>
                <div style={{ fontFamily: font.mono, fontSize: 11, color: C.amber, fontWeight: 600, marginBottom: 6 }}>
                  Adjustment Suggested
                </div>
                <p style={{ fontFamily: font.body, fontSize: 12, color: C.body, margin: 0, lineHeight: 1.6 }}>
                  Your 8-week weight trend is −0.9 lbs/wk. Target was −0.7 lbs/wk. Consider adding 50–100 kcal/day via carbohydrates to reduce unnecessary deficit and support training performance.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── GOALS VIEW ───────────────────────────────────────────────────────────────
const GoalsView = () => {
  const statusConfig = {
    on_track: { color: C.accent, label: "On Track", icon: "↗" },
    at_risk:  { color: C.amber,  label: "At Risk",  icon: "⚠" },
    off_track: { color: C.red,   label: "Off Track", icon: "↘" },
  };

  const GoalProgress = ({ goal }) => {
    const cfg = statusConfig[goal.status];
    const pct = goal.type === "fat_loss"
      ? Math.round(((goal.current - goal.target) / (181.4 - goal.target)) * 100)
      : Math.round(((goal.current - (goal.type === "endurance" ? 30 : 225)) / (goal.target - (goal.type === "endurance" ? 30 : 225))) * 100);
    const clampedPct = Math.min(100, Math.max(0, pct));
    const typeColors = { strength: C.accent, fat_loss: C.blue, endurance: C.amber };

    return (
      <Card accent={cfg.color}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <Tag color={typeColors[goal.type]} bg={typeColors[goal.type] + "15"}>{goal.type.replace("_", " ")}</Tag>
            <h3 style={{ fontFamily: font.display, fontSize: 22, color: C.heading, margin: "8px 0 2px" }}>{goal.label}</h3>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>Deadline: {goal.deadline}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16, color: cfg.color }}>{cfg.icon}</span>
            <Tag color={cfg.color} bg={cfg.color + "15"}>{cfg.label}</Tag>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
          <Stat label="Current" value={goal.current} unit={goal.type === "endurance" ? "min" : goal.type === "fat_loss" ? "lbs" : "lbs"} />
          <div style={{ width: 1, background: C.border }} />
          <Stat label="Target" value={goal.target} unit={goal.type === "endurance" ? "min" : "lbs"} accent={typeColors[goal.type]} />
          <div style={{ width: 1, background: C.border }} />
          <Stat label="Progress" value={clampedPct} unit="%" />
        </div>

        <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
          <div style={{
            width: `${clampedPct}%`, height: "100%",
            background: `linear-gradient(90deg, ${typeColors[goal.type]}, ${typeColors[goal.type]}cc)`,
            borderRadius: 4, transition: "width 0.6s ease",
          }} />
        </div>

        {goal.warning && (
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: C.amber + "10", border: `1px solid ${C.amber}30`, borderRadius: 3 }}>
            <span style={{ color: C.amber, fontSize: 13 }}>⚠</span>
            <span style={{ fontFamily: font.body, fontSize: 12, color: C.amber }}>{goal.warning}</span>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Goal Engine</p>
          <h1 style={{ fontFamily: font.display, fontSize: 32, color: C.heading, margin: 0 }}>
            Adaptive <span style={{ color: C.accent }}>Goal System</span>
          </h1>
        </div>
        <button style={{
          background: "transparent", color: C.accent,
          border: `1px solid ${C.accent}`,
          fontFamily: font.mono, fontSize: 11, fontWeight: 600,
          padding: "10px 20px", borderRadius: 3, cursor: "pointer",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>+ Set New Goal</button>
      </div>

      {/* Constraint warning */}
      <Card accent={C.red}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, color: C.red }}>⊗</span>
          <div>
            <div style={{ fontFamily: font.mono, fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 6 }}>Goal Conflict Detected</div>
            <p style={{ fontFamily: font.body, fontSize: 13, color: C.body, margin: 0, lineHeight: 1.6 }}>
              Your fat loss timeline (−3.4 lbs by Apr 15) requires ~500 kcal/day deficit. Your current intake supports only ~350 kcal/day deficit.
              To resolve: either extend the deadline to <strong style={{ color: C.heading }}>May 1</strong>, or reduce intake to ~2,050 kcal/day.
              Note: aggressive cuts at this training volume risk muscle loss.
            </p>
          </div>
        </div>
      </Card>

      {/* Goals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goals.map(goal => <GoalProgress key={goal.id} goal={goal} />)}
      </div>

      {/* Scenario simulation teaser */}
      <Card style={{ borderStyle: "dashed", background: "transparent", textAlign: "center", padding: 32 }}>
        <div style={{ fontFamily: font.mono, fontSize: 12, color: C.muted, marginBottom: 8 }}>◈ Scenario Simulator</div>
        <div style={{ fontFamily: font.display, fontSize: 20, color: C.heading, marginBottom: 12 }}>
          "What if I cut 200 calories and added a 4th training day?"
        </div>
        <button style={{
          background: C.accentMuted, color: C.accent,
          border: `1px solid ${C.accent}50`,
          fontFamily: font.mono, fontSize: 11,
          padding: "8px 20px", borderRadius: 3, cursor: "pointer",
          letterSpacing: "0.08em",
        }}>Run Simulation →</button>
      </Card>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeView, setActiveView] = useState("dashboard");

  const views = {
    dashboard: DashboardView,
    workout: WorkoutView,
    nutrition: NutritionView,
    goals: GoalsView,
  };
  const View = views[activeView];

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: font.body,
      color: C.heading,
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        button { transition: all 0.15s ease; }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      <Nav active={activeView} setActive={setActiveView} />

      <main style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "88px 32px 48px",
      }}>
        <View />
      </main>

      {/* Bottom status bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.surface, borderTop: `1px solid ${C.border}`,
        padding: "8px 32px",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        {[
          { label: "Model Version", value: "v1.0.0" },
          { label: "Data Last Synced", value: "Mar 2, 2026 09:41" },
          { label: "Offline Mode", value: "Active" },
        ].map((item, i) => (
          <span key={i} style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>
            {item.label}: <span style={{ color: C.body }}>{item.value}</span>
          </span>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, boxShadow: `0 0 8px ${C.accent}` }} />
          <span style={{ fontFamily: font.mono, fontSize: 10, color: C.accent }}>Engine Online</span>
        </div>
      </div>
    </div>
  );
}
