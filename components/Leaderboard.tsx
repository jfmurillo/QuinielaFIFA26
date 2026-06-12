"use client";

import type { LeaderboardRow } from "@/lib/types";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function Leaderboard({
  rows,
  highlightUid,
}: {
  rows: LeaderboardRow[];
  highlightUid?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="card p-6 text-center text-slate-400">
        Aún no hay jugadores. Invita a tus amigos con el código de la quiniela.
      </p>
    );
  }

  return (
    <div className="card divide-y divide-white/5 overflow-hidden">
      {rows.map((row) => {
        const isMe = row.uid === highlightUid;
        return (
          <div
            key={row.uid}
            className={`flex items-center gap-3 px-4 py-3 transition ${
              isMe ? "bg-gold-400/10" : ""
            }`}
          >
            <div className="w-8 text-center text-lg font-bold">
              {MEDALS[row.position] ?? <span className="text-slate-500">{row.position}</span>}
            </div>
            <span className="text-2xl">{row.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {row.nickname}
                {isMe && <span className="ml-2 text-xs text-gold-400">(tú)</span>}
              </p>
              <p className="text-xs text-slate-400">
                🎯 {row.exact} exactos · ✅ {row.outcomes} ganadores · {row.predictions} jugadas
              </p>
            </div>
            <div className="text-right">
              <span className="display text-2xl text-gold-300">{row.points}</span>
              <span className="ml-1 text-xs text-slate-500">pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
