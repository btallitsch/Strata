import type { StateCreator } from "zustand";
import type { WorkoutSession, Exercise } from "@/types";
import { calcSessionVolume } from "@/lib/utils/workout";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface WorkoutSlice {
  workouts: WorkoutSession[];
  addWorkout: (session: Omit<WorkoutSession, "id" | "volume" | "prs">) => void;
  removeWorkout: (id: number) => void;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const initialWorkouts: WorkoutSession[] = [
  {
    id: 1,
    date: "2026-02-28",
    label: "Upper A",
    volume: 18240,
    prs: 1,
    exercises: [
      {
        name: "Bench Press",
        sets: [
          { weight: 185, reps: 5 },
          { weight: 185, reps: 5 },
          { weight: 185, reps: 4 },
        ],
        rpe: 8,
      },
      {
        name: "Barbell Row",
        sets: [
          { weight: 155, reps: 6 },
          { weight: 155, reps: 6 },
          { weight: 155, reps: 6 },
        ],
        rpe: 7,
      },
      {
        name: "OHP",
        sets: [
          { weight: 115, reps: 6 },
          { weight: 115, reps: 5 },
          { weight: 115, reps: 5 },
        ],
        rpe: 8.5,
      },
    ],
  },
  {
    id: 2,
    date: "2026-02-26",
    label: "Lower A",
    volume: 22400,
    prs: 0,
    exercises: [
      {
        name: "Squat",
        sets: [
          { weight: 245, reps: 4 },
          { weight: 245, reps: 4 },
          { weight: 245, reps: 3 },
        ],
        rpe: 9,
      },
      {
        name: "RDL",
        sets: [
          { weight: 195, reps: 6 },
          { weight: 195, reps: 6 },
          { weight: 195, reps: 6 },
        ],
        rpe: 7.5,
      },
      {
        name: "Leg Press",
        sets: [
          { weight: 360, reps: 10 },
          { weight: 360, reps: 10 },
        ],
        rpe: 7,
      },
    ],
  },
  {
    id: 3,
    date: "2026-02-24",
    label: "Upper B",
    volume: 17100,
    prs: 2,
    exercises: [
      {
        name: "Deadlift",
        sets: [
          { weight: 315, reps: 3 },
          { weight: 315, reps: 3 },
          { weight: 315, reps: 2 },
        ],
        rpe: 9.5,
      },
      {
        name: "Pull-ups",
        sets: [
          { weight: 0, reps: 8 },
          { weight: 0, reps: 7 },
          { weight: 0, reps: 7 },
        ],
        rpe: 8,
      },
    ],
  },
];

// ─── PR DETECTION ─────────────────────────────────────────────────────────────
// Compares new session exercises against existing history to flag PRs

function detectPRs(
  incoming: Exercise[],
  existing: WorkoutSession[]
): number {
  let prCount = 0;

  for (const ex of incoming) {
    const maxNewWeight = Math.max(...ex.sets.map((s) => s.weight));
    const historicalMax = existing
      .flatMap((session) => session.exercises)
      .filter((e) => e.name === ex.name)
      .flatMap((e) => e.sets)
      .reduce((max, s) => Math.max(max, s.weight), 0);

    if (maxNewWeight > historicalMax) prCount++;
  }

  return prCount;
}

// ─── SLICE ────────────────────────────────────────────────────────────────────

export const createWorkoutSlice: StateCreator<WorkoutSlice> = (set, get) => ({
  workouts: initialWorkouts,

  addWorkout: (session) => {
    const existing = get().workouts;
    const volume = calcSessionVolume({
      ...session,
      id: 0,
      volume: 0,
      prs: 0,
    });
    const prs = detectPRs(session.exercises, existing);

    const newSession: WorkoutSession = {
      ...session,
      id: Date.now(),
      volume,
      prs,
    };

    set((state) => ({
      workouts: [newSession, ...state.workouts],
    }));
  },

  removeWorkout: (id) =>
    set((state) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
    })),
});
