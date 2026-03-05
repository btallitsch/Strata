import Dexie, { type Table } from "dexie";
import type { WorkoutSession, NutritionDay, FitnessGoal } from "@/types";
import type { UserState } from "@/store/slices/userSlice";

// ─── TABLE TYPES ──────────────────────────────────────────────────────────────
// Dexie stores exercises[] as serialized JSON — IndexedDB can't index into
// nested arrays, so the column schema only needs to declare the keys we
// want to query/sort by. Everything else is stored as-is.

export interface WorkoutRecord extends WorkoutSession {
  // exercises: Exercise[] stored as plain JSON — no extra columns needed
}

export interface NutritionDayRecord extends NutritionDay {
  // &day = unique primary key (e.g. "2026-03-01")
}

export interface GoalRecord extends FitnessGoal {
  // id is already on FitnessGoal
}

export interface UserProfileRecord extends UserState {
  id: 1; // singleton — always read/write record with id=1
}

// ─── DATABASE CLASS ───────────────────────────────────────────────────────────

class FitnessIQDatabase extends Dexie {
  workouts!:      Table<WorkoutRecord,      number>;  // keyed by WorkoutSession.id
  nutritionDays!: Table<NutritionDayRecord, string>;  // keyed by NutritionDay.day
  goals!:         Table<GoalRecord,         number>;  // keyed by FitnessGoal.id
  userProfile!:   Table<UserProfileRecord,  number>;  // keyed by id (always 1)

  constructor() {
    super("FitnessIQDB");

    this.version(1).stores({
      // Syntax: "primaryKey, indexedColumn, indexedColumn"
      // Only declare columns you need to query/filter on.
      // All other fields are stored automatically.
      workouts:      "id, date",        // query by date for weekly aggregation
      nutritionDays: "&day",            // unique day string; & = unique index
      goals:         "id, type, status",// query by type (fat_loss, strength…)
      userProfile:   "id",             // singleton row
    });
  }
}

// ─── SINGLETON ────────────────────────────────────────────────────────────────
// Export a single instance. Next.js can hot-reload modules in dev — the
// `typeof window` guard prevents double-instantiation on the server.

export const db = typeof window !== "undefined"
  ? new FitnessIQDatabase()
  : (null as unknown as FitnessIQDatabase);
