/**
 * Client serveur de l'API CamPay — encaissement Mobile Money (MTN, Orange).
 *
 * ⚠️ Ne jamais importer ce module depuis un fichier « use client ».
 *
 * Il lit les identifiants d'application CamPay. Aucun d'eux ne porte le préfixe
 * NEXT_PUBLIC_, et c'est délibéré : ce couple username/password permet d'émettre
 * des demandes de paiement *et* des retraits sur le solde du compte. Exposé au
 * navigateur, il viderait la caisse. Seuls les Route Handlers de
 * `app/api/paiements/` ont le droit d'appeler ce module.
 *
 * Documentation : https://documenter.getpostman.com/view/2391374/T1LV8PVA
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Statuts renvoyés par CamPay. Une transaction naît toujours en PENDING. */
export type CampayStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

/** Réponse de POST /api/collect/ — la demande est partie sur le téléphone. */
export type CampayCollectResult = {
  /** UUID4 CamPay. C'est lui qui sert à interroger le statut. */
  reference: string;
  /** Code à composer si la notification n'arrive pas (« *126# »). */
  ussd_code: string;
  /** « mtn » ou « orange », déduit du numéro par CamPay. */
  operator: string;
};

/** Réponse de GET /api/transaction/{reference}/ — l'état réel du paiement. */
export type CampayTransaction = {
  reference: string;
  external_reference: string;
  status: CampayStatus;
  /** CamPay renvoie un nombre (« 2.0 »), pas une chaîne. */
  amount: number;
  currency: string;
  operator: string;
  /** Référence CamPay lisible (« D201102W0002LK »). */
  code: string;
  operator_reference: string | null;
  description: string;
  external_user: string;
  /** Motif de l'échec, null tant que la transaction n'a pas échoué. */
  reason: string | null;
  phone_number: string;
  /** « collect » pour un encaissement, « withdraw » pour un décaissement. */
  endpoint: string;
};

/** Corps du rappel serveur (webhook), en GET comme en POST. */
export type CampayCallback = {
  status: string;
  reference: string;
  amount: string;
  currency: string;
  operator: string;
  code: string;
  operator_reference: string;
  /** JWT signé avec la clé webhook de l'application. */
  signature: string;
  endpoint: string;
  external_reference: string;
  external_user: string;
  phone_number: string;
  reason: string;
};

/** Issue d'un appel : jamais d'exception, toujours un message affichable. */
export type CampayResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string };

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Base de l'API, sans slash final.
 *
 * Bac à sable : https://demo.campay.net — production : https://www.campay.net.
 * Les deux environnements ont des identifiants distincts ; croiser les deux
 * donne une 401 qui ressemble à s'y méprendre à un mot de passe erroné.
 */
function baseUrl() {
  return (process.env.CAMPAY_BASE_URL || "https://demo.campay.net").replace(/\/+$/, "");
}

/** Devise des transactions. CamPay n'encaisse qu'en francs CFA. */
export function currency() {
  return process.env.CAMPAY_CURRENCY || "XAF";
}

/**
 * Indique si l'encaissement réel est configuré.
 *
 * Sans identifiants, le tunnel doit le dire au lieu de faire semblant : une
 * page qui annonce « paiement accepté » sans qu'aucun franc ne circule est un
 * mensonge, y compris en développement.
 */
export function campayConfigured() {
  return Boolean(
    process.env.CAMPAY_PERMANENT_TOKEN ||
      (process.env.CAMPAY_APP_USERNAME && process.env.CAMPAY_APP_PASSWORD),
  );
}

/* -------------------------------------------------------------------------- */
/* Jeton d'accès                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Jeton courant, mémorisé entre les requêtes.
 *
 * Le jeton temporaire vit une heure : le redemander à chaque encaissement
 * doublerait le nombre d'allers-retours vers CamPay et ajouterait sa latence à
 * chaque paiement, au moment précis où l'utilisateur attend.
 */
let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Retourne un jeton d'accès valide.
 *
 * Deux modes, dans l'ordre de préférence :
 *
 * 1. `CAMPAY_PERMANENT_TOKEN` — le jeton permanent de la section APP KEYS.
 *    Aucun aller-retour, mais il n'expire jamais : une fuite est définitive
 *    jusqu'à révocation manuelle dans le tableau de bord.
 * 2. `CAMPAY_APP_USERNAME` / `CAMPAY_APP_PASSWORD` — échangés contre un jeton
 *    d'une heure. C'est le mode recommandé en production.
 */
