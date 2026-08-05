/**
 * POST /api/compte/guides/{slug}/deblocage
 *
 * Ajoute un guide à la bibliothèque du citoyen connecté.
 *
 * Le slug est renormalisé avant d'être recomposé dans le chemin appelé : il
 * vient de l'URL, et le relais ne doit jamais laisser un segment arbitraire
 * atteindre l'API du plugin.
 */

import { NextResponse } from "next/server";
import { relayClientJson } from "@/lib/api/citizen-relay";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ message: "Guide inconnu.", errors: {} }, { status: 404 });
  }

  return relayClientJson(`/client/guides/${slug}/unlock`, "POST");
}
