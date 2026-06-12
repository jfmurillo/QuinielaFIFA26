"use client";

import { useEffect, useState } from "react";
import { Flag } from "./Flag";
import { Countdown } from "./Countdown";
import { isLocked } from "@/lib/lock";
import { computePoints, scoreKind } from "@/lib/scoring";
import type { Match, Prediction } from "@/lib/types";

function fmtKickoff(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stepper({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2" aria-label={label}>
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-8 w-8 rounded-lg border border-white/15 bg-white/5 text-lg font-bold leading-none disabled:opacity-30 hover:bg-white/10"
      >
        −
      </button>
      <span className="display w-8 text-center text-2xl text-gold-300">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= 20}
        onClick={() => onChange(Math.min(20, value + 1))}
        className="h-8 w-8 rounded-lg border border-white/15 bg-white/5 text-lg font-bold leading-none disabled:opacity-30 hover:bg-white/10"
      >
        +
      </button>
    </div>
  );
}

export function MatchCard({
  match,
  prediction,
  onSave,
}: {
  match: Match;
  prediction: Prediction | null;
  onSave: (home: number, away: number) => Promise<void>;
}) {
  const [home, setHome] = useState(prediction?.homeGoals ?? 0);
  const [away, setAway] = useState(prediction?.awayGoals ?? 0);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (prediction) {
      setHome(prediction.homeGoals);
      setAway(prediction.awayGoals);
    }
  }, [prediction]);

  const locked = isLocked(match);
  const finished = match.status === "finished" && match.homeGoals !== null && match.awayGoals !== null;
  const dirty =
    !prediction || prediction.homeGoals !== home || prediction.awayGoals !== away;

  let earnedPoints: number | null = null;
  let kind: "exact" | "outcome" | "miss" | null = null;
  if (finished && prediction) {
    const args = {
      predHome: prediction.homeGoals,
      predAway: prediction.awayGoals,
      realHome: match.homeGoals as number,
      realAway: match.awayGoals as number,
    };
    earnedPoints = computePoints(args);
    kind = scoreKind(args);
  }

  async function handleSave() {
    if (locked || saving) return;
    setSaving(true);
    try {
      await onSave(home, away);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card animate-fade-up p-4">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span className="truncate">
          {match.group ? `Grupo ${match.group} · ` : ""}
          {fmtKickoff(match.kickoff)}
        </span>
        {match.status === "live" ? (
          <span className="pill animate-pulse bg-flare-600/25 text-flare-400">🔴 En vivo</span>
        ) : finished ? (
          <span className="pill bg-white/10 text-slate-300">Final</span>
        ) : (
          <Countdown kickoff={match.kickoff} />
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Local */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Flag code={match.home.code} name={match.home.name} size={40} />
          <span className="text-sm font-semibold">{match.home.name}</span>
        </div>

        {/* Marcador / prediccion */}
        <div className="flex flex-col items-center gap-2">
          {finished ? (
            <div className="display text-3xl text-slate-100">
              {match.homeGoals}
              <span className="mx-1 text-slate-500">-</span>
              {match.awayGoals}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Stepper value={home} onChange={setHome} disabled={locked} label="Goles local" />
              <span className="text-slate-500">:</span>
              <Stepper value={away} onChange={setAway} disabled={locked} label="Goles visitante" />
            </div>
          )}
          {match.status === "live" && (
            <span className="text-xs text-slate-400">Marcador en vivo</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Flag code={match.away.code} name={match.away.name} size={40} />
          <span className="text-sm font-semibold">{match.away.name}</span>
        </div>
      </div>

      {/* Tu prediccion + accion */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <PredictionSummary
          prediction={prediction}
          finished={finished}
          earnedPoints={earnedPoints}
          kind={kind}
        />

        {!finished && !locked && (
          <button
            onClick={handleSave}
            disabled={saving || (!dirty && !!prediction)}
            className="btn-primary px-4 py-2 text-sm"
          >
            {saving ? "Guardando…" : savedFlash ? "✅ Guardada" : prediction ? "Actualizar" : "Predecir"}
          </button>
        )}
      </div>
    </div>
  );
}

function PredictionSummary({
  prediction,
  finished,
  earnedPoints,
  kind,
}: {
  prediction: Prediction | null;
  finished: boolean;
  earnedPoints: number | null;
  kind: "exact" | "outcome" | "miss" | null;
}) {
  if (!prediction) {
    return (
      <span className="text-xs text-slate-500">
        {finished ? "No predijiste este partido" : "Aun no has predicho"}
      </span>
    );
  }

  const tag =
    kind === "exact"
      ? { label: "🎯 Marcador exacto", cls: "bg-gold-500/20 text-gold-300" }
      : kind === "outcome"
      ? { label: "✅ Ganador acertado", cls: "bg-pitch-500/20 text-pitch-400" }
      : kind === "miss"
      ? { label: "❌ Sin acierto", cls: "bg-flare-600/15 text-flare-400" }
      : null;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span>
        Tu predicción:{" "}
        <span className="font-bold text-slate-200">
          {prediction.homeGoals}-{prediction.awayGoals}
        </span>
      </span>
      {finished && tag && earnedPoints !== null && (
        <span className={`pill animate-score-pop ${tag.cls}`}>
          {tag.label} · +{earnedPoints}
        </span>
      )}
    </div>
  );
}
