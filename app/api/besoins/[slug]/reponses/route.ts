/**
 * POST /api/besoins/{slug}/reponses — répondre dans l'espace communautaire.
 *
 * Ouvert aux deux populations : un citoyen partage son expérience, un avocat
 * apporte une réponse de droit — et c'est le backend qui décide lequel des deux
 * porte le badge « Avocat », d'après le statut de vérification de son compte.
 */

import { NextResponse } from "next/server";
import { relayCommunity } from "@/lib/api/community-relay";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Le slug vient de l'URL : le restreindre à la forme qu'accepte le plugin
  // évite qu'un segment fabriqué n'atteigne une autre route.
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ message: "Problème introuvable.", errors: {} }, { status: 404 });
  }

  return relayCommunity(`/needs/${slug}/replies`, request, "any");
}
