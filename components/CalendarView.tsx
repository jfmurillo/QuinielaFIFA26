"use client";

import { useMemo, useState } from "react";
import { Flag } from "./Flag";
import type { Match, Prediction } from "@/lib/types";

function fmtDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === tomorrow.toDateString()) return "Mañana";
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "live")
    return (
      <span className="pill animate-pulse bg-flare-600/25 text-flare-400 text-[10px]">🔴 En vivo</span>
    );
  if (status === "finished")
    return <span className="pill bg-white/10 text-slate-400 text-[10px]">✅ Finalizado</span>;
  return null;
}

function CalendarMatch({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction | null;
}) {
  const finished =
    match.status === "finished" && match.homeGoals !== null && match.awayGoals !== null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm">
      {/* Hora / status */}
      <div className="w-12 shrink-0 text-center">
        {match.status === "live" ? (
          <StatusBadge status="live" />
        ) : finished ? (
          <StatusBadge status="finished" />
        ) : (
          <span className="text-xs font-bold text-gold-300">{fmtTime(match.kickoff)}</span>
        )}
      </div>

      {/* Equipos */}
      <div className="flex flex-1 items-center justify-center gap-2">
        <div className="flex items-center gap-1.5">
          <Flag code={match.home.code} name={match.home.name} size={28} />
          <span className="hidden text-slate-200 sm:inline">{match.home.name}</span>
        </div>

        <span className="mx-1 font-bold text-slate-300">
          {finished
            ? `${match.homeGoals} - ${match.awayGoals}`
            : "vs"}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="hidden text-slate-200 sm:inline">{match.away.name}</span>
          <Flag code={match.away.code} name={match.away.name} size={28} />
        </div>
      </div>

      {/* Prediccion del usuario */}
      {prediction ? (
        <span className="shrink-0 rounded-lg bg-gold-400/10 px-2 py-0.5 text-[10px] font-bold text-gold-300">
          {prediction.homeGoals}-{prediction.awayGoals}
        </span>
      ) : (
        <span className="shrink-0 text-[10px] text-slate-600">—</span>
      )}
    </div>
  );
}

export function CalendarView({
  matches,
  predByMatch,
}: {
  matches: Match[];
  predByMatch: Map<string, Prediction>;
}) {
  const [finishedOpen, setFinishedOpen] = useState(false);

  const { live, upcoming, finished, byDay } = useMemo(() => {
    const sorted = [...matches].sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );
    const live = sorted.filter((m) => m.status === "live");
    const upcoming = sorted.filter((m) => m.status === "scheduled");
    const finished = sorted
      .filter((m) => m.status === "finished")
      .reverse();

    // Agrupar proximos por dia
    const byDay = new Map<string, Match[]>();
    for (const m of upcoming) {
      const key = new Date(m.kickoff).toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(m);
    }

    return { live, upcoming, finished, byDay };
  }, [matches]);

  return (
    <div className="space-y-6">
      {/* En vivo */}
      {live.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-flare-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-flare-500" />
            En vivo
          </h3>
          <div className="space-y-2">
            {live.map((m) => (
              <CalendarMatch key={m.id} match={m} prediction={predByMatch.get(m.id) ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* Proximos por dia */}
      {upcoming.length > 0 ? (
        <section>
          <h3 className="mb-2 text-sm font-bold text-slate-300">Próximos partidos</h3>
          <div className="space-y-4">
            {[...byDay.entries()].map(([dateStr, dayMatches]) => (
              <div key={dateStr}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {fmtDay(dayMatches[0].kickoff)}
                </p>
                <div className="space-y-2">
                  {dayMatches.map((m) => (
                    <CalendarMatch key={m.id} match={m} prediction={predByMatch.get(m.id) ?? null} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        live.length === 0 && (
          <p className="text-sm text-slate-500">No hay partidos próximos.</p>
        )
      )}

      {/* Finalizados (colapsable) */}
      {finished.length > 0 && (
        <section>
          <button
            onClick={() => setFinishedOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-200"
          >
            <span>{finishedOpen ? "▾" : "▸"}</span>
            Finalizados ({finished.length})
          </button>
          {finishedOpen && (
            <div className="mt-2 space-y-2">
              {finished.map((m) => (
                <CalendarMatch key={m.id} match={m} prediction={predByMatch.get(m.id) ?? null} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
