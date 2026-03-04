"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import StatusBar from "@/components/layout/StatusBar";
import DashboardView from "@/components/views/DashboardView";
import WorkoutView   from "@/components/views/WorkoutView";
import NutritionView from "@/components/views/NutritionView";
import GoalsView     from "@/components/views/GoalsView";
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
  const View = VIEWS[activeView];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Nav active={activeView} setActive={setActiveView} />

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "88px 32px 72px",
        }}
      >
        <View />
      </main>

      <StatusBar />
    </div>
  );
}
