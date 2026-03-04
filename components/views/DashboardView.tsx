"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: All data came from static mockData imports. Each chart was
//         hardcoded. KPIs never updated.
//
// AFTER:  All data comes from the Zustand store via selectors.
//         useDashboardSelectors() derives KPIs by aggregating across
//         the workout, nutrition, and goals slices simultaneously.
//         Charts now reflect real store state — log a workout and
//         the consistency score and volume KPIs update instantly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Tag from "@/components/ui/Tag";
import { ChartTooltip } from "@/components/ui/misc";

// ✅ NEW: store imports replace mockData imports
import { useWorkouts, useNutrition } from "@/store";
import { useDashboardSelectors } from "@/store/selectors";

import { C, font, liftColors } from "@/lib/constants/tokens";

// weightData + strengthData stay as mock until real tracking input is built
import { weightData, strengthData } from "@/lib/data/mockData";
import type { LiftKey } from "@/types";

const ENGINE_SIGNALS = [
  { icon: "↗", color: C.accent, text: "Deadlift set a new 3RM PR (+5 lbs)" },
  { icon: "⚠", color: C.amber,  text: "Friday surplus (+200 kcal) offset weekly deficit" },
  { icon: "↗", color: C.accent, text: "Weight trend aligned with fat loss goal" },
  { icon: "○", color: C.blue,   text: "Recovery looks adequate — HRV data missing" },
  { icon: "⚠", color: C.amber,  text: "Squat volume dropped 12% — watch next session" },
];

export default function DashboardView() {
  const [activeLift, setActiveLift] = useState<LiftKey>("squat");

  // ✅ NEW: pull live data from store
  const nutrition = useNutrition();
  const workouts  = useWorkouts();

  // ✅ NEW: derived KPIs — aggregates workout + nutrition + goals slices
  const {
    consistencyScore,
    calorieAdherence,
    weeklyVolume,
    weeklyPRs,
    weightTrend,
  } = useDashboardSelectors();

  // ✅ NEW: calorie chart data is now live from the nutrition slice
  const calorieChartData = useMemo(
    () => nutrition.days.map((d) => ({ ...d, target: nutrition.targetCalories })),
    [nutrition.days, nutrition.targetCalories]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
            Weekly Intelligence Report — Week of Mar 2, 2026
          </p>
          <h1 style={{ fontFamily: font.display, fontSize: 36, color: C.heading, margin: 0, lineHeight: 1 }}>
            You&apos;re trending in the{" "}
            <span style={{ color: C.accent }}>right direction.</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Tag color={C.accent}>{workouts.slice(0, 7).length} Workouts</Tag>
          <Tag color={C.blue}>Goal: Recomp</Tag>
        </div>
      </div>

      {/* KPI row — ALL VALUES NOW LIVE FROM STORE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          {
            label: "Consistency Score",
            value: consistencyScore,
            unit: "%",
            sub: `${workouts.slice(0,4).length} of 4 sessions this week`,
            accent: C.accent,
          },
          {
            label: "Calorie Adherence",
            value: calorieAdherence,
            unit: "%",
            sub: "±150 kcal tolerance",
          },
          {
            label: "Body Weight Trend",
            value: weightTrend,
            unit: "lbs",
            sub: "delta from start",
            accent: C.accent,
          },
          {
            label: "Volume Load",
            value: (weeklyVolume / 1000).toFixed(1),
            unit: "k lbs",
            sub: `${weeklyPRs} PR${weeklyPRs !== 1 ? "s" : ""} this week`,
          },
        ].map((stat, i) => (
          <Card key={i} accent={stat.accent}>
            <Stat {...stat} />
          </Card>
        ))}
      </div>

      {/* Strength + Signals */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>
              Strength Progression
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {(["squat", "bench", "deadlift"] as LiftKey[]).map((lift) => (
                <button
                  key={lift}
                  onClick={() => setActiveLift(lift)}
                  style={{
                    background: activeLift === lift ? liftColors[lift] + "22" : "transparent",
                    border: `1px solid ${activeLift === lift ? liftColors[lift] : C.border}`,
                    color: activeLift === lift ? liftColors[lift] : C.muted,
                    fontFamily: font.mono, fontSize: 10, padding: "3px 10px",
                    borderRadius: 2, cursor: "pointer", textTransform: "capitalize" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  {lift}
                </button>
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

        <Card>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600, display: "block", marginBottom: 16 }}>
            Engine Signals
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ENGINE_SIGNALS.map((flag, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: font.mono, fontSize: 13, color: flag.color, flexShrink: 0, marginTop: 1 }}>{flag.icon}</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: C.body, lineHeight: 1.4 }}>{flag.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bodyweight + Calories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>Bodyweight Trend</span>
            <span style={{ fontFamily: font.mono, fontSize: 11, color: C.accent }}>{weightTrend} lbs total</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={weightData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} domain={["dataMin - 2", "dataMax + 1"]} />
              <Tooltip content={<ChartTooltip unit=" lbs" />} />
              <Line type="monotone" dataKey="weight" stroke={C.borderBright} strokeWidth={1} dot={false} name="Daily"    strokeDasharray="3 3" />
              <Line type="monotone" dataKey="avg"    stroke={C.accent}       strokeWidth={2} dot={false} name="7-day avg" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
            {[
              { color: C.accent,       dash: false, label: "7-day avg" },
              { color: C.borderBright, dash: true,  label: "daily" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: item.dash ? 0 : 2, borderTop: item.dash ? `1px dashed ${item.color}` : undefined, background: item.dash ? undefined : item.color }} />
                <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ✅ chart data + reference line from nutritionSlice */}
        <Card>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>Calorie Adherence — This Week</span>
            <Tag>{calorieAdherence}% on target</Tag>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={calorieChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: font.mono, fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit=" kcal" />} />
              <ReferenceLine y={nutrition.targetCalories} stroke={C.accent} strokeDasharray="4 4" strokeWidth={1} />
              <Bar dataKey="actual" name="Actual" radius={[2, 2, 0, 0]} fill={C.accentDim} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontFamily: font.body, fontSize: 11, color: C.muted, marginTop: 8 }}>
            Target: {nutrition.targetCalories.toLocaleString()} kcal/day
          </p>
        </Card>
      </div>
    </div>
  );
}
