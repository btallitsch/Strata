import type { StateCreator } from "zustand";
import type { ActivityLevel } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface UserState {
  weight: number;       // lbs
  heightIn: number;     // inches
  age: number;
  activityLevel: ActivityLevel;
  isMale: boolean;
}

export interface UserSlice {
  user: UserState;
  setWeight: (weight: number) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  setAge: (age: number) => void;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const initialUser: UserState = {
  weight: 181.4,
  heightIn: 70,
  age: 28,
  activityLevel: "moderate",
  isMale: true,
};

// ─── SLICE ────────────────────────────────────────────────────────────────────

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: initialUser,

  setWeight: (weight) =>
    set((state) => ({
      user: { ...state.user, weight },
    })),

  setActivityLevel: (activityLevel) =>
    set((state) => ({
      user: { ...state.user, activityLevel },
    })),

  setAge: (age) =>
    set((state) => ({
      user: { ...state.user, age },
    })),
});
