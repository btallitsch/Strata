import type { FitnessGoal, FitnessGoalType } from "@/types";

// ─── BASELINE VALUES (for progress % calculation) ─────────────────────────────

const BASELINES: Record<FitnessGoalType, number> = {
  strength: 225,
  fat_loss: 185.4, // starting weight
  endurance: 30,   // starting 5K time in minutes
};

// ─── PROGRESS PERCENTAGE ─────────────────────────────────────────────────────

export function calcGoalProgress(goal: FitnessGoal): number {
  const baseline = BASELINES[goal.type];

  // For fat loss, lower is better
  if (goal.type === "fat_loss") {
    const totalToLose = baseline - goal.target;
    const lost = baseline - goal.current;
    return Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100)));
  }

  // For endurance (5K), lower time = better
  if (goal.type === "endurance") {
    const totalToImprove = baseline - goal.target;
    const improved = baseline - goal.current;
    return Math.min(100, Math.max(0, Math.round((improved / totalToImprove) * 100)));
  }

  // Strength: higher = better
  const totalToGain = goal.target - baseline;
  const gained = goal.current - baseline;
  return Math.min(100, Math.max(0, Math.round((gained / totalToGain) * 100)));
}

// ─── UNIT LABEL ──────────────────────────────────────────────────────────────

export function goalUnit(type: FitnessGoalType): string {
  return type === "endurance" ? "min" : "lbs";
}
