import type {
  WeightDataPoint,
  StrengthDataPoint,
  NutritionDay,
  WorkoutSession,
  FitnessGoal,
} from "@/types";

// ─── BODYWEIGHT TREND ─────────────────────────────────────────────────────────

export const weightData: WeightDataPoint[] = [
  { day: "W1", weight: 185.4, avg: 185.4 },
  { day: "W2", weight: 184.8, avg: 185.1 },
  { day: "W3", weight: 185.1, avg: 184.95 },
  { day: "W4", weight: 183.9, avg: 184.72 },
  { day: "W5", weight: 183.2, avg: 184.42 },
  { day: "W6", weight: 182.7, avg: 184.0 },
  { day: "W7", weight: 182.1, avg: 183.6 },
  { day: "W8", weight: 181.4, avg: 183.1 },
];

// ─── STRENGTH PROGRESSION ─────────────────────────────────────────────────────

export const strengthData: StrengthDataPoint[] = [
  { week: "W1", squat: 225, bench: 175, deadlift: 275 },
  { week: "W2", squat: 230, bench: 175, deadlift: 280 },
  { week: "W3", squat: 230, bench: 180, deadlift: 285 },
  { week: "W4", squat: 235, bench: 182, deadlift: 290 },
  { week: "W5", squat: 240, bench: 185, deadlift: 295 },
  { week: "W6", squat: 242, bench: 185, deadlift: 300 },
  { week: "W7", squat: 245, bench: 187, deadlift: 305 },
  { week: "W8", squat: 250, bench: 190, deadlift: 315 },
];

// ─── WEEKLY CALORIES ──────────────────────────────────────────────────────────

export const calorieData: NutritionDay[] = [
  { day: "Mon", actual: 2280, target: 2400 },
  { day: "Tue", actual: 2450, target: 2400 },
  { day: "Wed", actual: 2190, target: 2400 },
  { day: "Thu", actual: 2400, target: 2400 },
  { day: "Fri", actual: 2600, target: 2400 },
  { day: "Sat", actual: 2150, target: 2400 },
  { day: "Sun", actual: 2380, target: 2400 },
];

// ─── WORKOUT LOG ──────────────────────────────────────────────────────────────

export const workoutLog: WorkoutSession[] = [
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

// ─── GOALS ────────────────────────────────────────────────────────────────────

export const goalsData: FitnessGoal[] = [
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
