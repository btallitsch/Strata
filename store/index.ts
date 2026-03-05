import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { createUserSlice, type UserSlice } from "./slices/userSlice";
import { createWorkoutSlice, type WorkoutSlice } from "./slices/workoutSlice";
import { createNutritionSlice, type NutritionSlice } from "./slices/nutritionSlice";
import { createGoalsSlice, type GoalsSlice } from "./slices/goalsSlice";
import type { PersistedState } from "@/lib/db/sync";

// ─── COMBINED STORE TYPE ──────────────────────────────────────────────────────

export type AppStore = UserSlice & WorkoutSlice & NutritionSlice & GoalsSlice & {
  // Hydration — called once on mount by useHydrate()
  hydrateFromDB: (saved: PersistedState) => void;
};

// ─── STORE ────────────────────────────────────────────────────────────────────

export const useStore = create<AppStore>()(
  devtools(
    (set, get, api) => ({
      ...createUserSlice(set, get, api),
      ...createWorkoutSlice(set, get, api),
      ...createNutritionSlice(set, get, api),
      ...createGoalsSlice(set, get, api),

      // ── Hydration action ───────────────────────────────────────────────────
      // Merges Dexie data into the store on first load.
      // If a slice has no saved data yet (first ever launch), the initial
      // state from the slice itself is kept as-is.
      hydrateFromDB: (saved: PersistedState) => {
        set((state) => ({
          // Only replace if we actually got rows back — otherwise keep defaults
          workouts: saved.workouts.length > 0
            ? saved.workouts
            : state.workouts,

          nutrition: saved.nutritionDays.length > 0
            ? { ...state.nutrition, days: saved.nutritionDays }
            : state.nutrition,

          goals: saved.goals.length > 0
            ? saved.goals
            : state.goals,

          user: saved.user
            ? saved.user
            : state.user,
        }), false, "hydrateFromDB");
      },
    }),
    { name: "FitnessIQ Store" }
  )
);

// ─── DB SUBSCRIBER ────────────────────────────────────────────────────────────
// Watches for state changes and syncs to Dexie.
// Runs only in the browser — SSR-safe guard on the import.
//
// Strategy: compare previous vs next for each slice and only write
// the records that actually changed. This prevents hammering Dexie
// on every unrelated state update.

if (typeof window !== "undefined") {
  // Lazy import so Dexie (browser-only) never runs during SSR
  import("@/lib/db/sync").then(
    ({ saveWorkout, deleteWorkout, saveNutritionDay, saveGoal, saveUserProfile }) => {

      let prevWorkouts   = useStore.getState().workouts;
      let prevNutrition  = useStore.getState().nutrition;
      let prevGoals      = useStore.getState().goals;
      let prevUser       = useStore.getState().user;

      useStore.subscribe((next) => {

        // ── Workouts ────────────────────────────────────────────────────────
        if (next.workouts !== prevWorkouts) {
          const prevIds = new Set(prevWorkouts.map((w) => w.id));
          const nextIds = new Set(next.workouts.map((w) => w.id));

          // New or updated sessions
          for (const session of next.workouts) {
            if (!prevIds.has(session.id)) {
              saveWorkout(session);
            }
          }
          // Deleted sessions
          for (const id of prevIds) {
            if (!nextIds.has(id)) {
              deleteWorkout(id);
            }
          }
          prevWorkouts = next.workouts;
        }

        // ── Nutrition days ──────────────────────────────────────────────────
        if (next.nutrition !== prevNutrition) {
          for (const day of next.nutrition.days) {
            const prev = prevNutrition.days.find((d) => d.day === day.day);
            if (!prev || prev.actual !== day.actual || prev.target !== day.target) {
              saveNutritionDay(day);
            }
          }
          prevNutrition = next.nutrition;
        }

        // ── Goals ───────────────────────────────────────────────────────────
        if (next.goals !== prevGoals) {
          for (const goal of next.goals) {
            const prev = prevGoals.find((g) => g.id === goal.id);
            if (!prev || JSON.stringify(prev) !== JSON.stringify(goal)) {
              saveGoal(goal);
            }
          }
          prevGoals = next.goals;
        }

        // ── User profile ────────────────────────────────────────────────────
        if (next.user !== prevUser) {
          saveUserProfile(next.user);
          prevUser = next.user;
        }
      });
    }
  );
}

// ─── STATE SELECTORS ──────────────────────────────────────────────────────────

export const useUser      = () => useStore((s) => s.user);
export const useWorkouts  = () => useStore((s) => s.workouts);
export const useNutrition = () => useStore((s) => s.nutrition);
export const useGoals     = () => useStore((s) => s.goals);

// ─── ACTION SELECTORS ─────────────────────────────────────────────────────────

export const useUserActions = () =>
  useStore(useShallow((s) => ({
    setWeight:        s.setWeight,
    setActivityLevel: s.setActivityLevel,
    setAge:           s.setAge,
  })));

export const useWorkoutActions = () =>
  useStore(useShallow((s) => ({
    addWorkout:    s.addWorkout,
    removeWorkout: s.removeWorkout,
  })));

export const useNutritionActions = () =>
  useStore(useShallow((s) => ({
    setTargetCalories: s.setTargetCalories,
    setNutritionGoal:  s.setNutritionGoal,
    logDay:            s.logDay,
  })));

export const useGoalsActions = () =>
  useStore(useShallow((s) => ({
    addGoal:            s.addGoal,
    updateGoalCurrent:  s.updateGoalCurrent,
    updateGoalStatus:   s.updateGoalStatus,
    updateGoalDeadline: s.updateGoalDeadline,
    updateGoalWarning:  s.updateGoalWarning,
  })));
