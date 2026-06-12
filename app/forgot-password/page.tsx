"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthShell, translateError } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(translateError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un enlace para restablecer tu contraseña.">
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="rounded-lg bg-pitch-700 px-4 py-3 text-sm text-slate-200">
            Revisa tu bandeja de entrada. Si el correo existe, recibirás el enlace en unos segundos.
          </p>
          <Link href="/login" className="btn-primary inline-block w-full py-3">
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
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

          {error && (
            <p className="rounded-lg bg-flare-600/15 px-3 py-2 text-sm text-flare-400">{error}</p>
          )}

          <button type="submit" disabled={submitting || !configured} className="btn-primary w-full py-3">
            {submitting ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="font-semibold text-gold-400 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthShell>
  );
}
