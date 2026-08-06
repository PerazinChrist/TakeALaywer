/**
 * POST /api/reponses/{id}/utile — « cette réponse m'a été utile ».
 *
 * C'est le signal principal de l'espace communautaire : il fait remonter les
 * réponses qui aident réellement, indépendamment de qui les a écrites.
 */

import { NextResponse } from "next/server";
import { relayCommunity } from "@/lib/api/community-relay";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ message: "Réponse introuvable.", errors: {} }, { status: 404 });
  }

  return relayCommunity(`/replies/${id}/helpful`, request, "optional");
}
