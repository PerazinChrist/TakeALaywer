/**
 * Relais authentifié des écritures de l'espace praticien vers WordPress.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * Les Route Handlers de `app/api/avocats/` se ressemblent tous : lire le cookie
 * de session, refuser si elle a expiré, transmettre le corps à `/me/*`, renvoyer
 * la réponse telle quelle. Ce module tient cette mécanique une seule fois.
 *
 * Le chemin cible est écrit par l'appelant, jamais reconstruit à partir de
 * l'URL entrante : un relais générique qui accepterait un chemin depuis le
 * navigateur ouvrirait toute l'API du plugin, y compris ce que le front n'a
 * jamais eu vocation à exposer.
 */

import { NextResponse } from "next/server";
import { callWordPress } from "@/lib/api/server";
import { readSessionToken } from "@/lib/api/session";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/**
 * Transmet une requête JSON à `/me/*`.
 *
 * @param path    Chemin dans l'API du plugin, ex. « /me/prestations ».
 * @param method  Verbe HTTP.
 * @param request Requête entrante, dont le corps JSON est relu.
 */
export async function relayJson(
  path: string,
  method: Method,
  request?: Request,
): Promise<NextResponse> {
  const token = await readSessionToken();

  if (!token) return expired();

  let body: unknown;

  if (request && method !== "DELETE") {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
    }
  }

  const result = await callWordPress(path, { method, body, token });

  return respond(result);
}

/** Contraintes appliquées à un champ fichier avant relais. */
export type FileRule = {
  maxSize: number;
  accept: string[];
  /** Message affiché si le fichier dépasse `maxSize`. */
  tooLarge: string;
  /** Message affiché si son type n'est pas dans `accept`. */
  badType: string;
};

/**
 * Transmet un corps multipart à `/me/*` — dépôts d'images et de PDF.
 *
 * Les fichiers sont recopiés champ par champ plutôt que relayés en bloc : le
 * `FormData` reçu peut contenir n'importe quoi, et seuls les noms attendus par
 * le plugin doivent poursuivre leur route.
 *
 * @param path    Chemin dans l'API du plugin.
 * @param request Requête entrante, en `multipart/form-data`.
 * @param options Champs autorisés, avec leurs contraintes.
 */
export async function relayForm(
  path: string,
  request: Request,
  options: {
    /** Contraintes par nom de champ fichier. Un champ absent d'ici est ignoré. */
    files: Record<string, FileRule>;
    /** Noms de champs texte transmis tels quels. */
    fields?: string[];
  },
): Promise<NextResponse> {
  const token = await readSessionToken();

  if (!token) return expired();

  let incoming: FormData;

  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ message: "Requête illisible.", errors: {} }, { status: 400 });
  }

  const outgoing = new FormData();

  for (const field of options.fields ?? []) {
    const value = incoming.get(field);

    if (typeof value === "string") outgoing.set(field, value);
  }

  let attached = 0;

  for (const [name, rule] of Object.entries(options.files)) {
    for (const value of incoming.getAll(name)) {
      if (!(value instanceof File) || value.size === 0) continue;

      // Contrôles rejoués ici : WordPress refuserait de toute façon, mais après
      // avoir absorbé le fichier entier — inutile sur une connexion mobile.
      if (value.size > rule.maxSize) {
        return NextResponse.json({ message: rule.tooLarge, errors: {} }, { status: 413 });
      }

      if (value.type && !rule.accept.includes(value.type)) {
        return NextResponse.json({ message: rule.badType, errors: {} }, { status: 415 });
      }

      // `append` et non `set` : un album accepte plusieurs images d'un coup.
      outgoing.append(name, value, value.name);
      attached += 1;
    }
  }

  const result = await callWordPress(path, {
    method: "POST",
    formData: outgoing,
    token,
  });

  // Le nombre de fichiers réellement joints revient au client : c'est ce qui
  // lui permet d'annoncer « 3 photos ajoutées » sans recompter lui-même.
  return respond(result, attached);
}

/** Réponse commune : erreur de session expirée. */
function expired(): NextResponse {
  return NextResponse.json(
    {
      message: "Votre session a expiré. Reconnectez-vous pour poursuivre.",
      errors: {},
    },
    { status: 401 },
  );
}

/** Traduit l'enveloppe du client WordPress en réponse Next. */
function respond(
  result: Awaited<ReturnType<typeof callWordPress>>,
  uploaded?: number,
): NextResponse {
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  const payload =
    uploaded === undefined
      ? (result.data as object | null)
      : { ...(result.data as object | null), uploaded };

  return NextResponse.json(payload, { status: result.status });
}

/** Formats d'image acceptés — alignés sur TAL_Media::ALLOWED_TYPES. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Contrainte d'un champ image. Aligné sur TAL_Media::MAX_SIZE — 5 Mio. */
export const IMAGE_RULE: FileRule = {
  maxSize: 5 * 1024 * 1024,
  accept: IMAGE_TYPES,
  tooLarge: "Image trop lourde (5 Mo maximum).",
  badType: "Format non accepté. Déposez un JPG, un PNG ou un WebP.",
};

/** Contrainte du PDF d'un guide. Aligné sur TAL_Private_Uploads::GUIDE_MAX_SIZE. */
export const PDF_RULE: FileRule = {
  maxSize: 25 * 1024 * 1024,
  accept: ["application/pdf"],
  tooLarge: "PDF trop volumineux (25 Mo maximum).",
  badType: "Le guide doit être déposé au format PDF.",
};

/**
 * Champs texte d'un guide, transmis tels quels au plugin.
 *
 * Défini ici plutôt que dans le Route Handler : un fichier `route.ts` ne doit
 * exporter que ses verbes HTTP, Next.js refuse le reste à la compilation.
 */
export const GUIDE_FIELDS = [
  "title",
  "description",
  "content",
  "category",
  "kind",
  "format",
  "price",
  "pages",
  "status",
];
