// Tipos de dominio compartidos por cliente y servidor.

export type Phase =
  | "groups"
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "third"
  | "final";

export const PHASE_ORDER: Phase[] = [
  "groups",
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

export const PHASE_LABELS: Record<Phase, string> = {
  groups: "Fase de grupos",
  round32: "16vos",
  round16: "Octavos",
  quarter: "Cuartos",
  semi: "Semifinales",
  third: "Tercer lugar",
  final: "Final",
};

export const PHASE_SHORT: Record<Phase, string> = {
  groups: "Grupos",
  round32: "16vos",
  round16: "8vos",
  quarter: "4tos",
  semi: "Semis",
  third: "3er",
  final: "Final",
};

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Team {
  id: string;
  name: string;
  code: string; // ISO-2/3 para bandera, ej "MX", "AR"
  flag?: string; // url opcional
}

export interface Match {
  id: string;
  phase: Phase;
  group?: string | null; // "A".."L" en fase de grupos
  home: Team;
  away: Team;
  kickoff: string; // ISO datetime UTC
  venue?: string | null;
  status: MatchStatus;
  homeGoals: number | null;
  awayGoals: number | null;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  nickname: string;
  email: string;
  avatar: string; // emoji o url
  createdAt: number;
}

export interface Pool {
  id: string;
  name: string;
  code: string; // codigo de invitacion
  ownerUid: string;
  createdAt: number;
  memberUids: string[];
}

export interface Prediction {
  id: string; // `${uid}_${matchId}`
  poolId: string;
  uid: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  points: number | null; // null = aun no calculado
  updatedAt: number;
}

export interface LeaderboardRow {
  uid: string;
  nickname: string;
  avatar: string;
  points: number;
  exact: number; // marcadores exactos
  outcomes: number; // ganadores acertados (sin exacto)
  predictions: number; // total de predicciones hechas
  position: number;
}

export type Outcome = "home" | "away" | "draw";
