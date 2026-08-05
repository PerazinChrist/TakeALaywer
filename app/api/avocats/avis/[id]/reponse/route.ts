/**
 * POST /api/avocats/avis/{id}/reponse — réponse publique du praticien à un avis.
 *
 * L'identifiant n'est pas concaténé tel quel dans le chemin : il vient de
 * l'URL, donc du navigateur. Le filtrer à un entier interdit qu'un segment
 * fabriqué (« 12/../../auth/register ») n'atteigne une autre route du plugin.
 */

import { NextResponse } from "next/server";
import { relayJson } from "@/lib/api/relay";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ message: "Avis introuvable.", errors: {} }, { status: 404 });
  }

  return relayJson(`/me/reviews/${id}/reply`, "POST", request);
}
