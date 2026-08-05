/**
 * POST /api/compte/mot-de-passe
 *
 * Change le mot de passe du citoyen connecté.
 *
 * Ne passe pas par le relais générique : le plugin révoque toutes les sessions
 * du compte — c'est le but — et renvoie un jeton neuf. Sans le déposer ici, le
 * visiteur serait déconnecté de son propre navigateur juste après avoir changé
 * son mot de passe.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { readClientToken, writeClientSession } from "@/lib/api/session";
import { clientSessionExpired } from "@/lib/api/citizen-relay";

type WordPressPassword = {
  token: string;
  expiresAt: string;
  message: string;
};

export async function POST(request: Request) {
  const token = await readClientToken();

  if (!token) return clientSessionExpired();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const result = await callWordPress<WordPressPassword>("/client/password", {
    method: "POST",
    body,
    token,
  });

  if (!result.ok || !result.data) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  const response = NextResponse.json({ message: result.data.message }, { status: 200 });

  writeClientSession(response, result.data.token, result.data.expiresAt);

  return response;
}
