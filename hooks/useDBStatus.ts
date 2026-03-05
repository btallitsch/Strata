"use client";

import { useEffect, useState } from "react";

interface DBStatus {
  available: boolean;
  workoutCount: number;
  isChecking: boolean;
}

export function useDBStatus(): DBStatus {
  const [status, setStatus] = useState<DBStatus>({
    available: false,
    workoutCount: 0,
    isChecking: true,
  });

  useEffect(() => {
    async function check() {
      try {
        const { db } = await import("@/lib/db/index");
        const count = await db.workouts.count();
        setStatus({ available: true, workoutCount: count, isChecking: false });
      } catch {
        setStatus({ available: false, workoutCount: 0, isChecking: false });
      }
    }
    check();
  }, []);

  return status;
}
