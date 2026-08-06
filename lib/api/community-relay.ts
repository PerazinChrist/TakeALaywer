/**
 * Relais des écritures de l'espace communautaire vers WordPress.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * `lib/api/relay.ts` et `lib/api/citizen-relay.ts` relaient chacun **un** cookie
 * vers **une** famille d'endpoints. Les routes communautaires ne rentrent dans
 * ni l'un ni l'autre : elles réclament la clé d'API (elles écrivent, et le
 * quota par IP a besoin de l'adresse du visiteur) et acceptent, selon la route,
 * le jeton citoyen, le jeton praticien, les deux ou aucun.
 *
 * D'où ce troisième relais, avec une seule inconnue explicite : quelle
 * signature accompagne l'appel. Le chemin cible reste écrit par l'appelant,
 * jamais reconstruit depuis l'URL entrante — un relais générique ouvrirait
 * toute l'API du plugin au navigateur.
 */

import { NextResponse } from "next/server";
import { callWordPress, clientIpFrom } from "@/lib/api/server";
import { readClientToken, readSessionToken } from "@/lib/api/session";

/**
 * Signature attendue par la route visée.
 *
 *  - `client`  : jeton citoyen obligatoire (dépôt d'un besoin) ;
 *  - `account` : jeton praticien obligatoire ;
 *  - `any`     : l'un ou l'autre, obligatoire (réponse communautaire) ;
 *  - `optional`: l'un ou l'autre s'il existe (vote d'utilité, réservation).
 */
export type Signature = "client" | "account" | "any" | "optional";

/**
 * Transmet une écriture communautaire au plugin.
 *
 * @param path      Chemin dans l'API du plugin, ex. « /needs ».
 * @param request   Requête entrante, dont le corps JSON est relu.
 * @param signature Jeton attendu par la route.
 * @param method    Verbe HTTP.
 */
export async function relayCommunity(
  path: string,
  request: Request,
  signature: Signature = "optional",
  method: "POST" | "PATCH" = "POST",
): Promise<NextResponse> {
  const token = await pickToken(signature);

  if (token === null) return unauthorized(signature);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    // Un vote d'utilité n'envoie rien : un corps absent est légitime ici.
    body = {};
  }

  const result = await callWordPress(path, {
    method,
    body,
    token,
    withKey: true,
    // Sans l'adresse du visiteur, tous les quotas par IP s'appliqueraient au
    // site entier : le sixième besoin de la journée fermerait le formulaire
    // pour tout le monde.
    clientIp: clientIpFrom(request),
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data as object | null, { status: result.status });
}

/**
 * Choisit le jeton à présenter.
 *
 * @returns Le jeton, une chaîne vide quand aucun n'est requis, ou `null` quand
 *          la signature exigée manque — ce que l'appelant traduit en 401.
 */
async function pickToken(signature: Signature): Promise<string | null> {
  if (signature === "client") return (await readClientToken()) ?? null;
  if (signature === "account") return (await readSessionToken()) ?? null;

  // Le citoyen d'abord : c'est lui qui écrit le plus souvent, et les deux
  // tables de sessions sont disjointes — présenter l'un là où l'autre est
  // attendu n'ouvre rien.
  const client = await readClientToken();

  if (client) return client;

  const account = await readSessionToken();

  if (account) return account;

  return signature === "optional" ? "" : null;
}

/** Réponse commune : la signature exigée par la route manque. */
function unauthorized(signature: Signature): NextResponse {
  const message =
    signature === "account"
      ? "Connectez-vous à votre espace praticien pour poursuivre."
      : "Créez un compte ou connectez-vous pour poursuivre.";

  return NextResponse.json({ message, errors: {} }, { status: 401 });
}
