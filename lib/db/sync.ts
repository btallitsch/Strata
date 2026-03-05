import { db } from "./index";
import type { WorkoutSession, NutritionDay, FitnessGoal } from "@/types";
import type { UserState } from "@/store/slices/userSlice";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface PersistedState {
  workouts:      WorkoutSession[];
  nutritionDays: NutritionDay[];
  goals:         FitnessGoal[];
  user:          UserState | null;
}

// ─── READ — called once on app boot ──────────────────────────────────────────

export async function loadAllFromDB(): Promise<PersistedState> {
  const [workouts, nutritionDays, goals, userRows] = await Promise.all([
    db.workouts.orderBy("date").reverse().toArray(),
    db.nutritionDays.toArray(),
    db.goals.toArray(),
    db.userProfile.toArray(),
  ]);

  return {
    workouts,
    nutritionDays,
    goals,
    user: userRows[0] ?? null,
  };
}

// ─── WRITE — called by the store subscriber on state changes ─────────────────

export async function saveWorkout(session: WorkoutSession): Promise<void> {
  await db.workouts.put(session);
}

export async function deleteWorkout(id: number): Promise<void> {
  await db.workouts.delete(id);
}

export async function saveNutritionDay(day: NutritionDay): Promise<void> {
  await db.nutritionDays.put(day);
}

export async function saveGoal(goal: FitnessGoal): Promise<void> {
  await db.goals.put(goal);
}

export async function saveAllGoals(goals: FitnessGoal[]): Promise<void> {
  // bulkPut replaces all rows matching primary key — safe for full array sync
  await db.goals.bulkPut(goals);
}

export async function saveUserProfile(user: UserState): Promise<void> {
  await db.userProfile.put({ ...user, id: 1 });
}

// ─── NUKE — useful for dev / "reset my data" feature ─────────────────────────

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.workouts.clear(),
    db.nutritionDays.clear(),
    db.goals.clear(),
    db.userProfile.clear(),
  ]);
}
