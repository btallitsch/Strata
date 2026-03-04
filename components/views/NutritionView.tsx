"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: activityLevel and goal were local useState. TDEE and macros
//         recalculated in the component only — nothing else knew they changed.
//         USER_WEIGHT_LBS was a hardcoded constant at the top of the file.
//
// AFTER:  activityLevel lives in userSlice (setActivityLevel).
//         goal lives in nutritionSlice (setNutritionGoal).
//         targetCalories lives in nutritionSlice (setTargetCalories).
//         Weight comes from userSlice.
//         useNutritionSelectors() computes BMR/TDEE/macros from the
//         combined user + nutrition state — meaning a weight update
//         in userSlice automatically flows here too.
//         When goal changes, the dashboard adherence recalculates.
// ─────────────────────────────────────────────────────────────────────────────

import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import { Divider, SectionLabel } from "@/components/ui/misc";
import { C, font } from "@/lib/constants/tokens";

// ✅ NEW: store hooks replace local useState for persistent values
import { useUser, useNutrition, useUserActions, useNutritionActions } from "@/store";
import { useNutritionSelectors } from "@/store/selectors";

import { deficitLabel, macroCals } from "@/lib/utils/nutrition";
import type { ActivityLevel, GoalType } from "@/types";

// ─── EXPLAINABILITY COPY ─────────────────────────────────────────────────────

function getExplainerItems(deficit: number, weightLbs: number) {
  return [
    {
      q: "Why 1g protein/lb?",
      a: `At a caloric deficit, higher protein intake (0.8–1.2g/lb) preserves lean mass and increases satiety. At ${weightLbs.toFixed(1)} lbs that's ${Math.round(weightLbs)}g/day.`,
    },
    {
      q: `Why a ${deficit} kcal deficit?`,
      a: `A ${deficit} kcal daily deficit equates to ~${(deficit / 3500).toFixed(1)} lbs lost per week — aggressive enough for progress, conservative enough to preserve muscle given your training volume.`,
    },
    {
      q: "Confidence level?",
      a: "TDEE estimates via Mifflin-St Jeor have ±10–15% error. Your 7-day weight average suggests actual TDEE may be ~50 kcal higher than estimated.",
    },
  ];
}

// ─── MACRO BAR ────────────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  grams: number;
  cals: number;
  totalCals: number;
  color: string;
}

function MacroBar({ label, grams, cals, totalCals, color }: MacroBarProps) {
  const pct = Math.round((cals / totalCals) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: font.body, fontSize: 11, color: C.body }}>{label}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: C.heading, fontWeight: 600 }}>{grams}g</span>
          <span style={{ fontFamily: font.mono, fontSize: 11, color: C.muted }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 6, background: C.surfaceAlt, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          borderRadius: 3, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ─── MAIN VIEW ────────────────────────────────────────────────────────────────

export default function NutritionView() {
  // ✅ NEW: read from store slices
  const user      = useUser();
  const nutrition = useNutrition();

  // ✅ NEW: actions write back to store
  const { setActivityLevel } = useUserActions();
  const { setNutritionGoal, setTargetCalories } = useNutritionActions();

  // ✅ NEW: derived values from combined user + nutrition state
  const { bmr, tdee, macro, deficit } = useNutritionSelectors();
  const { proteinCals, carbCals, fatCals } = macroCals(macro);

  const explainers = getExplainerItems(Math.abs(deficit), user.weight);

  const goalColors: Record<GoalType, string> = {
    cut: C.red, maintain: C.blue, bulk: C.accent,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
          Nutrition Engine
        </p>
        <h1 style={{ fontFamily: font.display, fontSize: 32, color: C.heading, margin: 0 }}>
          Explainable Calorie Logic
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionLabel>Mifflin-St Jeor Formula</SectionLabel>
            {/* ✅ NEW: formula uses live user.weight and user.heightIn from userSlice */}
            <div style={{
              padding: "10px 14px", background: C.surfaceAlt,
              borderRadius: 3, border: `1px solid ${C.border}`, marginBottom: 16,
              fontFamily: font.mono, fontSize: 11, color: C.body, lineHeight: 2,
            }}>
              <div style={{ color: C.muted, fontSize: 10, marginBottom: 4 }}>BMR =</div>
              <div>
                10 × <span style={{ color: C.accent }}>{(user.weight * 0.453592).toFixed(1)}kg</span>
                {" "}+ 6.25 × <span style={{ color: C.accent }}>{(user.heightIn * 2.54).toFixed(1)}cm</span>
              </div>
              <div>
                − 5 × <span style={{ color: C.blue }}>{user.age}yrs</span>
                {" "}+ <span style={{ color: C.blue }}>5</span>
                {" "}= <span style={{ color: C.heading, fontWeight: 700, fontSize: 14 }}>{bmr} kcal</span>
              </div>
            </div>

            {/* ✅ NEW: setActivityLevel writes to userSlice */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Activity Level
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {(["sedentary", "light", "moderate", "active"] as ActivityLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setActivityLevel(level)}
                    style={{
                      background: user.activityLevel === level ? C.accentMuted : "transparent",
                      border: `1px solid ${user.activityLevel === level ? C.accent : C.border}`,
                      color: user.activityLevel === level ? C.accent : C.muted,
                      fontFamily: font.mono, fontSize: 10, padding: "5px 10px",
                      borderRadius: 2, cursor: "pointer", textTransform: "capitalize" as const,
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ NEW: setNutritionGoal writes to nutritionSlice */}
            <div>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Goal
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["cut", "maintain", "bulk"] as GoalType[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setNutritionGoal(g)}
                    style={{
                      background: nutrition.goal === g ? goalColors[g] + "22" : "transparent",
                      border: `1px solid ${nutrition.goal === g ? goalColors[g] : C.border}`,
                      color: nutrition.goal === g ? goalColors[g] : C.muted,
                      fontFamily: font.mono, fontSize: 11, padding: "6px 16px",
                      borderRadius: 2, cursor: "pointer", textTransform: "capitalize" as const,
                      fontWeight: 600,
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card accent={C.accent}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              {/* ✅ NEW: both values from useNutritionSelectors() */}
              <Stat label="TDEE"            value={tdee}           unit="kcal" sub="Total daily energy" />
              <Stat label="Target Calories" value={macro.calories} unit="kcal"
                sub={deficitLabel(tdee, macro.calories, nutrition.goal)} accent={C.accent} />
            </div>
            <Divider style={{ margin: "16px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <MacroBar label="Protein" grams={macro.protein} cals={proteinCals} totalCals={macro.calories} color={C.accent} />
              <MacroBar label="Carbs"   grams={macro.carbs}   cals={carbCals}    totalCals={macro.calories} color={C.blue} />
              <MacroBar label="Fat"     grams={macro.fat}     cals={fatCals}     totalCals={macro.calories} color={C.amber} />
            </div>
          </Card>
        </div>

        {/* Right column — explainers now use live weight */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionLabel>Why These Numbers</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {explainers.map((item, i) => (
                <div key={i} style={{
                  padding: "12px 14px", background: C.surfaceAlt,
                  border: `1px solid ${C.border}`, borderRadius: 3,
                }}>
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
                  Your 8-week weight trend is −0.9 lbs/wk. Target was −0.7 lbs/wk. Consider adding
                  50–100 kcal/day via carbohydrates to reduce unnecessary deficit and support training performance.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
