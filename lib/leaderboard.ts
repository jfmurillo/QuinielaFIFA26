import { computePoints, POINTS_EXACT, POINTS_OUTCOME } from "./scoring";
import type { LeaderboardRow, Match, Prediction, UserProfile } from "./types";

interface BuildArgs {
  members: UserProfile[];
  predictions: Prediction[];
  matches: Match[];
}

/**
 * Construye la tabla de posiciones uniendo predicciones con partidos terminados.
 * Desempates: mas puntos -> mas marcadores exactos -> mas ganadores -> registro mas antiguo.
 */
export function buildLeaderboard({ members, predictions, matches }: BuildArgs): LeaderboardRow[] {
  const finished = new Map<string, Match>();
  for (const m of matches) {
    if (m.status === "finished" && m.homeGoals !== null && m.awayGoals !== null) {
      finished.set(m.id, m);
    }
  }

  const byUid = new Map<string, LeaderboardRow & { createdAt: number }>();
  for (const member of members) {
    byUid.set(member.uid, {
      uid: member.uid,
      nickname: member.nickname,
      avatar: member.avatar,
      points: 0,
      exact: 0,
      outcomes: 0,
      predictions: 0,
      position: 0,
      createdAt: member.createdAt ?? 0,
    });
  }

  for (const pred of predictions) {
    const row = byUid.get(pred.uid);
    if (!row) continue;
    row.predictions += 1;

    const match = finished.get(pred.matchId);
    if (!match) continue;

    const pts = computePoints({
      predHome: pred.homeGoals,
      predAway: pred.awayGoals,
      realHome: match.homeGoals as number,
      realAway: match.awayGoals as number,
    });
    row.points += pts;
    if (pts === POINTS_EXACT) row.exact += 1;
    else if (pts === POINTS_OUTCOME) row.outcomes += 1;
  }

  const rows = [...byUid.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exact !== a.exact) return b.exact - a.exact;
    if (b.outcomes !== a.outcomes) return b.outcomes - a.outcomes;
    return a.createdAt - b.createdAt;
  });

  return rows.map(({ createdAt: _createdAt, ...row }, i) => ({ ...row, position: i + 1 }));
}
