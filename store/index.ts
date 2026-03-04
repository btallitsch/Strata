import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { createUserSlice, type UserSlice } from "./slices/userSlice";
import { createWorkoutSlice, type WorkoutSlice } from "./slices/workoutSlice";
import { createNutritionSlice, type NutritionSlice } from "./slices/nutritionSlice";
import { createGoalsSlice, type GoalsSlice } from "./slices/goalsSlice";

// ─── COMBINED STORE TYPE ──────────────────────────────────────────────────────

export type AppStore = UserSlice & WorkoutSlice & NutritionSlice & GoalsSlice;

// ─── STORE ────────────────────────────────────────────────────────────────────

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

// ─── STATE SELECTORS ──────────────────────────────────────────────────────────
// Primitive selectors (return a single value) are fine without useShallow.
// Object/array selectors MUST use useShallow — without it Zustand compares
// the returned object by reference, sees a new object every render, and
// triggers an infinite re-render loop (React error #185).

export const useUser      = () => useStore((s) => s.user);
export const useWorkouts  = () => useStore((s) => s.workouts);
export const useNutrition = () => useStore((s) => s.nutrition);
export const useGoals     = () => useStore((s) => s.goals);

// ─── ACTION SELECTORS ─────────────────────────────────────────────────────────
// These return plain functions (stable references), but they're still wrapped
// in useShallow so bundling them into an object doesn't create a new reference
// on each render.

export const useUserActions = () =>
  useStore(
    useShallow((s) => ({
      setWeight:        s.setWeight,
      setActivityLevel: s.setActivityLevel,
      setAge:           s.setAge,
    }))
  );

export const useWorkoutActions = () =>
  useStore(
    useShallow((s) => ({
      addWorkout:    s.addWorkout,
      removeWorkout: s.removeWorkout,
    }))
  );

export const useNutritionActions = () =>
  useStore(
    useShallow((s) => ({
      setTargetCalories: s.setTargetCalories,
      setNutritionGoal:  s.setNutritionGoal,
      logDay:            s.logDay,
    }))
  );

export const useGoalsActions = () =>
  useStore(
    useShallow((s) => ({
      addGoal:            s.addGoal,
      updateGoalCurrent:  s.updateGoalCurrent,
      updateGoalStatus:   s.updateGoalStatus,
      updateGoalDeadline: s.updateGoalDeadline,
      updateGoalWarning:  s.updateGoalWarning,
    }))
  );
