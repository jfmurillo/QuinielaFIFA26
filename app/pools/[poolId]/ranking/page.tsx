"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { useMatches } from "@/components/useMatches";
import { Leaderboard } from "@/components/Leaderboard";
import { getPool, getUserProfile, listenPoolPredictions } from "@/lib/firebase/db";
import { buildLeaderboard } from "@/lib/leaderboard";
import type { Pool, Prediction, UserProfile } from "@/lib/types";

function RankingInner() {
  const { poolId } = useParams<{ poolId: string }>();
  const { profile } = useAuth();
  const { matches } = useMatches();

  const [pool, setPool] = useState<Pool | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [preds, setPreds] = useState<Prediction[]>([]);

  useEffect(() => {
    if (poolId) getPool(poolId).then(setPool);
  }, [poolId]);

  useEffect(() => {
    if (!pool) return;
    Promise.all(pool.memberUids.map((uid) => getUserProfile(uid))).then((profiles) => {
      setMembers(profiles.filter((p): p is UserProfile => p !== null));
    });
  }, [pool]);

  useEffect(() => {
    if (!poolId) return;
    const unsub = listenPoolPredictions(poolId, setPreds);
    return () => unsub();
  }, [poolId]);

  const rows = useMemo(
    () => buildLeaderboard({ members, predictions: preds, matches }),
    [members, preds, matches]
  );

  const finishedCount = matches.filter((m) => m.status === "finished").length;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link href={`/pools/${poolId}`} className="text-sm text-slate-400 hover:text-slate-200">
          ← {pool?.name ?? "Quiniela"}
        </Link>

        <div className="mb-6 mt-3 flex items-end justify-between">
          <div>
            <h1 className="display text-3xl text-slate-50">🏆 Tabla de posiciones</h1>
            <p className="text-slate-400">
              {finishedCount} partidos jugados · se actualiza en vivo
            </p>
          </div>
        </div>

        <Leaderboard rows={rows} highlightUid={profile?.uid} />

        <div className="mt-6 card p-4 text-sm text-slate-400">
          <p className="mb-1 font-semibold text-slate-200">Cómo se puntúa</p>
          <p>🎯 5 pts marcador exacto · ✅ 3 pts ganador acertado · ❌ 0 pts si no atinas.</p>
          <p className="mt-1 text-xs">
            Desempates: más exactos → más ganadores → quién se registró primero.
          </p>
        </div>
      </main>
    </>
  );
}

export default function RankingPage() {
  return (
    <RequireAuth>
      <RankingInner />
    </RequireAuth>
  );
}
