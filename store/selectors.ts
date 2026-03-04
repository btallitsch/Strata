import { useMemo } from "react";
import { useWorkouts, useNutrition, useUser, useGoals } from "./index";
import { calculateBMR, calculateTDEE, calculateMacros, calcAdherence } from "@/lib/utils/nutrition";
import { calcGoalProgress } from "@/lib/utils/goals";

// ─── DASHBOARD SELECTORS ──────────────────────────────────────────────────────
// Aggregates across workout + nutrition + goals slices.
// This is the "intelligence" layer — pure derived state.

export function useDashboardSelectors() {
  const workouts  = useWorkouts();
  const nutrition = useNutrition();
  const goals     = useGoals();

  return useMemo(() => {
    const thisWeek      = workouts.slice(0, 4);
    const weeklyVolume  = thisWeek.reduce((sum, w) => sum + w.volume, 0);
    const weeklyPRs     = thisWeek.reduce((sum, w) => sum + w.prs, 0);
    const avgRPE        = thisWeek.length
      ? (thisWeek.flatMap((w) => w.exercises).reduce((sum, e) => sum + e.rpe, 0) /
         thisWeek.flatMap((w) => w.exercises).length).toFixed(1)
      : "—";

    // Consistency: sessions this week vs target of 4
    const consistencyScore = Math.min(
      100,
      Math.round((thisWeek.length / 4) * 100)
    );

    const calorieAdherence  = calcAdherence(nutrition.days);
    const weeklyCalAvg      = Math.round(
      nutrition.days.reduce((s, d) => s + d.actual, 0) / nutrition.days.length
    );

    const fatLossGoal       = goals.find((g) => g.type === "fat_loss");
    const weightTrend       = fatLossGoal
      ? (fatLossGoal.current - 185.4).toFixed(1) // delta from start
      : "—";

    const hasGoalConflict   = goals.some((g) => g.status === "at_risk");
    const goalsOnTrack      = goals.filter((g) => g.status === "on_track").length;

    return {
      weeklyVolume,
      weeklyPRs,
      avgRPE,
      consistencyScore,
      calorieAdherence,
      weeklyCalAvg,
      weightTrend,
      hasGoalConflict,
      goalsOnTrack,
    };
  }, [workouts, nutrition, goals]);
}

// ─── NUTRITION SELECTORS ──────────────────────────────────────────────────────
// Derives TDEE and macros from user + nutrition slices together.

export function useNutritionSelectors() {
  const user      = useUser();
  const nutrition = useNutrition();

  return useMemo(() => {
    const bmr   = calculateBMR(user.weight, user.heightIn, user.age, user.isMale);
    const tdee  = calculateTDEE(bmr, user.activityLevel);
    const macro = calculateMacros(user.weight, tdee, nutrition.goal);

    const deficit  = tdee - macro.calories;
    const weeklyLossEstimate = (deficit / 3500) * 7;

    return { bmr, tdee, macro, deficit, weeklyLossEstimate };
  }, [user, nutrition.goal]);
}

// ─── GOAL SELECTORS ───────────────────────────────────────────────────────────
// Enriches each goal with its computed progress percentage.

export function useGoalsWithProgress() {
  const goals = useGoals();

  return useMemo(
    () => goals.map((g) => ({ ...g, progress: calcGoalProgress(g) })),
    [goals]
  );
}

// ─── CONFLICT DETECTOR ────────────────────────────────────────────────────────
// Cross-slice: reads nutrition target + fat loss goal deadline to
// determine if the deficit is sufficient to hit the goal in time.

export function useGoalConflicts() {
  const nutrition = useNutrition();
  const user      = useUser();
  const goals     = useGoals();

  return useMemo(() => {
    const bmr  = calculateBMR(user.weight, user.heightIn, user.age, user.isMale);
    const tdee = calculateTDEE(bmr, user.activityLevel);
    const dailyDeficit = tdee - nutrition.targetCalories;

    const fatLossGoal = goals.find((g) => g.type === "fat_loss");
    if (!fatLossGoal) return { hasConflict: false, message: null };

    const lbsToLose = fatLossGoal.current - fatLossGoal.target;
    const daysUntilDeadline = Math.max(
      1,
      Math.round(
        (new Date(fatLossGoal.deadline).getTime() - Date.now()) / 86400000
      )
    );
    const requiredDailyDeficit = (lbsToLose * 3500) / daysUntilDeadline;
    const hasConflict = requiredDailyDeficit > dailyDeficit + 100; // 100 kcal tolerance

    return {
      hasConflict,
      message: hasConflict
        ? `Goal requires ~${Math.round(requiredDailyDeficit)} kcal/day deficit. ` +
          `Current: ~${Math.round(dailyDeficit)} kcal/day. ` +
          `Consider extending deadline or reducing intake.`
        : null,
    };
  }, [nutrition, user, goals]);
}