async function accessToken(): Promise<CampayResult<string>> {
  const permanent = process.env.CAMPAY_PERMANENT_TOKEN;

  if (permanent) return { ok: true, data: permanent };

  const username = process.env.CAMPAY_APP_USERNAME;
  const password = process.env.CAMPAY_APP_PASSWORD;

  if (!username || !password) {
    return {
      ok: false,
      message:
        "Le paiement mobile n’est pas configuré sur cette installation. " +
        "Renseignez CAMPAY_APP_USERNAME et CAMPAY_APP_PASSWORD dans .env.local.",
    };
  }

  // Une marge de soixante secondes : un jeton qui expire pendant le trajet
  // vers CamPay ferait échouer un paiement déjà accepté par l'utilisateur.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return { ok: true, data: cachedToken.value };
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl()}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "CamPay est injoignable. Réessayez dans un instant." };
  }

  const payload = (await readJson(response)) as { token?: string; expires_in?: number } | null;

  if (!response.ok || !payload?.token) {
    return {
      ok: false,
      message:
        "Identifiants CamPay refusés. Vérifiez les clés de l’application et " +
        "que CAMPAY_BASE_URL pointe bien vers le même environnement.",
    };
  }

  const lifetime = typeof payload.expires_in === "number" ? payload.expires_in : 3600;

  cachedToken = { value: payload.token, expiresAt: Date.now() + lifetime * 1000 };

  return { ok: true, data: payload.token };
}

/* -------------------------------------------------------------------------- */
/* Appels                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Demande un paiement — POST /api/collect/.
 *
 * L'utilisateur reçoit sur son téléphone une invitation à saisir son code
 * Mobile Money. L'appel revient immédiatement, avant qu'il n'ait composé quoi
 * que ce soit : la transaction naît en PENDING, et c'est `transaction()` qui
 * dira si elle a abouti.
 *
 * @param externalReference UUID4 unique, généré par nous. CamPay s'en sert
 *   comme clé d'idempotence : rejouer le même UUID renvoie la première
 *   transaction plutôt que d'en débiter une seconde.
 */
export async function collect(input: {
  amount: number;
  phone: string;
  description: string;
  externalReference: string;
  externalUser: string;
}): Promise<CampayResult<CampayCollectResult>> {
  const token = await accessToken();

  if (!token.ok) return token;

  return call<CampayCollectResult>("/api/collect/", token.data, {
    method: "POST",
    body: {
      // CamPay refuse les décimales (ER201). Les prix du catalogue sont en
      // francs CFA, donc déjà entiers — l'arrondi n'est là que pour garantir
      // qu'aucune donnée abîmée ne parte en « 2500.0000001 ».
      amount: String(Math.round(input.amount)),
      currency: currency(),
      from: input.phone,
      description: input.description.slice(0, 60),
      external_reference: input.externalReference,
      external_user: input.externalUser,
    },
  });
}

/**
 * Lit l'état réel d'une transaction — GET /api/transaction/{reference}/.
 *
 * C'est la seule source de vérité du tunnel. Le navigateur peut prétendre
 * n'importe quoi ; CamPay, lui, sait ce qui a été encaissé.
 */
export async function transaction(
  reference: string,
): Promise<CampayResult<CampayTransaction>> {
  const token = await accessToken();

  if (!token.ok) return token;

  return call<CampayTransaction>(
    `/api/transaction/${encodeURIComponent(reference)}/`,
    token.data,
  );
}

/**
 * Verse de l'argent à un numéro Mobile Money — POST /api/withdraw/.
 *
 * ⚠️ Cet appel sort de l'argent du solde de l'application. Il ne doit être
 * atteint que par un chemin serveur ayant déjà vérifié qu'une somme est due, à
 * qui, et pour quel montant.
 *
 * Deux prérequis côté CamPay : les retraits par API doivent être autorisés dans
 * les réglages de l'application, et le solde doit couvrir le montant (ER301).
 *
 * @param externalReference UUID4 unique. Clé d'idempotence : rejouer le même
 *   identifiant renvoie le premier virement au lieu d'en émettre un second.
 */
