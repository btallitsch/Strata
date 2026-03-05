"use client";

// ─── WHAT CHANGED ─────────────────────────────────────────────────────────────
// BEFORE: Views rendered immediately with whatever was in the Zustand store
//         (in-memory defaults). Refresh = all data gone.
//
// AFTER:  useHydrate() runs on mount, reads IndexedDB via Dexie, and
//         calls hydrateFromDB() to merge saved data into the store.
//         While that's in flight, <LoadingSkeleton /> is shown instead
//         of a flash of stale default data.
//         After hydration, the app renders normally — and from this
//         point on the DB subscriber in store/index.ts keeps Dexie
//         in sync with every store change automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import StatusBar from "@/components/layout/StatusBar";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import DashboardView from "@/components/views/DashboardView";
import WorkoutView   from "@/components/views/WorkoutView";
import NutritionView from "@/components/views/NutritionView";
import GoalsView     from "@/components/views/GoalsView";
import { useHydrate } from "@/hooks/useHydrate";
import { C } from "@/lib/constants/tokens";
import type { NavView } from "@/types";

const VIEWS: Record<NavView, React.ComponentType> = {
  dashboard: DashboardView,
  workout:   WorkoutView,
  nutrition: NutritionView,
  goals:     GoalsView,
};

export default function Home() {
  const [activeView, setActiveView] = useState<NavView>("dashboard");

  // ✅ NEW: blocks render until Dexie has hydrated the store
  const { isHydrated } = useHydrate();

  const View = VIEWS[activeView];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav active={activeView} setActive={setActiveView} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 32px 72px" }}>
        {/* ✅ NEW: shimmer skeleton while IndexedDB loads */}
        {isHydrated ? <View /> : <LoadingSkeleton />}
      </main>

      <StatusBar />
    </div>
  );
}
