import type { Match } from "./types";

/** Minutos antes del kickoff en los que se cierra la prediccion. */
export const LOCK_MINUTES_BEFORE = 30;

const LOCK_MS = LOCK_MINUTES_BEFORE * 60 * 1000;

/** Momento (epoch ms) en que se cierra la prediccion de un partido. */
export function lockTime(kickoffIso: string): number {
  return new Date(kickoffIso).getTime() - LOCK_MS;
}

/** True si la prediccion del partido ya esta cerrada para `now`. */
export function isLocked(match: Pick<Match, "kickoff" | "status">, now = Date.now()): boolean {
  if (match.status === "live" || match.status === "finished") return true;
  return now >= lockTime(match.kickoff);
}

/** Milisegundos restantes hasta el cierre (0 si ya cerro). */
export function msUntilLock(kickoffIso: string, now = Date.now()): number {
  return Math.max(0, lockTime(kickoffIso) - now);
}

/** Texto de cuenta regresiva tipo "2d 4h", "3h 12m", "8m 30s". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Cerrada";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
