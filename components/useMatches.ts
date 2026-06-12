"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/lib/types";

interface State {
  matches: Match[];
  loading: boolean;
  error: string | null;
}

/**
 * Obtiene los partidos desde /api/matches y hace polling para mantener
 * resultados y estados al dia (interactividad en vivo).
 */
export function useMatches(pollMs = 30000): State {
  const [state, setState] = useState<State>({ matches: [], loading: true, error: null });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { matches: Match[] };
        if (active) setState({ matches: data.matches, loading: false, error: null });
      } catch (err) {
        if (active) {
          setState((s) => ({ ...s, loading: false, error: (err as Error).message }));
        }
      }
    }

    load();
    const id = setInterval(load, pollMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
