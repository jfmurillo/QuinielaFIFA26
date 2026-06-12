# 🏆 Quiniela Mundialista 2026

Quiniela del Mundial 2026 para jugar entre amigos. Predice los marcadores, gana puntos y domina el ranking. Las predicciones se cierran automáticamente **30 minutos antes** de cada partido.

Construida con **Next.js + TypeScript + Tailwind**, autenticación y datos con **Firebase** (Auth + Firestore) y partidos del Mundial vía [worldcupapi.com](https://worldcupapi.com/) (con fixtures de respaldo para jugar de inmediato).

## Reglas de puntuación

| Acierto | Puntos |
| --- | --- |
| 🎯 Marcador exacto (goles y ganador) | **5** |
| ✅ Ganador o empate (sin marcador exacto) | **3** |
| ❌ Nada | **0** |

Desempates en el ranking: más marcadores exactos → más ganadores acertados → registro más antiguo.

## Características

- Registro e inicio de sesión con Firebase Auth (correo + contraseña).
- Quinielas privadas con **código de invitación** para tus amigos.
- Partidos por fase: **Grupos, 16vos, Octavos, Cuartos, Semis, Tercer lugar y Final**.
- Predicción de marcador con cierre automático 30 min antes (cuenta regresiva en vivo).
- Resultados y ranking que se actualizan solos (polling a la API).
- Diseño temático del Mundial: estadio nocturno, banderas, marcadores y medallas.

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de entorno y complétalo:

   ```bash
   cp .env.local.example .env.local
   ```

   - **Firebase** (obligatorio para auth/ranking): crea un proyecto en
     [Firebase Console](https://console.firebase.google.com/), habilita
     **Authentication > Email/Password** y **Firestore**, y copia las
     variables `NEXT_PUBLIC_FIREBASE_*` desde la config del SDK web.
   - **World Cup API** (opcional): agrega `WORLDCUP_API_KEY` para usar datos
     reales. Sin esta clave, la app usa los fixtures de `lib/worldcup/seed.ts`.

3. Publica las reglas de Firestore (`firestore.rules`) en tu proyecto.

4. Arranca en desarrollo:

   ```bash
   npm run dev
   ```

5. Corre las pruebas de puntuación y cierre:

   ```bash
   npm test
   ```

## Estructura

```
app/
  page.tsx                  Landing
  login / register          Autenticación
  pools/                    Lista, crear y unirse a quinielas
  pools/[poolId]/           Partidos por fase + predicciones
  pools/[poolId]/ranking/   Tabla de posiciones en vivo
  api/matches/              Lectura de partidos (World Cup API o seed)
  api/cron/sync/            Sync opcional a Firestore (Vercel Cron)
components/                 UI (MatchCard, Leaderboard, PhaseTabs, etc.)
lib/
  scoring.ts                Reglas 5/3/0 (con pruebas)
  lock.ts                   Cierre 30 min antes (con pruebas)
  leaderboard.ts            Construcción del ranking
  firebase/                 Cliente y Admin SDK
  worldcup/                 Cliente de la API + fixtures de respaldo
firestore.rules             Reglas de seguridad
vercel.json                 Cron de sincronización
```

## Despliegue (Vercel)

1. Importa el repo en Vercel.
2. Agrega las variables de entorno (las mismas de `.env.local`).
3. El cron de `vercel.json` llamará a `/api/cron/sync` cada 5 minutos
   (requiere `FIREBASE_SERVICE_ACCOUNT` y `CRON_SECRET` si quieres persistir
   partidos en Firestore; es opcional).

## Ideas para seguir mejorando

- Predicción del campeón antes del arranque (bonus).
- Retos por jornada y logros/insignias.
- Notificaciones cuando falte poco para el cierre.
- Modo "pantalla grande" del ranking para la reunión con amigos.
