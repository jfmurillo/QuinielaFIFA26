"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { createPool, deletePool, joinPoolByCode, leavePool, listenUserPools } from "@/lib/firebase/db";
import type { Pool } from "@/lib/types";

function PoolsInner() {
  const { profile } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);

  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const unsub = listenUserPools(profile.uid, (p) => {
      setPools(p.sort((a, b) => b.createdAt - a.createdAt));
      setLoadingPools(false);
    });
    return () => unsub();
  }, [profile]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || newName.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const pool = await createPool(newName, profile);
      setNewName("");
      setNotice(`Quiniela creada. Código de invitación: ${pool.code}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave(poolId: string) {
    if (!profile) return;
    if (!confirm("¿Seguro que quieres salir de esta quiniela?")) return;
    setBusy(true);
    setError(null);
    try {
      await leavePool(poolId, profile.uid);
      setNotice("Saliste de la quiniela.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(poolId: string) {
    if (!profile) return;
    if (!confirm("¿Eliminar esta quiniela? Se borrarán todas las predicciones. Esta acción no se puede deshacer.")) return;
    setBusy(true);
    setError(null);
    try {
      await deletePool(poolId, profile.uid);
      setNotice("Quiniela eliminada.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || joinCode.trim().length < 4) {
      setError("Ingresa un código válido.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinPoolByCode(joinCode, profile.uid);
      setJoinCode("");
      setNotice("¡Te uniste a la quiniela!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6">
          <h1 className="display text-3xl text-slate-50">
            Hola, {profile?.nickname} {profile?.avatar}
          </h1>
          <p className="text-slate-400">Crea una quiniela o únete con un código para empezar.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <form onSubmit={handleCreate} className="card p-5">
            <h2 className="display text-lg text-gold-300">Crear quiniela</h2>
            <p className="mb-3 text-sm text-slate-400">Tú serás el organizador del grupo.</p>
            <input
              className="input mb-3"
              placeholder="Ej. La Quiniela de la Banda"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
              Crear
            </button>
          </form>

          <form onSubmit={handleJoin} className="card p-5">
            <h2 className="display text-lg text-pitch-400">Unirme con código</h2>
            <p className="mb-3 text-sm text-slate-400">Pide el código al organizador.</p>
            <input
              className="input mb-3 uppercase tracking-widest"
              placeholder="Ej. AB12CD"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button type="submit" disabled={busy} className="btn-pitch w-full py-2.5">
              Unirme
            </button>
          </form>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-flare-600/15 px-3 py-2 text-sm text-flare-400">{error}</p>
        )}
        {notice && (
          <p className="mt-4 rounded-lg bg-pitch-500/15 px-3 py-2 text-sm text-pitch-400">{notice}</p>
        )}

        <h2 className="mb-3 mt-8 display text-xl text-slate-200">Mis quinielas</h2>
        {loadingPools ? (
          <p className="text-slate-400">Cargando…</p>
        ) : pools.length === 0 ? (
          <p className="card p-6 text-center text-slate-400">
            Aún no perteneces a ninguna quiniela. ¡Crea una arriba!
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pools.map((pool) => {
              const isOwner = pool.ownerUid === profile?.uid;
              return (
                <div key={pool.id} className="card p-5">
                  <Link href={`/pools/${pool.id}`} className="group block">
                    <div className="flex items-center justify-between">
                      <h3 className="display text-lg text-slate-50">{pool.name}</h3>
                      <span className="text-slate-500 transition group-hover:translate-x-1">→</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
                      <span className="pill bg-white/5">👥 {pool.memberUids.length}</span>
                      <span className="pill bg-gold-400/10 text-gold-300">Código {pool.code}</span>
                    </div>
                  </Link>
                  <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
                    {isOwner ? (
                      <button
                        onClick={() => handleDelete(pool.id)}
                        disabled={busy}
                        className="text-xs text-flare-400 hover:underline disabled:opacity-50"
                      >
                        Eliminar quiniela
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLeave(pool.id)}
                        disabled={busy}
                        className="text-xs text-slate-500 hover:text-slate-300 hover:underline disabled:opacity-50"
                      >
                        Salir de la quiniela
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default function PoolsPage() {
  return (
    <RequireAuth>
      <PoolsInner />
    </RequireAuth>
  );
}
