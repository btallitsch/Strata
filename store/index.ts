import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createUserSlice, type UserSlice } from "./slices/userSlice";
import { createWorkoutSlice, type WorkoutSlice } from "./slices/workoutSlice";
import { createNutritionSlice, type NutritionSlice } from "./slices/nutritionSlice";
import { createGoalsSlice, type GoalsSlice } from "./slices/goalsSlice";

// ─── COMBINED STORE TYPE ──────────────────────────────────────────────────────

export type AppStore = UserSlice & WorkoutSlice & NutritionSlice & GoalsSlice;

// ─── STORE ────────────────────────────────────────────────────────────────────
// devtools() wires up Redux DevTools in the browser — you can inspect
// every action and state snapshot in the browser extension.

export const useStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createUserSlice(...args),
      ...createWorkoutSlice(...args),
      ...createNutritionSlice(...args),
      ...createGoalsSlice(...args),
    }),
    { name: "FitnessIQ Store" }
  )
);

// ─── NAMED SLICE SELECTORS ────────────────────────────────────────────────────
// Import these in components instead of selecting the whole store.
// Each returns a stable reference — Zustand only re-renders the
// component when the selected value actually changes.
//
// Usage:
//   const workouts = useWorkouts();
//   const { setTargetCalories } = useNutritionActions();

export const useUser       = () => useStore((s) => s.user);
export const useWorkouts   = () => useStore((s) => s.workouts);
export const useNutrition  = () => useStore((s) => s.nutrition);
export const useGoals      = () => useStore((s) => s.goals);

export const useUserActions = () =>
  useStore((s) => ({
    setWeight:        s.setWeight,
    setActivityLevel: s.setActivityLevel,
    setAge:           s.setAge,
  }));

export const useWorkoutActions = () =>
  useStore((s) => ({
    addWorkout:    s.addWorkout,
    removeWorkout: s.removeWorkout,
  }));

export const useNutritionActions = () =>
  useStore((s) => ({
    setTargetCalories: s.setTargetCalories,
    setNutritionGoal:  s.setNutritionGoal,
    logDay:            s.logDay,
  }));

export const useGoalsActions = () =>
  useStore((s) => ({
    addGoal:            s.addGoal,
    updateGoalCurrent:  s.updateGoalCurrent,
    updateGoalStatus:   s.updateGoalStatus,
    updateGoalDeadline: s.updateGoalDeadline,
    updateGoalWarning:  s.updateGoalWarning,
  }));
