/**
 * POST /api/compte/inscription
 *
 * Crée un compte citoyen et ouvre sa session. Comme pour les praticiens, le
 * jeton renvoyé par le plugin ne franchit pas la frontière du navigateur : il
 * part directement dans un cookie httpOnly.
 */

import { NextResponse } from "next/server";
import { callWordPress, clientIpFrom } from "@/lib/api/server";
import { writeClientSession } from "@/lib/api/session";
import type { ApiClient } from "@/lib/api/types";

type WordPressRegister = {
  client: ApiClient;
  token: string;
  expiresAt: string;
  message: string;
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const result = await callWordPress<WordPressRegister>("/client/register", {
    method: "POST",
    body: payload,
    withKey: true,
    // Sans cela, le quota d'inscription du plugin s'appliquerait au serveur
    // Next et non au visiteur : dix comptes par heure pour le site entier.
    clientIp: clientIpFrom(request),
  });

  if (!result.ok || !result.data) {
    // Les erreurs de champ sont remontées telles quelles : le formulaire les
    // rattache à ses entrées par le même nom (email, password, acceptTerms).
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  const { token, expiresAt, client, message } = result.data;

  const response = NextResponse.json({ client, message }, { status: 201 });

  if (token) {
    writeClientSession(response, token, expiresAt);
  }

  return response;
}
