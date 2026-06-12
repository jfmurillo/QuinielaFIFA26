import "server-only";

import type { Match, MatchStatus, Phase, Team } from "@/lib/types";
import rawMatches from "./data/matches.json";
import rawTeams from "./data/teams.json";

type RawTeam = { id: string; name_en: string; flag: string; fifa_code: string; iso2: string; groups: string };
type RawMatch = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  group: string;
  local_date: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_label?: string;
  away_team_label?: string;
};

const teamMap = new Map<string, RawTeam>(
  (rawTeams as RawTeam[]).map((t) => [t.id, t])
);

function mapPhase(type: string): Phase {
  switch (type.toLowerCase()) {
    case "r32": return "round32";
    case "r16": return "round16";
    case "qf":  return "quarter";
    case "sf":  return "semi";
    case "third": return "third";
    case "final": return "final";
    default:    return "groups";
  }
}

function mapStatus(finished: string, timeElapsed: string): MatchStatus {
  if (finished.toUpperCase() === "TRUE") return "finished";
  const te = timeElapsed.toLowerCase();
  if (te === "notstarted" || te === "") return "scheduled";
  return "live";
}

// Dates in the JSON are local US/Central time (UTC-5). Convert to UTC.
function parseKickoff(localDate: string): string {
  const [datePart, timePart] = localDate.split(" ");
  const [month, day, year] = datePart.split("/");
  return new Date(`${year}-${month}-${day}T${timePart}:00-05:00`).toISOString();
}

function buildTeam(teamId: string, label?: string): Team {
  if (teamId === "0" || !teamId) {
    return {
      id: "tbd",
      name: label ?? "Por definir",
      code: "un",
      flag: undefined,
    };
  }
  const raw = teamMap.get(teamId);
  if (!raw) {
    return { id: teamId, name: label ?? teamId, code: "un", flag: undefined };
  }
  return {
    id: raw.id,
    name: raw.name_en,
    code: raw.iso2.toLowerCase(),
    flag: raw.flag,
  };
}

function mapGroup(raw: RawMatch): string | null {
  const g = raw.group?.toUpperCase();
  if (!g || g.length !== 1 || g < "A" || g > "L") return null;
  return g;
}

export function getStaticMatches(): Match[] {
  return (rawMatches as RawMatch[]).map((raw): Match => ({
    id: raw.id,
    phase: mapPhase(raw.type),
    group: mapGroup(raw),
    home: buildTeam(raw.home_team_id, raw.home_team_label),
    away: buildTeam(raw.away_team_id, raw.away_team_label),
    kickoff: parseKickoff(raw.local_date),
    venue: null,
    status: mapStatus(raw.finished, raw.time_elapsed),
    homeGoals: raw.finished.toUpperCase() === "TRUE" ? Number(raw.home_score) : null,
    awayGoals: raw.finished.toUpperCase() === "TRUE" ? Number(raw.away_score) : null,
    updatedAt: new Date().toISOString(),
  }));
}
