import type { ActivityLevel, GoalType, MacroTargets } from "@/types";

// ─── ACTIVITY MULTIPLIERS ─────────────────────────────────────────────────────

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

// ─── BMR: Mifflin-St Jeor ─────────────────────────────────────────────────────
// weight in lbs, height in inches, age in years

export function calculateBMR(
  weightLbs: number,
  heightIn: number,
  age: number,
  isMale = true
): number {
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightIn * 2.54;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(isMale ? base + 5 : base - 161);
}

// ─── TDEE ─────────────────────────────────────────────────────────────────────

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

// ─── MACRO TARGETS ────────────────────────────────────────────────────────────
// Protein: 1g/lb cut, 0.85g/lb maintain, 1.1g/lb bulk
// Fat:     0.35g/lb cut, 0.30g/lb maintain, 0.40g/lb bulk
// Carbs:   fill remaining calories

export function calculateMacros(
  weightLbs: number,
  tdee: number,
  goal: GoalType
): MacroTargets {
  const OFFSETS: Record<GoalType, number> = {
    cut: -350,
    maintain: 0,
    bulk: 300,
  };
  const PROTEIN_RATIOS: Record<GoalType, number> = {
    cut: 1.0,
    maintain: 0.85,
    bulk: 1.1,
  };
  const FAT_RATIOS: Record<GoalType, number> = {
    cut: 0.35,
    maintain: 0.3,
    bulk: 0.4,
  };

  const calories = tdee + OFFSETS[goal];
  const protein = Math.round(weightLbs * PROTEIN_RATIOS[goal]);
  const fat = Math.round(weightLbs * FAT_RATIOS[goal]);
  const remainingCals = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(remainingCals / 4));

  return { calories, protein, carbs, fat };
}

// ─── CALORIE ADHERENCE SCORE ─────────────────────────────────────────────────

export function calcAdherence(
  days: { actual: number; target: number }[],
  toleranceKcal = 150
): number {
  const hits = days.filter((d) => Math.abs(d.actual - d.target) <= toleranceKcal).length;
  return Math.round((hits / days.length) * 100);
}

// ─── DEFICIT LABEL ───────────────────────────────────────────────────────────

export function deficitLabel(tdee: number, targetCals: number, goal: GoalType): string {
  if (goal === "cut") return `−${tdee - targetCals} kcal deficit`;
  if (goal === "bulk") return `+${targetCals - tdee} kcal surplus`;
  return "maintenance";
}

// ─── MACRO CALORIE SPLIT ─────────────────────────────────────────────────────

export function macroCals(macros: MacroTargets) {
  return {
    proteinCals: macros.protein * 4,
    carbCals: macros.carbs * 4,
    fatCals: macros.fat * 9,
  };
}
