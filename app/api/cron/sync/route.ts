import { NextResponse, type NextRequest } from "next/server";
import { fetchAllMatches } from "@/lib/worldcup/client";

export const dynamic = "force-dynamic";

// Endpoint OPCIONAL de sincronizacion (Vercel Cron). Persiste los partidos y
// resultados en Firestore para tener historico/respaldo. No es necesario para
// el flujo principal, que lee partidos en vivo desde /api/matches.
//
// Configurar en vercel.json:
//   { "crons": [{ "path": "/api/cron/sync", "schedule": "*/5 * * * *" }] }
// Protegido por el header Authorization: Bearer ${CRON_SECRET}.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const matches = await fetchAllMatches();

  // Persistencia en Firestore solo si Firebase Admin esta configurado.
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const db = getAdminDb();
      const batch = db.batch();
      for (const m of matches) {
        batch.set(db.collection("matches").doc(m.id), m, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.error("No se pudo persistir en Firestore:", err);
      return NextResponse.json(
        { synced: matches.length, persisted: false, error: String(err) },
        { status: 200 }
      );
    }
    return NextResponse.json({ synced: matches.length, persisted: true });
  }

  return NextResponse.json({ synced: matches.length, persisted: false });
}
