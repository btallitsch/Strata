import type { ExerciseSet, WorkoutSession } from "@/types";

// ─── VOLUME ───────────────────────────────────────────────────────────────────

export function calcSetVolume(set: ExerciseSet): number {
  return set.weight * set.reps;
}

export function calcExerciseVolume(sets: ExerciseSet[]): number {
  return sets.reduce((total, set) => total + calcSetVolume(set), 0);
}

export function calcSessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) => total + calcExerciseVolume(ex.sets),
    0
  );
}

// ─── RPE COLOR ────────────────────────────────────────────────────────────────

import { C } from "@/lib/constants/tokens";

export function rpeColor(rpe: number): string {
  if (rpe >= 9) return C.red;
  if (rpe >= 8) return C.amber;
  return C.accent;
}

// ─── FORMAT VOLUME ────────────────────────────────────────────────────────────

export function formatVolume(lbs: number): string {
  return `${(lbs / 1000).toFixed(1)}k`;
}
