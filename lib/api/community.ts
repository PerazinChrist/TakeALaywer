/**
 * Lecture de l'espace communautaire, côté serveur.
 *
 * ⚠️ Module serveur : il importe `lib/api/server`, qui lit les variables
 * d'environnement. Ne jamais l'importer depuis un fichier « use client ».
 *
 * Même règle que `lib/api/public.ts` : rien ne lève. Le backend éteint rend une
 * liste vide, pas une page en erreur — l'espace communautaire est une page
 * publique, et une panne de WordPress ne doit pas la faire disparaître des
 * moteurs de recherche.
 *
 * Le jeton citoyen accompagne les lectures quand il existe : c'est lui qui fait
 * revenir `voted` et `isOwner`, donc le bouton « utile » dans le bon état et les
 * commandes de l'auteur sur son propre fil. Sans jeton, la route répond
 * exactement comme pour un visiteur anonyme.
 */

import { cache } from "react";
import { callWordPress } from "@/lib/api/server";
import { readClientToken } from "@/lib/api/session";
import type { NeedDetail, NeedsResult } from "@/lib/api/types";

export type NeedsQuery = {
  specialty?: string;
  city?: string;
  status?: string;
  search?: string;
  /** « recent », « active », « utiles », « vues » ou « sans_reponse ». */
  sort?: string;
  page?: number;
  perPage?: number;
  /** Demander les facettes : utile au premier rendu, inutile en pagination. */
  facets?: boolean;
};

const EMPTY: NeedsResult = { items: [], total: 0, pages: 0, page: 1, facets: null };

/** Index filtrable des problèmes publics — GET /needs. */
export async function fetchNeeds(query: NeedsQuery = {}): Promise<NeedsResult> {
  const page = Math.max(1, query.page ?? 1);

  const response = await callWordPress<NeedsResult>(
    withQuery("/needs", {
      specialty: query.specialty,
      city: query.city,
      status: query.status,
      search: query.search,
      sort: query.sort,
      page,
      per_page: query.perPage ?? 12,
      facets: query.facets ? 1 : undefined,
    }),
  );

  if (!response.ok || !response.data) return { ...EMPTY, page };

  return {
    items: Array.isArray(response.data.items) ? response.data.items : [],
    total: response.data.total ?? 0,
    pages: response.data.pages ?? 0,
    page,
    facets: response.data.facets ?? null,
  };
}

/**
 * Un problème et ses réponses — GET /needs/{slug}.
 *
 * ⚠️ Cette lecture a un effet de bord assumé : elle incrémente le compteur de
 * vues côté plugin. Elle est donc mémoïsée pour le rendu courant, faute de quoi
 * `generateMetadata` et la page compteraient deux visites pour une.
 */
export const fetchNeed = cache(async (slug: string): Promise<NeedDetail | null> => {
  const token = await readClientToken();

  const response = await callWordPress<NeedDetail>(`/needs/${encodeURIComponent(slug)}`, {
    token,
  });

  if (!response.ok || !response.data?.need) return null;

  return {
    need: response.data.need,
    replies: Array.isArray(response.data.replies) ? response.data.replies : [],
    voted: Array.isArray(response.data.voted) ? response.data.voted : [],
    isOwner: response.data.isOwner === true,
  };
});

/**
 * Assemble un chemin et sa chaîne de requête, en écartant les valeurs vides.
 *
 * Transmettre `?city=` ferait filtrer le backend sur une ville nommée « chaîne
 * vide » plutôt que de ne pas filtrer du tout.
 */
function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    search.set(key, String(value));
  }

  const query = search.toString();

  return query ? `${path}?${query}` : path;
}
