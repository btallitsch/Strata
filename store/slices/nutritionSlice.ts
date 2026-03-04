import type { StateCreator } from "zustand";
import type { GoalType, NutritionDay } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface NutritionState {
  targetCalories: number;
  goal: GoalType;
  days: NutritionDay[];
}

export interface NutritionSlice {
  nutrition: NutritionState;
  setTargetCalories: (calories: number) => void;
  setNutritionGoal: (goal: GoalType) => void;
  logDay: (entry: NutritionDay) => void;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const initialNutrition: NutritionState = {
  targetCalories: 2400,
  goal: "cut",
  days: [
    { day: "Mon", actual: 2280, target: 2400 },
    { day: "Tue", actual: 2450, target: 2400 },
    { day: "Wed", actual: 2190, target: 2400 },
    { day: "Thu", actual: 2400, target: 2400 },
    { day: "Fri", actual: 2600, target: 2400 },
    { day: "Sat", actual: 2150, target: 2400 },
    { day: "Sun", actual: 2380, target: 2400 },
  ],
};

// ─── SLICE ────────────────────────────────────────────────────────────────────

export const createNutritionSlice: StateCreator<NutritionSlice> = (set) => ({
  nutrition: initialNutrition,

  setTargetCalories: (targetCalories) =>
    set((state) => ({
      nutrition: {
        ...state.nutrition,
        targetCalories,
        // Keep days in sync with new target
        days: state.nutrition.days.map((d) => ({
          ...d,
          target: targetCalories,
        })),
      },
    })),

  setNutritionGoal: (goal) =>
    set((state) => ({
      nutrition: { ...state.nutrition, goal },
    })),

  logDay: (entry) =>
    set((state) => {
      const exists = state.nutrition.days.find((d) => d.day === entry.day);
      return {
        nutrition: {
          ...state.nutrition,
          days: exists
            ? state.nutrition.days.map((d) =>
                d.day === entry.day ? entry : d
              )
            : [...state.nutrition.days, entry],
        },
      };
    }),
});
