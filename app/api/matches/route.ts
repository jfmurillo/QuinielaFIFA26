import { NextResponse } from "next/server";
import { fetchAllMatches } from "@/lib/worldcup/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fuente de lectura de partidos para el cliente. Consulta la World Cup API
// (o los fixtures de respaldo) en el servidor. El cliente hace polling para
// mantener resultados y estados al dia.
export async function GET() {
  const matches = await fetchAllMatches();
  return NextResponse.json(
    { matches, fetchedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
