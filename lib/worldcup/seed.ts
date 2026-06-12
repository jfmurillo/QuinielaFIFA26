import type { Match, Phase, Team } from "@/lib/types";

// Fixtures de respaldo: se usan cuando WORLDCUP_API_KEY no esta configurada,
// para que la app sea totalmente funcional en local con amigos.
// Las fechas se generan relativas a "ahora" para que siempre haya partidos
// terminados, en ventana de cierre y abiertos para predecir.

const T: Record<string, Team> = {
  MEX: { id: "MEX", name: "Mexico", code: "mx" },
  USA: { id: "USA", name: "Estados Unidos", code: "us" },
  CAN: { id: "CAN", name: "Canada", code: "ca" },
  ARG: { id: "ARG", name: "Argentina", code: "ar" },
  BRA: { id: "BRA", name: "Brasil", code: "br" },
  FRA: { id: "FRA", name: "Francia", code: "fr" },
  ESP: { id: "ESP", name: "Espana", code: "es" },
  ENG: { id: "ENG", name: "Inglaterra", code: "gb-eng" },
  GER: { id: "GER", name: "Alemania", code: "de" },
  POR: { id: "POR", name: "Portugal", code: "pt" },
  NED: { id: "NED", name: "Paises Bajos", code: "nl" },
  CRO: { id: "CRO", name: "Croacia", code: "hr" },
  JPN: { id: "JPN", name: "Japon", code: "jp" },
  KOR: { id: "KOR", name: "Corea del Sur", code: "kr" },
  MAR: { id: "MAR", name: "Marruecos", code: "ma" },
  URU: { id: "URU", name: "Uruguay", code: "uy" },
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function iso(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

interface SeedSpec {
  id: string;
  phase: Phase;
  group?: string;
  home: Team;
  away: Team;
  offsetMs: number;
  status: Match["status"];
  homeGoals?: number;
  awayGoals?: number;
  venue?: string;
}

const SPECS: SeedSpec[] = [
  // --- Terminados (alimentan ranking) ---
  { id: "m-g-01", phase: "groups", group: "A", home: T.MEX, away: T.KOR, offsetMs: -3 * DAY, status: "finished", homeGoals: 2, awayGoals: 1, venue: "Estadio Azteca" },
  { id: "m-g-02", phase: "groups", group: "B", home: T.ARG, away: T.CRO, offsetMs: -2 * DAY, status: "finished", homeGoals: 3, awayGoals: 0, venue: "MetLife Stadium" },
  { id: "m-g-03", phase: "groups", group: "C", home: T.FRA, away: T.JPN, offsetMs: -2 * DAY + 3 * HOUR, status: "finished", homeGoals: 1, awayGoals: 1, venue: "SoFi Stadium" },
  { id: "m-g-04", phase: "groups", group: "D", home: T.ESP, away: T.MAR, offsetMs: -1 * DAY, status: "finished", homeGoals: 2, awayGoals: 2, venue: "AT&T Stadium" },

  // --- En vivo / por iniciar dentro de la ventana de cierre ---
  { id: "m-g-05", phase: "groups", group: "E", home: T.BRA, away: T.URU, offsetMs: 10 * 60 * 1000, status: "scheduled", venue: "Hard Rock Stadium" },
  { id: "m-g-06", phase: "groups", group: "F", home: T.ENG, away: T.USA, offsetMs: -20 * 60 * 1000, status: "live", homeGoals: 0, awayGoals: 0, venue: "Lincoln Financial Field" },

  // --- Abiertos para predecir ---
  { id: "m-g-07", phase: "groups", group: "G", home: T.GER, away: T.CAN, offsetMs: 1 * DAY, status: "scheduled", venue: "BMO Field" },
  { id: "m-g-08", phase: "groups", group: "H", home: T.POR, away: T.NED, offsetMs: 1 * DAY + 4 * HOUR, status: "scheduled", venue: "Levi's Stadium" },
  { id: "m-g-09", phase: "groups", group: "A", home: T.MEX, away: T.USA, offsetMs: 2 * DAY, status: "scheduled", venue: "Estadio Akron" },
  { id: "m-g-10", phase: "groups", group: "B", home: T.ARG, away: T.BRA, offsetMs: 3 * DAY, status: "scheduled", venue: "MetLife Stadium" },

  // --- Eliminatorias (placeholders, abiertos) ---
  { id: "m-r32-01", phase: "round32", home: T.MEX, away: T.JPN, offsetMs: 6 * DAY, status: "scheduled", venue: "Estadio Azteca" },
  { id: "m-r32-02", phase: "round32", home: T.FRA, away: T.MAR, offsetMs: 6 * DAY + 4 * HOUR, status: "scheduled", venue: "SoFi Stadium" },
  { id: "m-r16-01", phase: "round16", home: T.ARG, away: T.ESP, offsetMs: 9 * DAY, status: "scheduled", venue: "MetLife Stadium" },
  { id: "m-r16-02", phase: "round16", home: T.BRA, away: T.POR, offsetMs: 9 * DAY + 4 * HOUR, status: "scheduled", venue: "Hard Rock Stadium" },
  { id: "m-qf-01", phase: "quarter", home: T.FRA, away: T.ENG, offsetMs: 12 * DAY, status: "scheduled", venue: "AT&T Stadium" },
  { id: "m-qf-02", phase: "quarter", home: T.ARG, away: T.GER, offsetMs: 12 * DAY + 4 * HOUR, status: "scheduled", venue: "MetLife Stadium" },
  { id: "m-sf-01", phase: "semi", home: T.FRA, away: T.ARG, offsetMs: 15 * DAY, status: "scheduled", venue: "MetLife Stadium" },
  { id: "m-sf-02", phase: "semi", home: T.BRA, away: T.ESP, offsetMs: 15 * DAY + 4 * HOUR, status: "scheduled", venue: "SoFi Stadium" },
  { id: "m-3p-01", phase: "third", home: T.BRA, away: T.ENG, offsetMs: 18 * DAY, status: "scheduled", venue: "Hard Rock Stadium" },
  { id: "m-final", phase: "final", home: T.FRA, away: T.ARG, offsetMs: 19 * DAY, status: "scheduled", venue: "MetLife Stadium" },
];

export function getSeedMatches(): Match[] {
  return SPECS.map((s) => ({
    id: s.id,
    phase: s.phase,
    group: s.group ?? null,
    home: s.home,
    away: s.away,
    kickoff: iso(s.offsetMs),
    venue: s.venue ?? null,
    status: s.status,
    homeGoals: s.homeGoals ?? null,
    awayGoals: s.awayGoals ?? null,
    updatedAt: new Date().toISOString(),
  }));
}
