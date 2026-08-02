/**
 * POST /api/avocats/inscription
 *
 * Relaie le formulaire d'inscription vers WordPress en y ajoutant la clé
 * d'API, puis ouvre la session. Le jeton renvoyé par le plugin n'est jamais
 * retransmis au navigateur : il part directement dans le cookie httpOnly.
 */

import { NextResponse } from "next/server";
import { callWordPress, clientIpFrom } from "@/lib/api/server";
import { writeSession } from "@/lib/api/session";
import type { ApiAccount, ApiDocument } from "@/lib/api/types";

type WordPressRegister = {
  account: ApiAccount;
  token: string;
  expiresAt: string;
  documents: ApiDocument[];
  message: string;
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Requête illisible.", errors: {} },
      { status: 400 },
    );
  }

  const result = await callWordPress<WordPressRegister>("/auth/register", {
    method: "POST",
    body: payload,
    withKey: true,
    // Sans cela, le quota d'inscription du plugin s'appliquerait au serveur
    // Next et non au visiteur : cinq comptes par heure pour le site entier.
    clientIp: clientIpFrom(request),
  });

  if (!result.ok || !result.data) {
    // Les erreurs de champ sont remontées telles quelles : le wizard les
    // rattache à ses entrées par le même nom (email, rccm, oathDate…).
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  const { token, expiresAt, account, documents, message } = result.data;

  const response = NextResponse.json({ account, documents, message }, { status: 201 });

  if (token) {
    writeSession(response, token, expiresAt);
  }

  return response;
}
