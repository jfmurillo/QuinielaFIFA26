"use client";

import { useEffect, useState } from "react";
import { formatCountdown, msUntilLock } from "@/lib/lock";

/** Cuenta regresiva en vivo hasta el cierre de predicciones (30 min antes). */
export function Countdown({ kickoff }: { kickoff: string }) {
  const [ms, setMs] = useState(() => msUntilLock(kickoff));

  useEffect(() => {
    setMs(msUntilLock(kickoff));
    const id = setInterval(() => setMs(msUntilLock(kickoff)), 1000);
    return () => clearInterval(id);
  }, [kickoff]);

  const closed = ms <= 0;
  return (
    <span
      className={`pill ${
        closed ? "bg-flare-600/20 text-flare-400" : "bg-pitch-500/20 text-pitch-400"
      }`}
    >
      {closed ? "🔒 Cerrada" : `⏳ Cierra en ${formatCountdown(ms)}`}
    </span>
  );
}
