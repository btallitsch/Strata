// ─── WORKOUT TYPES ────────────────────────────────────────────────────────────

export interface ExerciseSet {
  weight: number; // lbs (0 = bodyweight)
  reps: number;
  rpe?: number;
  restTime?: number; // seconds
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
  rpe: number; // avg RPE for the exercise
}

export interface WorkoutSession {
  id: number;
  date: string; // ISO date string
  label: string;
  volume: number; // total volume in lbs
  prs: number; // number of PRs set
  exercises: Exercise[];
}

// ─── NUTRITION TYPES ──────────────────────────────────────────────────────────

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type GoalType = "cut" | "maintain" | "bulk";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionDay {
  day: string;
  actual: number;
  target: number;
  confidenceScore?: number;
}

// ─── GOAL TYPES ───────────────────────────────────────────────────────────────

export type FitnessGoalType = "strength" | "fat_loss" | "endurance";
export type GoalStatus = "on_track" | "at_risk" | "off_track";

export interface FitnessGoal {
  id: number;
  type: FitnessGoalType;
  label: string;
  current: number;
  target: number;
  deadline: string;
  status: GoalStatus;
  warning: string | null;
}

// ─── CHART DATA TYPES ─────────────────────────────────────────────────────────

export interface WeightDataPoint {
  day: string;
  weight: number;
  avg: number;
}

export interface StrengthDataPoint {
  week: string;
  squat: number;
  bench: number;
  deadlift: number;
}

export type LiftKey = "squat" | "bench" | "deadlift";

// ─── UI TYPES ─────────────────────────────────────────────────────────────────

export type NavView = "dashboard" | "workout" | "nutrition" | "goals";

export interface NavItem {
  id: NavView;
  label: string;
  icon: string;
}
