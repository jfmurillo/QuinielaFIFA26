"use client";

import { PHASE_ORDER, PHASE_SHORT, type Phase } from "@/lib/types";

export function PhaseTabs({
  active,
  counts,
  onChange,
}: {
  active: Phase;
  counts: Record<Phase, number>;
  onChange: (p: Phase) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {PHASE_ORDER.map((phase) => {
        const isActive = phase === active;
        const count = counts[phase] ?? 0;
        return (
          <button
            key={phase}
            onClick={() => onChange(phase)}
            disabled={count === 0}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-30 ${
              isActive
                ? "bg-gradient-to-br from-gold-400 to-gold-500 text-night-950 shadow-glow"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {PHASE_SHORT[phase]}
            {count > 0 && (
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-night-950/20" : "bg-white/10"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
