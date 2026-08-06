/**
 * POST /api/besoins/{slug}/utile — « ce problème m'a été utile ».
 *
 * Sans compte aussi : quelqu'un qui trouve son propre cas décrit ici doit
 * pouvoir le signaler sans s'inscrire d'abord. L'unicité du vote est alors
 * assurée par l'empreinte de son adresse, côté plugin.
 */

import { NextResponse } from "next/server";
import { relayCommunity } from "@/lib/api/community-relay";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ message: "Problème introuvable.", errors: {} }, { status: 404 });
  }

  return relayCommunity(`/needs/${slug}/helpful`, request, "optional");
}
