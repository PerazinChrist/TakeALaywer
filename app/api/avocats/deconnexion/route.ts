/**
 * POST /api/avocats/deconnexion
 *
 * Révoque le jeton côté WordPress, puis retire le cookie.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { clearSession, readSessionToken } from "@/lib/api/session";

export async function POST() {
  const token = await readSessionToken();

  if (token) {
    // Le résultat n'est pas testé volontairement : que le jeton soit déjà
    // expiré ou le serveur injoignable, l'utilisateur doit dans tous les cas
    // se retrouver déconnecté de ce navigateur.
    await callWordPress("/auth/logout", { method: "POST", token });
  }

  const response = NextResponse.json({ loggedOut: true });

  clearSession(response);

  return response;
}
