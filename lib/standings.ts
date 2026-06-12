import type { Match, Team } from "./types";

export interface StandingRow {
  team: Team;
  mp: number; // partidos jugados
  w: number;  // victorias
  d: number;  // empates
  l: number;  // derrotas
  gf: number; // goles a favor
  ga: number; // goles en contra
  gd: number; // diferencia de goles
  pts: number;
}

export interface GroupStanding {
  group: string;
  rows: StandingRow[];
}

/** Calcula las tablas de posición de la fase de grupos a partir de los partidos terminados. */
export function buildGroupStandings(matches: Match[]): GroupStanding[] {
  const groups = new Map<string, Map<string, StandingRow>>();

  for (const m of matches) {
    if (m.phase !== "groups" || !m.group) continue;

    const g = m.group;
    if (!groups.has(g)) groups.set(g, new Map());
    const table = groups.get(g)!;

    for (const team of [m.home, m.away]) {
      if (!table.has(team.id)) {
        table.set(team.id, { team, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
      }
    }

    if (m.status !== "finished" || m.homeGoals === null || m.awayGoals === null) continue;

    const home = table.get(m.home.id)!;
    const away = table.get(m.away.id)!;

    home.mp += 1; home.gf += m.homeGoals; home.ga += m.awayGoals;
    away.mp += 1; away.gf += m.awayGoals; away.ga += m.homeGoals;

    if (m.homeGoals > m.awayGoals) {
      home.w += 1; home.pts += 3;
      away.l += 1;
    } else if (m.homeGoals < m.awayGoals) {
      away.w += 1; away.pts += 3;
      home.l += 1;
    } else {
      home.d += 1; home.pts += 1;
      away.d += 1; away.pts += 1;
    }

    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  }

  const result: GroupStanding[] = [];
  for (const [group, table] of [...groups.entries()].sort()) {
    const rows = [...table.values()].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
    result.push({ group, rows });
  }
  return result;
}
