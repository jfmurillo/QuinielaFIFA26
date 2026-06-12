"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { useMatches } from "@/components/useMatches";
import { MatchCard } from "@/components/MatchCard";
import { PhaseTabs, type ViewTab } from "@/components/PhaseTabs";
import { CalendarView } from "@/components/CalendarView";
import { GroupsView } from "@/components/GroupsView";
import { getPool, listenMyPredictions, savePrediction } from "@/lib/firebase/db";
import { computePoints } from "@/lib/scoring";
import { isLocked } from "@/lib/lock";
import {
  PHASE_LABELS,
  PHASE_ORDER,
  type Phase,
  type Pool,
  type Prediction,
} from "@/lib/types";


function PoolInner() {
  const { poolId } = useParams<{ poolId: string }>();
  const { profile } = useAuth();
  const { matches, loading } = useMatches();

  const [pool, setPool] = useState<Pool | null>(null);
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [view, setView] = useState<ViewTab>("groups");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (poolId) getPool(poolId).then(setPool);
  }, [poolId]);

  useEffect(() => {
    if (!poolId || !profile) return;
    const unsub = listenMyPredictions(poolId, profile.uid, setPreds);
    return () => unsub();
  }, [poolId, profile]);

  const predByMatch = useMemo(() => {
    const m = new Map<string, Prediction>();
    for (const p of preds) m.set(p.matchId, p);
    return m;
  }, [preds]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(PHASE_ORDER.map((p) => [p, 0])) as Record<Phase, number>;
    for (const m of matches) c[m.phase] = (c[m.phase] ?? 0) + 1;
    return c;
  }, [matches]);

  const phase = (view !== "calendar" && view !== "groups" ? view : null) as Phase | null;

  // Selecciona automaticamente la primera fase con partidos.
  useEffect(() => {
    if (view !== "calendar" && view !== "groups" && counts[view as Phase] === 0) {
      const first = PHASE_ORDER.find((p) => counts[p] > 0);
      if (first) setView(first);
    }
  }, [counts, view]);

  const myPoints = useMemo(() => {
    let total = 0;
    for (const p of preds) {
      const match = matches.find((m) => m.id === p.matchId);
      if (match?.status === "finished" && match.homeGoals !== null && match.awayGoals !== null) {
        total += computePoints({
          predHome: p.homeGoals,
          predAway: p.awayGoals,
          realHome: match.homeGoals,
          realAway: match.awayGoals,
        });
      }
    }
    return total;
  }, [preds, matches]);

  const phaseMatches = phase ? matches.filter((m) => m.phase === phase) : [];
  const openCount = matches.filter((m) => !isLocked(m)).length;

  async function handleSave(matchId: string, home: number, away: number) {
    if (!poolId || !profile) return;
    await savePrediction(poolId, profile.uid, matchId, home, away);
  }

  async function copyCode() {
    if (!pool) return;
    await navigator.clipboard.writeText(pool.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link href="/pools" className="text-sm text-slate-400 hover:text-slate-200">
          ← Mis quinielas
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-3xl text-slate-50">{pool?.name ?? "Quiniela"}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <button onClick={copyCode} className="pill bg-gold-400/10 text-gold-300 hover:bg-gold-400/20">
                {copied ? "✅ Copiado" : `📋 Código ${pool?.code ?? "…"}`}
              </button>
              <span className="pill bg-white/5 text-slate-300">👥 {pool?.memberUids.length ?? 0} jugadores</span>
              <span className="pill bg-pitch-500/15 text-pitch-400">⚡ {openCount} abiertos</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="card px-4 py-2 text-center">
              <p className="text-xs text-slate-400">Tus puntos</p>
              <p className="display text-2xl text-gold-300">{myPoints}</p>
            </div>
            <Link href={`/pools/${poolId}/ranking`} className="btn-primary px-5 py-3">
              🏆 Ranking
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <PhaseTabs active={view} counts={counts} onChange={setView} />
        </div>

        {loading ? (
          <p className="mt-5 text-slate-400">Cargando partidos…</p>
        ) : view === "calendar" ? (
          <div className="mt-5">
            <CalendarView matches={matches} predByMatch={predByMatch} />
          </div>
        ) : view === "groups" ? (
          <div className="mt-5">
            <GroupsView matches={matches} />
          </div>
        ) : (
          <>
            <h2 className="mb-3 mt-5 display text-xl text-slate-200">{phase ? PHASE_LABELS[phase] : ""}</h2>
            {phaseMatches.length === 0 ? (
              <p className="card p-6 text-center text-slate-400">No hay partidos en esta fase todavía.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {phaseMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predByMatch.get(match.id) ?? null}
                    onSave={(h, a) => handleSave(match.id, h, a)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default function PoolPage() {
  return (
    <RequireAuth>
      <PoolInner />
    </RequireAuth>
  );
}
