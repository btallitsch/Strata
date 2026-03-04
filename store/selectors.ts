import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "./index";
import { calculateBMR, calculateTDEE, calculateMacros, calcAdherence } from "@/lib/utils/nutrition";
import { calcGoalProgress } from "@/lib/utils/goals";

// ─── DASHBOARD SELECTORS ──────────────────────────────────────────────────────
// Reads from 3 slices simultaneously. useShallow on each prevents the
// "new object reference every render" loop.

export function useDashboardSelectors() {
  const workouts  = useStore((s) => s.workouts);
  const nutrition = useStore(useShallow((s) => ({
    days:            s.nutrition.days,
    targetCalories:  s.nutrition.targetCalories,
  })));
  const goals = useStore((s) => s.goals);

  return useMemo(() => {
    const thisWeek     = workouts.slice(0, 4);
    const weeklyVolume = thisWeek.reduce((sum, w) => sum + w.volume, 0);
    const weeklyPRs    = thisWeek.reduce((sum, w) => sum + w.prs, 0);

    const allExercises = thisWeek.flatMap((w) => w.exercises);
    const avgRPE = allExercises.length
      ? (allExercises.reduce((sum, e) => sum + e.rpe, 0) / allExercises.length).toFixed(1)
      : "—";

    const consistencyScore = Math.min(100, Math.round((thisWeek.length / 4) * 100));
    const calorieAdherence = calcAdherence(nutrition.days);

    const fatLossGoal  = goals.find((g) => g.type === "fat_loss");
    const weightTrend  = fatLossGoal
      ? (fatLossGoal.current - 185.4).toFixed(1)
      : "—";

    const hasGoalConflict = goals.some((g) => g.status === "at_risk");
    const goalsOnTrack    = goals.filter((g) => g.status === "on_track").length;

    return {
      weeklyVolume,
      weeklyPRs,
      avgRPE,
      consistencyScore,
      calorieAdherence,
      weightTrend,
      hasGoalConflict,
      goalsOnTrack,
    };
  }, [workouts, nutrition.days, nutrition.targetCalories, goals]);
}

// ─── NUTRITION SELECTORS ──────────────────────────────────────────────────────

export function useNutritionSelectors() {
  const user = useStore(useShallow((s) => ({
    weight:        s.user.weight,
    heightIn:      s.user.heightIn,
    age:           s.user.age,
    isMale:        s.user.isMale,
    activityLevel: s.user.activityLevel,
  })));
  const goal = useStore((s) => s.nutrition.goal);

  return useMemo(() => {
    const bmr   = calculateBMR(user.weight, user.heightIn, user.age, user.isMale);
    const tdee  = calculateTDEE(bmr, user.activityLevel);
    const macro = calculateMacros(user.weight, tdee, goal);

    const deficit             = tdee - macro.calories;
    const weeklyLossEstimate  = (deficit / 3500) * 7;

    return { bmr, tdee, macro, deficit, weeklyLossEstimate };
  }, [user.weight, user.heightIn, user.age, user.isMale, user.activityLevel, goal]);
}

// ─── GOAL SELECTORS ───────────────────────────────────────────────────────────

export function useGoalsWithProgress() {
  const goals = useStore((s) => s.goals);

  return useMemo(
    () => goals.map((g) => ({ ...g, progress: calcGoalProgress(g) })),
    [goals]
  );
}

// ─── CONFLICT DETECTOR ────────────────────────────────────────────────────────

export function useGoalConflicts() {
  const targetCalories = useStore((s) => s.nutrition.targetCalories);
  const user = useStore(useShallow((s) => ({
    weight:        s.user.weight,
    heightIn:      s.user.heightIn,
    age:           s.user.age,
    isMale:        s.user.isMale,
    activityLevel: s.user.activityLevel,
  })));
  const goals = useStore((s) => s.goals);

  return useMemo(() => {
    const bmr          = calculateBMR(user.weight, user.heightIn, user.age, user.isMale);
    const tdee         = calculateTDEE(bmr, user.activityLevel);
    const dailyDeficit = tdee - targetCalories;

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
    const hasConflict = requiredDailyDeficit > dailyDeficit + 100;

    return {
      hasConflict,
      message: hasConflict
        ? `Goal requires ~${Math.round(requiredDailyDeficit)} kcal/day deficit. ` +
          `Current: ~${Math.round(dailyDeficit)} kcal/day. ` +
          `Consider extending deadline or reducing intake.`
        : null,
    };
  }, [targetCalories, user.weight, user.heightIn, user.age, user.isMale, user.activityLevel, goals]);
}
