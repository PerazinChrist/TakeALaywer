/**
 * Relais authentifié des écritures de l'espace citoyen vers WordPress.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * Même rôle que `lib/api/relay.ts` pour les praticiens, mais adossé au cookie
 * citoyen. Le chemin cible est écrit par l'appelant, jamais reconstruit à partir
 * de l'URL entrante : un relais générique qui accepterait un chemin depuis le
 * navigateur ouvrirait toute l'API du plugin.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { readClientToken } from "@/lib/api/session";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/**
 * Transmet une requête JSON à `/client/*`.
 *
 * @param path    Chemin dans l'API du plugin, ex. « /client/me ».
 * @param method  Verbe HTTP.
 * @param request Requête entrante, dont le corps JSON est relu.
 */
export async function relayClientJson(
  path: string,
  method: Method,
  request?: Request,
): Promise<NextResponse> {
  const token = await readClientToken();

  if (!token) return clientSessionExpired();

  let body: unknown;

  if (request && method !== "DELETE" && method !== "GET") {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
    }
  }

  const result = await callWordPress(path, { method, body, token });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data as object | null, { status: result.status });
}

/** Réponse commune : session citoyenne absente ou expirée. */
export function clientSessionExpired(): NextResponse {
  return NextResponse.json(
    {
      message: "Votre session a expiré. Reconnectez-vous pour poursuivre.",
      errors: {},
    },
    { status: 401 },
  );
}
