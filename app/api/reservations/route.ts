/**
 * POST /api/reservations — réserver une prestation ou demander un rendez-vous.
 *
 * Le slug du cabinet voyage dans le corps plutôt que dans le chemin : ces deux
 * parcours partent d'endroits très différents du site — une carte de prestation,
 * la page de prise de rendez-vous, le bloc d'actions d'une vitrine — et une
 * route unique évite d'en dupliquer trois.
 *
 * Ouvert aux visiteurs sans compte : demander un rendez-vous est souvent le
 * premier geste de quelqu'un qui découvre la plateforme. Le jeton citoyen, s'il
 * existe, rattache la demande à son espace personnel et ouvre le fil de
 * discussion qui portera la suite de l'échange.
 */

import { NextResponse } from "next/server";
import { relayCommunity } from "@/lib/api/community-relay";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.clone().json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const slug =
    typeof payload === "object" && payload !== null && "lawyer" in payload
      ? String((payload as { lawyer: unknown }).lawyer)
      : "";

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { message: "Cabinet introuvable.", errors: { lawyer: "Choisissez un cabinet." } },
      { status: 404 },
    );
  }

  return relayCommunity(`/lawyers/${slug}/bookings`, request, "optional");
}
