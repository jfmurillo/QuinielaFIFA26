"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthShell, ConfigWarning, translateError } from "@/components/AuthShell";

const AVATARS = ["⚽", "🦁", "🐉", "🦅", "🐂", "🦊", "🐺", "🦈", "👑", "🔥", "⭐", "🚀"];

export default function RegisterPage() {
  const { register, user, loading, configured } = useAuth();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/pools");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nickname.trim().length < 2) return setError("Tu apodo debe tener al menos 2 caracteres.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setSubmitting(true);
    try {
      await register(email.trim(), password, nickname, avatar);
      router.replace("/pools");
    } catch (err) {
      setError(translateError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Únete a la quiniela" subtitle="Crea tu cuenta y arma tu grupo de amigos.">
      {!configured && <ConfigWarning />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">Apodo</label>
          <input
            className="input"
            placeholder="El Crack del grupo"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`h-10 w-10 rounded-xl text-xl transition ${
                  avatar === a
                    ? "bg-gold-400/20 ring-2 ring-gold-400"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="rounded-lg bg-flare-600/15 px-3 py-2 text-sm text-flare-400">{error}</p>}

        <button type="submit" disabled={submitting || !configured} className="btn-primary w-full py-3">
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-gold-400 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
