import type { StateCreator } from "zustand";
import type { FitnessGoal, GoalStatus } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface GoalsSlice {
  goals: FitnessGoal[];
  addGoal: (goal: Omit<FitnessGoal, "id">) => void;
  updateGoalCurrent: (id: number, current: number) => void;
  updateGoalStatus: (id: number, status: GoalStatus) => void;
  updateGoalDeadline: (id: number, deadline: string) => void;
  updateGoalWarning: (id: number, warning: string | null) => void;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const initialGoals: FitnessGoal[] = [
  {
    id: 1,
    type: "strength",
    label: "Squat 275 lbs",
    current: 250,
    target: 275,
    deadline: "2026-06-01",
    status: "on_track",
    warning: null,
  },
  {
    id: 2,
    type: "fat_loss",
    label: "Reach 178 lbs",
    current: 181.4,
    target: 178,
    deadline: "2026-04-15",
    status: "at_risk",
    warning: "Current deficit may be insufficient",
  },
  {
    id: 3,
    type: "endurance",
    label: "5K under 24 min",
    current: 26.2,
    target: 24,
    deadline: "2026-05-01",
    status: "on_track",
    warning: null,
  },
];

// ─── SLICE ────────────────────────────────────────────────────────────────────

export const createGoalsSlice: StateCreator<GoalsSlice> = (set) => ({
  goals: initialGoals,

  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, { ...goal, id: Date.now() }],
    })),

  updateGoalCurrent: (id, current) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, current } : g
      ),
    })),

  updateGoalStatus: (id, status) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, status } : g
      ),
    })),

  updateGoalDeadline: (id, deadline) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, deadline } : g
      ),
    })),

  updateGoalWarning: (id, warning) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, warning } : g
      ),
    })),
});
