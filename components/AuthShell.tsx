"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-center display text-2xl text-gold-400">
        🏆 Quiniela <span className="text-slate-100">Mundial</span>
      </Link>
      <div className="card p-6 sm:p-8">
        <h1 className="display text-2xl text-slate-50">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-400">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}

export function ConfigWarning() {
  return (
    <div className="mb-5 rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-sm text-gold-200">
      Firebase aún no está configurado. Copia <code className="text-gold-300">.env.local.example</code> a{" "}
      <code className="text-gold-300">.env.local</code> y completa las variables{" "}
      <code className="text-gold-300">NEXT_PUBLIC_FIREBASE_*</code> para habilitar el registro.
    </div>
  );
}

export function translateError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/weak-password": "La contraseña es muy débil.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  };
  return map[code] ?? (err as Error)?.message ?? "Ocurrió un error. Intenta de nuevo.";
}
