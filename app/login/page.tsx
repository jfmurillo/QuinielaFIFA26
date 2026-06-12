"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthShell, ConfigWarning, translateError } from "@/components/AuthShell";

export default function LoginPage() {
  const { login, user, loading, configured } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/pools");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/pools");
    } catch (err) {
      setError(translateError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Bienvenido de vuelta" subtitle="Inicia sesión para seguir prediciendo.">
      {!configured && <ConfigWarning />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">Correo</label>
          <input
            type="email"
            className="input"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">Contraseña</label>
          <input
            type="password"
            className="input"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="rounded-lg bg-flare-600/15 px-3 py-2 text-sm text-flare-400">{error}</p>}

        <button type="submit" disabled={submitting || !configured} className="btn-primary w-full py-3">
          {submitting ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-gold-400 hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
