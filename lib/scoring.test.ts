import { describe, expect, it } from "vitest";
import { computePoints, outcomeOf, scoreKind } from "./scoring";
import { isLocked, lockTime, msUntilLock } from "./lock";

describe("computePoints", () => {
  it("da 5 puntos por marcador exacto", () => {
    expect(computePoints({ predHome: 2, predAway: 1, realHome: 2, realAway: 1 })).toBe(5);
    expect(computePoints({ predHome: 0, predAway: 0, realHome: 0, realAway: 0 })).toBe(5);
  });

  it("da 3 puntos por acertar el ganador sin marcador exacto", () => {
    expect(computePoints({ predHome: 2, predAway: 0, realHome: 3, realAway: 1 })).toBe(3);
    expect(computePoints({ predHome: 0, predAway: 1, realHome: 0, realAway: 2 })).toBe(3);
  });

  it("da 3 puntos por acertar empate sin marcador exacto", () => {
    expect(computePoints({ predHome: 1, predAway: 1, realHome: 2, realAway: 2 })).toBe(3);
  });

  it("da 0 puntos cuando no acierta el resultado", () => {
    expect(computePoints({ predHome: 2, predAway: 1, realHome: 0, realAway: 3 })).toBe(0);
    expect(computePoints({ predHome: 1, predAway: 1, realHome: 1, realAway: 0 })).toBe(0);
  });
});

describe("outcomeOf", () => {
  it("clasifica home/away/draw", () => {
    expect(outcomeOf(2, 1)).toBe("home");
    expect(outcomeOf(0, 2)).toBe("away");
    expect(outcomeOf(1, 1)).toBe("draw");
  });
});

describe("scoreKind", () => {
  it("etiqueta el tipo de acierto", () => {
    expect(scoreKind({ predHome: 1, predAway: 1, realHome: 1, realAway: 1 })).toBe("exact");
    expect(scoreKind({ predHome: 2, predAway: 0, realHome: 1, realAway: 0 })).toBe("outcome");
    expect(scoreKind({ predHome: 0, predAway: 2, realHome: 2, realAway: 0 })).toBe("miss");
  });
});

describe("lock 30 minutos antes", () => {
  const kickoff = "2026-06-11T20:00:00.000Z";

  it("cierra exactamente 30 minutos antes del kickoff", () => {
    expect(lockTime(kickoff)).toBe(new Date("2026-06-11T19:30:00.000Z").getTime());
  });

  it("no esta cerrada 31 minutos antes", () => {
    const now = new Date("2026-06-11T19:29:00.000Z").getTime();
    expect(isLocked({ kickoff, status: "scheduled" }, now)).toBe(false);
  });

  it("esta cerrada 29 minutos antes", () => {
    const now = new Date("2026-06-11T19:31:00.000Z").getTime();
    expect(isLocked({ kickoff, status: "scheduled" }, now)).toBe(true);
  });

  it("siempre esta cerrada si el partido esta en vivo o terminado", () => {
    const now = new Date("2026-01-01T00:00:00.000Z").getTime();
    expect(isLocked({ kickoff, status: "live" }, now)).toBe(true);
    expect(isLocked({ kickoff, status: "finished" }, now)).toBe(true);
  });

  it("msUntilLock nunca es negativo", () => {
    const now = new Date("2026-06-11T23:00:00.000Z").getTime();
    expect(msUntilLock(kickoff, now)).toBe(0);
  });
});
