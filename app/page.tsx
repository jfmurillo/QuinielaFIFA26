"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

const FEATURES = [
  { icon: "🎯", title: "5 puntos", desc: "por marcador exacto (goles y ganador)." },
  { icon: "✅", title: "3 puntos", desc: "por atinarle al ganador o al empate." },
  { icon: "⏳", title: "Cierre 30 min", desc: "antes de cada partido. Sin trampas." },
  { icon: "🏆", title: "Ranking en vivo", desc: "que se actualiza con cada resultado." },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/pools");
  }, [user, loading, router]);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
      <div className="absolute inset-0 -z-10 bg-stadium-grid bg-[size:38px_38px] opacity-30" />

      <header className="flex items-center justify-between py-5">
        <span className="display text-xl text-gold-400">
          🏆 Quiniela <span className="text-slate-100">Mundial</span>
        </span>
        <Link href="/login" className="btn-ghost px-4 py-2 text-sm">
          Iniciar sesión
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <span className="pill mb-5 bg-pitch-500/15 text-pitch-400">
          ⚽ Mundial 2026 · Edición entre amigos
        </span>
        <h1 className="display text-5xl leading-[0.95] text-slate-50 sm:text-7xl">
          Predice. Compite.
          <br />
          <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-flare-400 bg-clip-text text-transparent">
            Presume el ranking.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-lg text-slate-300">
          La quiniela del Mundial 2026 para echar relajo con tus amigos. Arma tu grupo privado,
          predice cada marcador y mira quién manda en la tabla, partido a partido.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            Crear mi cuenta
          </Link>
          <Link href="/login" className="btn-ghost px-6 py-3 text-base">
            Ya tengo cuenta
          </Link>
        </div>

        <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-4 text-left">
              <div className="text-2xl">{f.icon}</div>
              <p className="mt-2 display text-lg text-gold-300">{f.title}</p>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-slate-500">
        Hecho para la banda · Datos del Mundial 2026 vía worldcupapi.com
      </footer>
    </main>
  );
}
