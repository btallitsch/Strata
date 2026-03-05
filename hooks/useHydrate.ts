"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { loadAllFromDB } from "@/lib/db/sync";

// ─── useHydrate ───────────────────────────────────────────────────────────────
// Call once at the app root. Reads everything from Dexie on mount
// and pumps it into the Zustand store via hydrateFromDB().
//
// Returns `isHydrated` so the UI can show a loading skeleton
// instead of a flash of default/mock data before real data arrives.
//
// Why not Zustand's built-in `persist` middleware?
// persist is designed for flat key-value storage (localStorage).
// Dexie is a proper relational DB — each entity type has its own
// table, you can query by date, type, status, etc. That's worth
// the extra 30 lines here.

export function useHydrate() {
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrateFromDB = useStore((s) => s.hydrateFromDB);

  useEffect(() => {
    // Dexie is browser-only — this effect never runs on the server
    async function hydrate() {
      try {
        const saved = await loadAllFromDB();
        hydrateFromDB(saved);
      } catch (err) {
        // DB unavailable (private browsing, quota exceeded, etc.)
        // Silently fall back to in-memory defaults — app still works
        console.warn("[FitnessIQ] IndexedDB unavailable, using defaults:", err);
      } finally {
        setIsHydrated(true);
      }
    }

    hydrate();
  }, [hydrateFromDB]);

  return { isHydrated };
}
