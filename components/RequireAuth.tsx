"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";

/** Protege rutas: redirige a /login si no hay sesion. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="display animate-pulse text-xl text-gold-400">⚽ Cargando…</div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
