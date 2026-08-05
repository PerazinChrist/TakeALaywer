/**
 * POST /api/compte/deconnexion
 *
 * Révoque le jeton côté WordPress, puis retire le cookie.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { clearClientSession, readClientToken } from "@/lib/api/session";

export async function POST() {
  const token = await readClientToken();

  if (token) {
    // Le résultat n'est pas testé volontairement : que le jeton soit déjà
    // expiré ou le serveur injoignable, le visiteur doit dans tous les cas se
    // retrouver déconnecté de ce navigateur.
    await callWordPress("/client/logout", { method: "POST", token });
  }

  const response = NextResponse.json({ loggedOut: true });

  clearClientSession(response);

  return response;
}
