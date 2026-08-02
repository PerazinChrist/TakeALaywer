/**
 * POST /api/avocats/connexion
 *
 * Ouvre une session à partir d'un e-mail et d'un mot de passe. Comme pour
 * l'inscription, le jeton ne franchit pas la frontière du navigateur.
 */

import { NextResponse } from "next/server";
import { callWordPress, clientIpFrom } from "@/lib/api/server";
import { writeSession } from "@/lib/api/session";
import type { ApiAccount } from "@/lib/api/types";

type WordPressLogin = {
  account: ApiAccount;
  token: string;
  expiresAt: string;
};

export async function POST(request: Request) {
  let payload: { email?: unknown; password?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  // Contrôle de présence côté serveur : inutile de solliciter WordPress — et
  // de consommer le quota de tentatives — pour un formulaire vide.
  const errors: Record<string, string> = {};

  if (email === "") errors.email = "Indiquez votre adresse e-mail.";
  if (password === "") errors.password = "Indiquez votre mot de passe.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { message: "Certains champs sont incomplets.", errors },
      { status: 422 },
    );
  }

  const result = await callWordPress<WordPressLogin>("/auth/login", {
    method: "POST",
    body: { email, password },
    withKey: true,
    // Le quota de tentatives doit viser le visiteur, pas le serveur Next :
    // sinon une attaque par dictionnaire bloquerait tout le monde à sa place.
    clientIp: clientIpFrom(request),
  });

  if (!result.ok || !result.data) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  const { token, expiresAt, account } = result.data;
  const response = NextResponse.json({ account }, { status: 200 });

  writeSession(response, token, expiresAt);

  return response;
}
