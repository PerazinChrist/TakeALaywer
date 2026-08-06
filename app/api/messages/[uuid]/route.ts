/**
 * POST /api/messages/{uuid} — envoyer un message dans un fil.
 *
 * Le versant (« citoyen » ou « avocat ») accompagne le corps : la page de
 * conversation le connaît déjà — c'est par lui qu'elle a chargé le fil — et le
 * redemander au backend coûterait un aller-retour pour une information dont
 * l'appelant dispose.
 *
 * Le jeton correspondant reste néanmoins la seule autorité : annoncer
 * « avocat » sans le cookie praticien ne donne accès à rien.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { readClientToken, readSessionToken } from "@/lib/api/session";

export async function POST(request: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    return NextResponse.json(
      { message: "Conversation introuvable.", errors: {} },
      { status: 404 },
    );
  }

  let body: { body?: string; viewer?: string };

  try {
    body = (await request.json()) as { body?: string; viewer?: string };
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const practitioner = body.viewer === "avocat";
  const token = practitioner ? await readSessionToken() : await readClientToken();

  if (!token) {
    return NextResponse.json(
      {
        message: "Votre session a expiré. Reconnectez-vous pour poursuivre.",
        errors: {},
      },
      { status: 401 },
    );
  }

  const base = practitioner ? "/me" : "/client";

  const result = await callWordPress(`${base}/conversations/${uuid}/messages`, {
    method: "POST",
    body: { body: body.body ?? "" },
    token,
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data as object, { status: result.status });
}
