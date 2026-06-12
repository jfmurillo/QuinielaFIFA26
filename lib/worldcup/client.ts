import "server-only";

import type { Match, MatchStatus, Phase, Team } from "@/lib/types";
import { getSeedMatches } from "./seed";

const BASE_URL = process.env.WORLDCUP_API_BASE_URL || "https://worldcupapi.com/api/v1";
const API_KEY = process.env.WORLDCUP_API_KEY;

export const isWorldCupApiConfigured = Boolean(API_KEY);

// La World Cup API (worldcupapi.com) usa nombres de fase variables segun el
// endpoint. Mapeamos de forma defensiva a nuestras fases internas.
function mapPhase(raw: unknown): Phase {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("final") && !s.includes("semi") && !s.includes("quarter")) return "final";
  if (s.includes("third") || s.includes("3rd") || s.includes("tercer")) return "third";
  if (s.includes("semi")) return "semi";
  if (s.includes("quarter") || s.includes("4")) return "quarter";
  if (s.includes("16") || s.includes("round of 16") || s.includes("octav")) return "round16";
  if (s.includes("32") || s.includes("round of 32")) return "round32";
  return "groups";
}

function mapStatus(raw: unknown): MatchStatus {
  const s = String(raw ?? "").toLowerCase();
  if (["finished", "ft", "completed", "ended", "played"].some((k) => s.includes(k))) {
    return "finished";
  }
  if (["live", "in_play", "inplay", "1h", "2h", "ht"].some((k) => s.includes(k))) {
    return "live";
  }
  return "scheduled";
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

type AnyRecord = Record<string, unknown>;

function mapTeam(raw: AnyRecord | undefined, fallbackId: string): Team {
  const r = raw ?? {};
  const name = String(r.name ?? r.team ?? r.title ?? fallbackId);
  const code = String(r.code ?? r.short ?? r.country_code ?? r.fifa_code ?? fallbackId).toLowerCase();
  return {
    id: String(r.id ?? code ?? fallbackId),
    name,
    code,
    flag: typeof r.flag === "string" ? r.flag : undefined,
  };
}

/** Convierte un partido crudo de la API en nuestro tipo Match. */
function mapApiMatch(raw: AnyRecord): Match | null {
  const id = raw.id ?? raw.match_id ?? raw.fixture_id;
  if (id === undefined || id === null) return null;

  const home = mapTeam((raw.home_team ?? raw.home ?? raw.team_home) as AnyRecord, "home");
  const away = mapTeam((raw.away_team ?? raw.away ?? raw.team_away) as AnyRecord, "away");
  const kickoffRaw = raw.kickoff ?? raw.date ?? raw.datetime ?? raw.utc_date ?? raw.start_time;

  return {
    id: String(id),
    phase: mapPhase(raw.phase ?? raw.stage ?? raw.round),
    group: (raw.group ?? raw.group_name ?? null) as string | null,
    home,
    away,
    kickoff: new Date(String(kickoffRaw ?? Date.now())).toISOString(),
    venue: (raw.venue ?? raw.stadium ?? null) as string | null,
    status: mapStatus(raw.status ?? raw.state),
    homeGoals: num(raw.home_score ?? raw.home_goals ?? (raw.score as AnyRecord)?.home),
    awayGoals: num(raw.away_score ?? raw.away_goals ?? (raw.score as AnyRecord)?.away),
    updatedAt: new Date().toISOString(),
  };
}

function extractArray(payload: unknown): AnyRecord[] {
  if (Array.isArray(payload)) return payload as AnyRecord[];
  if (payload && typeof payload === "object") {
    const obj = payload as AnyRecord;
    for (const key of ["data", "matches", "fixtures", "results", "response"]) {
      if (Array.isArray(obj[key])) return obj[key] as AnyRecord[];
    }
  }
  return [];
}

/**
 * Obtiene todos los partidos del Mundial 2026.
 * Si la API no esta configurada o falla, devuelve los fixtures de respaldo.
 */
export async function fetchAllMatches(): Promise<Match[]> {
  if (!API_KEY) return getSeedMatches();

  try {
    const res = await fetch(`${BASE_URL}/matches`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "X-API-Key": API_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`World Cup API respondio ${res.status}; usando fixtures de respaldo.`);
      return getSeedMatches();
    }

    const json = await res.json();
    const mapped = extractArray(json)
      .map(mapApiMatch)
      .filter((m): m is Match => m !== null);

    return mapped.length ? mapped : getSeedMatches();
  } catch (err) {
    console.warn("Error consultando la World Cup API; usando fixtures de respaldo.", err);
    return getSeedMatches();
  }
}
