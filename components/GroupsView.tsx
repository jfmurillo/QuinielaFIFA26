"use client";

import { useMemo, useState } from "react";
import { Flag } from "./Flag";
import { buildGroupStandings } from "@/lib/standings";
import type { Match } from "@/lib/types";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function ClassifyBadge({ pos, totalGroups }: { pos: number; totalGroups: number }) {
  // Top 2 clasifican directamente; "mejor tercero" no lo calculamos aqui
  if (pos <= 2)
    return (
      <span className="ml-1 rounded-sm bg-pitch-500/20 px-1 py-0.5 text-[9px] font-bold text-pitch-400">
        Clasifica
      </span>
    );
  if (pos === 3 && totalGroups === 12)
    return (
      <span className="ml-1 rounded-sm bg-gold-400/15 px-1 py-0.5 text-[9px] font-bold text-gold-400">
        Posible
      </span>
    );
  return null;
}

export function GroupsView({ matches }: { matches: Match[] }) {
  const standings = useMemo(() => buildGroupStandings(matches), [matches]);
  const groups = standings.map((s) => s.group);

  const [activeGroup, setActiveGroup] = useState<string>(groups[0] ?? "A");

  const current = standings.find((s) => s.group === activeGroup);
  const groupMatches = useMemo(
    () =>
      matches
        .filter((m) => m.phase === "groups" && m.group === activeGroup)
        .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [matches, activeGroup]
  );

  return (
    <div className="space-y-5">
      {/* Selector de grupo */}
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`h-9 w-9 rounded-xl text-sm font-bold transition ${
              activeGroup === g
                ? "bg-gradient-to-br from-gold-400 to-gold-500 text-night-950 shadow-glow"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {current && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Tabla de posiciones */}
          <div className="card overflow-hidden p-0">
            <div className="border-b border-white/8 px-4 py-3">
              <h3 className="display text-base text-slate-200">Grupo {activeGroup}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2 pl-4 text-left">#</th>
                  <th className="py-2 text-left">Equipo</th>
                  <th className="py-2 text-center">PJ</th>
                  <th className="py-2 text-center">G</th>
                  <th className="py-2 text-center">E</th>
                  <th className="py-2 text-center">P</th>
                  <th className="py-2 text-center">GD</th>
                  <th className="py-2 pr-4 text-center font-bold text-gold-300">Pts</th>
                </tr>
              </thead>
              <tbody>
                {current.rows.map((row, i) => {
                  const pos = i + 1;
                  const qualifies = pos <= 2;
                  return (
                    <tr
                      key={row.team.id}
                      className={`border-b border-white/5 last:border-0 ${qualifies ? "bg-pitch-500/5" : ""}`}
                    >
                      <td className="py-2.5 pl-4 text-slate-500">{pos}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Flag code={row.team.code} name={row.team.name} size={22} />
                          <span className={qualifies ? "text-slate-100" : "text-slate-300"}>
                            {row.team.name}
                          </span>
                          <ClassifyBadge pos={pos} totalGroups={groups.length} />
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-slate-400">{row.mp}</td>
                      <td className="py-2.5 text-center text-slate-400">{row.w}</td>
                      <td className="py-2.5 text-center text-slate-400">{row.d}</td>
                      <td className="py-2.5 text-center text-slate-400">{row.l}</td>
                      <td className="py-2.5 text-center text-slate-400">
                        {row.gd > 0 ? `+${row.gd}` : row.gd}
                      </td>
                      <td className="py-2.5 pr-4 text-center font-bold text-gold-300">{row.pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Partidos del grupo */}
          <div className="space-y-2">
            <h3 className="display text-sm text-slate-400">Partidos · Grupo {activeGroup}</h3>
            {groupMatches.map((m) => {
              const done = m.status === "finished" && m.homeGoals !== null;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-sm"
                >
                  <div className="w-16 shrink-0 text-center text-xs text-slate-500">
                    {done ? (
                      <span className="text-slate-400">✅</span>
                    ) : m.status === "live" ? (
                      <span className="animate-pulse text-flare-400">🔴</span>
                    ) : (
                      <div>
                        <div className="font-bold text-gold-300">{fmtTime(m.kickoff)}</div>
                        <div>{fmtDate(m.kickoff)}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Flag code={m.home.code} name={m.home.name} size={20} />
                      <span className="text-slate-200">{m.home.name}</span>
                    </div>
                    <span className="font-bold text-slate-300">
                      {done ? `${m.homeGoals} - ${m.awayGoals}` : "vs"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200">{m.away.name}</span>
                      <Flag code={m.away.code} name={m.away.name} size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
