import "server-only";

import type { Match } from "@/lib/types";
import { getStaticMatches } from "./mapper";

export const isWorldCupApiConfigured = true;

/**
 * Devuelve los 104 partidos del Mundial 2026 desde los datos estáticos locales.
 * Los datos se actualizan editando lib/worldcup/data/matches.json.
 */
export async function fetchAllMatches(): Promise<Match[]> {
  return getStaticMatches();
}
