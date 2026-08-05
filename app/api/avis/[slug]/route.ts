/**
 * POST /api/avis/{slug} — dépôt d'un avis sur la vitrine d'un praticien.
 *
 * Route publique, distincte de `app/api/avocats/` : elle ne demande aucune
 * session, seulement la clé d'API, que le navigateur ne doit jamais voir. C'est
 * précisément pourquoi elle existe — sans ce relais, il faudrait exposer
 * `TAL_API_KEY` au client, et l'annuaire se remplirait de faux avis en une nuit.
 *
 * L'avis créé est « en attente » : il n'apparaît qu'après modération.
 */

import { NextResponse } from "next/server";
import { callWordPress, clientIpFrom } from "@/lib/api/server";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Le slug vient de l'URL : le restreindre à la forme qu'accepte le plugin
  // évite qu'un segment fabriqué n'atteigne une autre route.
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ message: "Vitrine introuvable.", errors: {} }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const result = await callWordPress(`/lawyers/${slug}/reviews`, {
    method: "POST",
    body,
    withKey: true,
    // Sans l'adresse du visiteur, le quota de trois dépôts par heure et par IP
    // s'appliquerait au site entier : le troisième avis de la journée fermerait
    // le formulaire pour tout le monde.
    clientIp: clientIpFrom(request),
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data as object, { status: result.status });
}
