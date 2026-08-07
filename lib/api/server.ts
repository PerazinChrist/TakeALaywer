/**
 * Accès serveur à l'API du plugin WordPress TakeALawyer Core.
 *
 * ⚠️ Ne jamais importer ce module depuis un fichier « use client ».
 *
 * Il lit `TAL_API_KEY`, la clé partagée qui autorise la création de comptes et
 * le dépôt d'avis. Une clé arrivée dans le bundle du navigateur serait lisible
 * par n'importe qui, et l'annuaire se remplirait de faux cabinets en une nuit.
 * C'est la raison d'être des Route Handlers de `app/api/avocats/` : le
 * navigateur parle à Next, Next parle à WordPress.
 */

import { API_ERROR_FALLBACK, type ApiEnvelope, type FieldErrors } from "@/lib/api/types";

/** Base de l'API REST, sans slash final. Ex. http://localhost/simplyprint/wp-json/tal/v1 */
function baseUrl() {
  const url = process.env.TAL_API_URL;

  if (!url) {
    throw new Error(
      "TAL_API_URL est absent. Copiez .env.local.example vers .env.local — " +
        "les deux valeurs se trouvent dans WordPress, menu Avocats → Réglages.",
    );
  }

  return url.replace(/\/+$/, "");
}

function apiKey() {
  const key = process.env.TAL_API_KEY;

  if (!key) {
    throw new Error(
      "TAL_API_KEY est absent. La clé se trouve dans WordPress, menu Avocats → Réglages.",
    );
  }

  return key;
}

type CallOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** Corps JSON. Ignoré si `formData` est fourni. */
  body?: unknown;
  /** Corps multipart, pour le dépôt des justificatifs. */
  formData?: FormData;
  /** Jeton de session de l'avocat, lu depuis le cookie httpOnly. */
  token?: string | null;
  /**
   * Envoyer la clé d'API. Nécessaire pour l'inscription, la connexion et le
   * dépôt d'avis ; inutile sur les routes qui s'authentifient par jeton.
   */
  withKey?: boolean;
  /**
   * Adresse du visiteur, à transmettre au plugin.
   *
   * Indispensable pour les endpoints à quota. Next appelle WordPress depuis son
   * serveur : sans cette information, tous les visiteurs partagent une seule
   * adresse, et les cinq inscriptions horaires autorisées par IP deviennent
   * cinq inscriptions horaires pour le site entier.
   */
  clientIp?: string | null;
};

/**
 * Extrait l'adresse du visiteur d'une requête entrante.
 *
 * En développement local, aucun de ces en-têtes n'est posé : on retourne null
 * et WordPress retombe sur l'adresse du serveur Next, ce qui est correct
 * puisqu'il n'y a qu'un poste.
 */
export function clientIpFrom(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");

  // Le premier maillon de la chaîne est le client d'origine.
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip");
}

/**
 * Appelle l'API WordPress et retourne toujours une enveloppe exploitable,
 * même en cas de panne réseau.
 *
 * On ne lève jamais d'exception sur une réponse d'erreur : l'appelant doit
 * pouvoir renvoyer le statut et les messages de champ au formulaire sans
 * enrober chaque appel dans un try/catch.
 */
export async function callWordPress<T = unknown>(
  path: string,
  { method = "GET", body, formData, token, withKey = false, clientIp }: CallOptions = {},
): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {};

  if (withKey) headers["X-TAL-Key"] = apiKey();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Doublon volontaire. Beaucoup d'hébergements Apache en CGI/FastCGI ne
    // transmettent pas `Authorization` à PHP : WordPress ne voit alors aucun
    // jeton, et toutes les routes d'espace personnel répondent 401 sans que
    // rien n'indique pourquoi. Le plugin accepte cet en-tête de repli.
    headers["X-TAL-Token"] = token;
  }
  // Le plugin n'accorde crédit à cet en-tête que si la clé est valide : le
  // transmettre sans elle serait sans effet.
  if (clientIp && withKey) headers["X-TAL-Client-IP"] = clientIp;
  // Le Content-Type d'un multipart doit être posé par fetch lui-même : il
  // contient la frontière (« boundary ») que nous ne connaissons pas.
  if (!formData && body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;

  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      // Ces données changent à chaque requête : les mettre en cache
      // afficherait la vitrine d'hier après une modification.
      cache: "no-store",
    });
  } catch {
    // Le message part à l'écran d'un visiteur : il ne peut pas parler de XAMPP,
    // qui ne veut rien dire pour lui et ne le concerne pas. Le détail utile au
    // développement va dans les journaux du serveur, où il a sa place.
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[TakeALawyer] ${baseUrl()} est injoignable. En local, vérifiez qu’Apache et MySQL ` +
          "tournent ; en ligne, vérifiez TAL_API_URL et que /wp-json/ répond.",
      );
    }

    return {
      ok: false,
      status: 503,
      message: "Le service est momentanément injoignable. Réessayez dans un instant.",
      errors: {},
      data: null,
    };
  }

  const payload = await readJson(response);

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      message: "",
      errors: {},
      data: payload as T,
    };
  }

  // WordPress sérialise un WP_Error ainsi :
  // { code, message, data: { status, errors: { champ: "message" } } }
  const record = isRecord(payload) ? payload : {};
  const inner = isRecord(record.data) ? record.data : {};

  return {
    ok: false,
    status: response.status,
    message: typeof record.message === "string" ? record.message : API_ERROR_FALLBACK,
    errors: isRecord(inner.errors) ? (inner.errors as FieldErrors) : {},
    data: null,
  };
}

/** Lit un corps JSON sans jamais lever, même si la réponse est vide ou en HTML. */
async function readJson(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
