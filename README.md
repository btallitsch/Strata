# FitnessIQ — Fitness Intelligence Platform

A unified fitness **decision engine** built with Next.js 15, React 19, and TypeScript.

Not just a tracker — it explains *why* numbers change, models tradeoffs, and adapts recommendations based on your behavior.

See it in action here: https://strata-rho-ten.vercel.app/

---

## Tech Stack

- **Next.js 15** (App Router)
- **React 19** with TypeScript
- **Zustand 5** — global state with slice pattern + devtools
- **Recharts** for data visualization
- **IBM Plex Mono + DM Serif Display** — custom type system
- Zero external UI libraries — fully custom component system

---

## Project Structure

```
fitnessiq/
├── app/
│   ├── layout.tsx          # Root layout + font loading
│   ├── page.tsx            # App shell + view router
│   └── globals.css         # Global resets + scrollbar
│
├── store/                  # ✅ Zustand global state
│   ├── index.ts            # useStore, named slice hooks, action hooks
│   ├── selectors.ts        # Cross-slice derived state (dashboard KPIs, conflicts)
│   └── slices/
│       ├── userSlice.ts    # weight, height, age, activityLevel
│       ├── workoutSlice.ts # session log, addWorkout, PR detection
│       ├── nutritionSlice.ts # targetCalories, goal, daily logs
│       └── goalsSlice.ts   # goals array, update actions
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx         # Top navigation bar
│   │   └── StatusBar.tsx   # Bottom status strip
│   ├── ui/
│   │   ├── Card.tsx        # Base card container
│   │   ├── Stat.tsx        # Metric display (label + big number)
│   │   ├── Tag.tsx         # Pill/badge label
│   │   └── misc.tsx        # Divider, SectionLabel, RPEBadge, ChartTooltip
│   └── views/
│       ├── DashboardView.tsx   # Reads from store via useDashboardSelectors()
│       ├── WorkoutView.tsx     # Reads/writes workoutSlice
│       ├── NutritionView.tsx   # Reads/writes userSlice + nutritionSlice
│       └── GoalsView.tsx       # Reads goalsSlice + cross-slice conflict selector
│
├── lib/
│   ├── constants/
│   │   └── tokens.ts       # Design tokens (colors, fonts, goal configs)
│   ├── data/
│   │   └── mockData.ts     # Seed data (consumed by slice initialState)
│   └── utils/
│       ├── nutrition.ts    # BMR/TDEE/macro calculations
│       ├── workout.ts      # Volume, RPE color, formatting
│       └── goals.ts        # Goal progress %, unit labels
│
└── types/
    └── index.ts            # All shared TypeScript interfaces
```

---

## Core Modules

### 1. Intelligence Dashboard
- Weekly KPI tiles (consistency, adherence, weight trend, volume)
- Strength progression charts (squat / bench / deadlift toggle)
- Bodyweight moving average vs daily readings
- Calorie adherence bar chart with target reference line
- Engine signals panel (automated flags and insights)

### 2. Workout Tracker
- Session history with volume and PR detection
- Per-exercise set/rep/weight breakdown
- RPE badges (color-coded by intensity)
- Volume calculations per exercise and session

### 3. Nutrition Engine
- Live TDEE calculator using Mifflin-St Jeor formula
- Activity level and goal toggles (cut / maintain / bulk)
- Animated macro proportion bars
- **Explainability cards** — every number has a visible justification
- Auto-generated adjustment suggestions based on trend data

### 4. Goal Engine
- Adaptive progress cards per goal type (strength / fat loss / endurance)
- Goal conflict detection with resolution options
- Constraint warnings
- Scenario simulator teaser (next feature to build)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

- [ ] Zustand global state (replace local useState)
- [ ] Dexie.js offline-first storage (IndexedDB)
- [ ] Scenario simulation engine ("what if" modeling)
- [ ] Weekly report PDF export
- [ ] Role-based coaching view (athlete vs coach)
- [ ] Real user profile + auth (NextAuth)

---

## Resume Summary

> **Fitness Intelligence Platform** — Designed and built a React/Next.js application modeling workouts, nutrition, and goals as a unified decision system. Implemented derived metrics (TDEE, volume load, progressive overload detection), adaptive macro logic, and weekly insight generation. Custom TypeScript type system with full separation of data, logic, and UI layers.