export async function withdraw(input: {
  amount: number;
  phone: string;
  description: string;
  externalReference: string;
}): Promise<CampayResult<{ reference: string; status?: string }>> {
  const token = await accessToken();

  if (!token.ok) return token;

  return call<{ reference: string; status?: string }>("/api/withdraw/", token.data, {
    method: "POST",
    body: {
      amount: String(Math.round(input.amount)),
      to: input.phone,
      description: input.description.slice(0, 60),
      external_reference: input.externalReference,
    },
  });
}

/**
 * Retrouve la commission prélevée sur un encaissement.
 *
 * `/transaction/{ref}/` ne dit pas ce que l'opérateur a retenu ; seul
 * `/history/` porte `charge_amount` et `credit`. C'est pourtant cette
 * commission qui sépare le brut du net, donc la base de calcul de la part due à
 * l'auteur. La chercher vaut mieux que la supposer : reverser 70 % d'un brut
 * jamais encaissé creuserait la caisse à chaque vente.
 *
 * L'historique se lit par plage de dates. On demande d'hier à demain — trois
 * jours suffisent largement pour une transaction qui vient d'aboutir, et
 * couvrent les décalages de fuseau entre notre serveur et le leur.
 *
 * @returns La commission en francs CFA, ou null si l'historique ne la donne pas
 *   encore. Un null ne doit jamais être pris pour un zéro.
 */
export async function chargeFor(reference: string): Promise<number | null> {
  const token = await accessToken();

  if (!token.ok) return null;

  const day = 24 * 60 * 60 * 1000;
  const iso = (at: number) => new Date(at).toISOString().slice(0, 10);

  const history = await call<{ data?: unknown }>("/api/history/", token.data, {
    method: "POST",
    body: {
      start_date: iso(Date.now() - day),
      end_date: iso(Date.now() + day),
    },
  });

  if (!history.ok) return null;

  const rows = Array.isArray(history.data?.data) ? history.data.data : [];

  for (const row of rows) {
    if (!isRecord(row)) continue;
    if (row.reference_uuid !== reference) continue;

    const charge = Number(row.charge_amount);

    if (!Number.isFinite(charge) || charge < 0) return null;

    // Arrondi au franc supérieur : la commission réelle porte des décimales que
    // le franc CFA ne connaît pas. L'arrondir vers le haut fait porter le
    // centime à la plateforme plutôt qu'à l'auteur.
    return Math.ceil(charge);
  }

  return null;
}

/** Appel commun : en-tête d'autorisation, lecture d'erreur, aucune exception. */
async function call<T>(
  path: string,
  token: string,
  { method = "GET", body }: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<CampayResult<T>> {
  let response: Response;

  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers: {
        // Le schéma est « Token », pas « Bearer » : CamPay rejette le second.
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "CamPay est injoignable. Réessayez dans un instant." };
  }

  const payload = await readJson(response);

  if (response.ok) return { ok: true, data: payload as T };

  // Un jeton refusé en cours de route est le plus souvent un jeton périmé
  // gardé trop longtemps : on vide le cache pour que la tentative suivante
  // reparte d'un jeton neuf plutôt que de rejouer le même échec.
  if (response.status === 401) cachedToken = null;

  return describeError(payload, response.status);
}

/* -------------------------------------------------------------------------- */
/* Erreurs                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Codes d'erreur documentés par CamPay, traduits pour l'utilisateur.
 *
 * Les messages d'origine sont en anglais et parlent d'« unsupported carrier » :
 * quelqu'un qui vient de saisir son numéro a besoin de savoir quoi corriger,
 * pas de lire le vocabulaire interne d'un prestataire.
 */
const ERROR_MESSAGES: Record<string, string> = {
  ER101:
    "Ce numéro n’est pas valide. Saisissez-le avec l’indicatif du pays, " +
    "par exemple 237 6 99 00 00 00.",
  ER102:
    "Cet opérateur n’est pas pris en charge. Seuls les numéros MTN Mobile " +
    "Money et Orange Money peuvent régler en ligne.",
  ER201: "Le montant est invalide. Signalez-nous cette commande, nous la reprenons à la main.",
  ER301: "Solde insuffisant pour cette opération.",
};

