"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-night-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/pools" className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="display text-lg leading-none text-gold-400">
            Quiniela <span className="text-slate-100">Mundial</span>
          </span>
        </Link>

        {profile && (
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 sm:flex">
              <span className="text-xl">{profile.avatar}</span>
              <span className="text-sm font-semibold text-slate-200">{profile.nickname}</span>
            </span>
            <button onClick={handleLogout} className="btn-ghost px-3 py-1.5 text-sm">
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
