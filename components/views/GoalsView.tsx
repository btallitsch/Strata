"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: goalsData imported from mockData — completely static. Progress %
//         was hardcoded via BASELINES constants in goals.ts. The conflict
//         alert was hardcoded copy.
//
// AFTER:  goals come from goalsSlice via useGoalsWithProgress(), which
//         enriches each goal with a live computed progress %.
//         useGoalConflicts() is a cross-slice selector that reads
//         nutrition.targetCalories + user.weight + goals.deadline
//         to determine if the deficit is sufficient — and generates
//         the conflict message dynamically.
//         When you change the calorie target in NutritionView, this
//         view's conflict banner updates automatically.
// ─────────────────────────────────────────────────────────────────────────────

import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Tag from "@/components/ui/Tag";
import { C, font, goalTypeColors, goalStatusConfig } from "@/lib/constants/tokens";
import { goalUnit } from "@/lib/utils/goals";
import type { FitnessGoal } from "@/types";

// ✅ NEW: store selectors replace static goalsData import
import { useGoalsWithProgress, useGoalConflicts } from "@/store/selectors";

// ─── GOAL CARD ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: FitnessGoal & { progress: number } }) {
  const cfg      = goalStatusConfig[goal.status];
  const typeCfg  = goalTypeColors[goal.type];
  const unit     = goalUnit(goal.type);

  return (
    <Card accent={cfg.color}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <Tag color={typeCfg} bg={typeCfg + "15"}>
            {goal.type.replace("_", " ")}
          </Tag>
          <h3 style={{ fontFamily: font.display, fontSize: 22, color: C.heading, margin: "8px 0 2px" }}>
            {goal.label}
          </h3>
          <span style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}>
            Deadline: {goal.deadline}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, color: cfg.color }}>{cfg.icon}</span>
          <Tag color={cfg.color} bg={cfg.color + "15"}>{cfg.label}</Tag>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <Stat label="Current"  value={goal.current} unit={unit} />
        <div style={{ width: 1, background: C.border }} />
        {/* ✅ progress is now computed by useGoalsWithProgress() selector */}
        <Stat label="Target"   value={goal.target}  unit={unit} accent={typeCfg} />
        <div style={{ width: 1, background: C.border }} />
        <Stat label="Progress" value={goal.progress} unit="%" />
      </div>

      <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
        <div style={{
          width: `${goal.progress}%`, height: "100%",
          background: `linear-gradient(90deg, ${typeCfg}, ${typeCfg}cc)`,
          borderRadius: 4, transition: "width 0.6s ease",
        }} />
      </div>

      {goal.warning && (
        <div style={{
          display: "flex", gap: 8, padding: "10px 12px",
          background: C.amber + "10", border: `1px solid ${C.amber}30`, borderRadius: 3,
        }}>
          <span style={{ color: C.amber, fontSize: 13 }}>⚠</span>
          <span style={{ fontFamily: font.body, fontSize: 12, color: C.amber }}>{goal.warning}</span>
        </div>
      )}
    </Card>
  );
}

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

export default function GoalsView() {
  // ✅ NEW: goals enriched with live progress % from selector
  const goals = useGoalsWithProgress();

  // ✅ NEW: conflict message derived from nutrition + user + goals slices
  const { hasConflict, message } = useGoalConflicts();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
            Goal Engine
          </p>
          <h1 style={{ fontFamily: font.display, fontSize: 32, color: C.heading, margin: 0 }}>
            Adaptive <span style={{ color: C.accent }}>Goal System</span>
          </h1>
        </div>
        <button style={{
          background: "transparent", color: C.accent,
          border: `1px solid ${C.accent}`,
          fontFamily: font.mono, fontSize: 11, fontWeight: 600,
          padding: "10px 20px", borderRadius: 3, cursor: "pointer",
          letterSpacing: "0.08em", textTransform: "uppercase" as const,
        }}>
          + Set New Goal
        </button>
      </div>

      {/* ✅ NEW: conflict banner is now dynamic — driven by useGoalConflicts() */}
      {hasConflict && message && (
        <Card accent={C.red}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, color: C.red }}>⊗</span>
            <div>
              <div style={{ fontFamily: font.mono, fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 6 }}>
                Goal Conflict Detected
              </div>
              <p style={{ fontFamily: font.body, fontSize: 13, color: C.body, margin: 0, lineHeight: 1.6 }}>
                {message}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ✅ NEW: iterates live goals with computed progress */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* Scenario simulator teaser */}
      <Card style={{ borderStyle: "dashed", background: "transparent", textAlign: "center", padding: 32 }}>
        <div style={{ fontFamily: font.mono, fontSize: 12, color: C.muted, marginBottom: 8 }}>◈ Scenario Simulator</div>
        <div style={{ fontFamily: font.display, fontSize: 20, color: C.heading, marginBottom: 12 }}>
          &quot;What if I cut 200 calories and added a 4th training day?&quot;
        </div>
        <button style={{
          background: C.accentMuted, color: C.accent,
          border: `1px solid ${C.accent}50`,
          fontFamily: font.mono, fontSize: 11,
          padding: "8px 20px", borderRadius: 3, cursor: "pointer",
          letterSpacing: "0.08em",
        }}>
          Run Simulation →
        </button>
      </Card>
    </div>
  );
}