function describeError(payload: unknown, status: number): { ok: false; message: string; code?: string } {
  const record = isRecord(payload) ? payload : {};
  const code = typeof record.error_code === "string" ? record.error_code : undefined;

  if (code && ERROR_MESSAGES[code]) return { ok: false, message: ERROR_MESSAGES[code], code };

  // CamPay renvoie le détail tantôt dans `message`, tantôt dans `detail`, et
  // pour les erreurs de validation sous forme de tableau par champ.
  const detail =
    firstString(record.message) ??
    firstString(record.detail) ??
    firstString(record.error) ??
    firstString(record.from) ??
    firstString(record.amount);

  if (detail) return { ok: false, message: detail, code };

  if (status === 401) {
    return { ok: false, message: "Identifiants CamPay refusés.", code };
  }

  return {
    ok: false,
    message: "Le paiement n’a pas pu être transmis à l’opérateur. Réessayez.",
    code,
  };
}

/* -------------------------------------------------------------------------- */
/* Numéro de téléphone                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Met un numéro camerounais au format attendu : 237 suivi de neuf chiffres.
 *
 * Les gens saisissent leur numéro comme ils le disent — « 699 00 00 00 »,
 * « +237 6 99-00-00-00 », « 00237699000000 ». Refuser ces formes ferait échouer
 * un paiement pour une question de ponctuation, alors que le numéro est bon.
 *
 * @returns Le numéro normalisé, ou null s'il ne peut pas l'être.
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");

  // Préfixe international composé : 00237… puis le numéro local.
  if (digits.startsWith("00237")) digits = digits.slice(2);

  // Numéro local à neuf chiffres, sans indicatif.
  if (digits.length === 9 && digits.startsWith("6")) digits = `237${digits}`;

  // Les mobiles camerounais commencent tous par 6 depuis la renumérotation.
  if (!/^2376\d{8}$/.test(digits)) return null;

  return digits;
}

/* -------------------------------------------------------------------------- */
/* Signature du rappel serveur                                                */
/* -------------------------------------------------------------------------- */

/**
 * Vérifie le JWT accompagnant un rappel serveur CamPay.
 *
 * Sans cette vérification, l'URL de rappel est une porte ouverte : elle est
 * publique par nature, et n'importe qui pourrait la visiter en annonçant
 * « SUCCESSFUL » pour se faire offrir un guide. La signature est un HMAC-SHA256
 * de l'en-tête et du corps, calculé avec la clé webhook de l'application — que
 * seuls CamPay et nous connaissons.
 *
 * Implémenté à la main plutôt qu'avec une bibliothèque JWT : le projet
 * n'embarque aucune dépendance de ce genre, et la vérification HS256 tient en
 * quinze lignes de `node:crypto`.
 *
 * @returns true si la signature est authentique et non expirée.
 */
export function verifyCallbackSignature(signature: string): boolean {
  const key = process.env.CAMPAY_WEBHOOK_KEY;

  if (!key) return false;

  const parts = signature.split(".");

  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  let header: unknown;

  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  // Refuser explicitement tout autre algorithme. Accepter « none » — ou laisser
  // l'émetteur choisir — est la faille classique des vérifications JWT écrites
  // à la main : elle rend la signature purement décorative.
  if (!isRecord(header) || header.alg !== "HS256") return false;

  const expected = createHmac("sha256", key)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  let received: Buffer;

  try {
    received = Buffer.from(encodedSignature, "base64url");
  } catch {
    return false;
  }

  // `timingSafeEqual` exige deux tampons de même longueur : la comparaison de
  // taille doit précéder, sinon elle lève au lieu de retourner false.
  if (received.length !== expected.length) return false;
  if (!timingSafeEqual(received, expected)) return false;

  // Une signature authentique mais périmée est rejouable : un rappel capté
  // hier ne doit pas pouvoir être resoumis aujourd'hui.
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

    if (isRecord(payload) && typeof payload.exp === "number") {
      if (payload.exp * 1000 < Date.now()) return false;
    }
  } catch {
    return false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */

async function readJson(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** Extrait une chaîne, y compris quand l'API la range dans un tableau. */
function firstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
