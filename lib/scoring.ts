import type { Outcome } from "./types";

/**
 * Reglas de puntuacion de la quiniela:
 *  - 5 puntos: marcador EXACTO (goles locales y visitantes correctos).
 *  - 3 puntos: acertar el ganador o el empate (sin marcador exacto).
 *  - 0 puntos: no acertar el resultado.
 */
export const POINTS_EXACT = 5;
export const POINTS_OUTCOME = 3;
export const POINTS_MISS = 0;

export function outcomeOf(homeGoals: number, awayGoals: number): Outcome {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}

export interface ScoreInput {
  predHome: number;
  predAway: number;
  realHome: number;
  realAway: number;
}

/** Devuelve los puntos de una prediccion frente a un resultado real. */
export function computePoints({
  predHome,
  predAway,
  realHome,
  realAway,
}: ScoreInput): number {
  const exact = predHome === realHome && predAway === realAway;
  if (exact) return POINTS_EXACT;

  const sameOutcome = outcomeOf(predHome, predAway) === outcomeOf(realHome, realAway);
  if (sameOutcome) return POINTS_OUTCOME;

  return POINTS_MISS;
}

/** Categoria del acierto, util para UI y desempates. */
export function scoreKind(input: ScoreInput): "exact" | "outcome" | "miss" {
  const pts = computePoints(input);
  if (pts === POINTS_EXACT) return "exact";
  if (pts === POINTS_OUTCOME) return "outcome";
  return "miss";
}
