/**
 * Lecture des pages publiques : annuaire, bibliothèque de guides, preuve sociale.
 *
 * ⚠️ Module serveur : il importe `lib/api/server`, qui lit les variables
 * d'environnement. Ne jamais l'importer depuis un fichier « use client ».
 *
 * Toutes les fonctions retournent une valeur exploitable même quand le backend
 * est éteint. C'est délibéré : la page d'accueil doit rester servie si XAMPP
 * n'est pas lancé, sinon le développement frontend devient impossible dès que
 * WordPress tousse. Les listes reviennent vides, les compteurs à zéro, et les
 * composants savent l'afficher.
 */

import { cache } from "react";
import { callWordPress } from "@/lib/api/server";
import { readClientToken } from "@/lib/api/session";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Une facette de filtre, avec son effectif réel. */
export type Facet = { value: string; total: number };

/** Compteurs de la plateforme — barre de réassurance (module 8.2). */
export type PlatformStats = {
  /** Avocats indépendants vérifiés et publiés. */
  lawyers: number;
  /** Cabinets vérifiés et publiés. */
  firms: number;
  /** Total des fiches visibles dans l'annuaire. */
  directory: number;
  /** Comptes en attente de vérification. */
  pending: number;
  /** Citoyens actifs. */
  clients: number;
  /** Guides publiés et accessibles. */
  guides: number;
  /** Avis publiés après modération. */
  reviews: number;
  averageRating: number;
  cities: number;
  specialties: number;
};

/** Carte d'annuaire — la forme renvoyée par GET /lawyers. */
export type DirectoryEntry = {
  slug: string;
  type: "individuel" | "cabinet";
  name: string;
  subtitle: string;
  initials: string;
  coverTone: string;
  avatarUrl: string | null;
  headline: string;
  bar: string;
  city: string;
  district: string;
  memberSince: string;
  rating: number;
  reviewsCount: number;
  consultations: string;
  responseTime: string;
  plan: "essentiel" | "premium" | "pionnier";
  specialties: string[];
  languages: string[];
  /** Guides publiés — sert le badge « Expert auteur ». */
  guidesCount: number;
  /** Connecté dans le dernier quart d'heure. */
  online: boolean;
  headcount?: number;
};

export type DirectoryResult = {
  items: DirectoryEntry[];
  total: number;
  pages: number;
  page: number;
  facets: {
    cities: Facet[];
    bars: Facet[];
    types: Facet[];
    specialties: Facet[];
  } | null;
};

/** Auteur affiché sur une carte de guide, hors de sa vitrine. */
export type GuideAuthor = {
  slug: string;
  name: string;
  initials: string;
  type: "individuel" | "cabinet";
  city: string;
  avatarUrl: string | null;
  rating: number;
  verified: boolean;
  headline?: string;
  reviewsCount?: number;
  responseTime?: string;
};

export type GuideSummary = {
  id: string;
  slug: string;
  kind: "guide" | "modele";
  format: "pdf" | "texte";
  title: string;
  description: string;
  category: string;
  price: number;
  free: boolean;
  pages: number;
  downloads: number;
  coverUrl: string | null;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  author: GuideAuthor;
};

/** Contenu servi au lecteur, une fois la coupe du paywall appliquée. */
export type GuideReading = {
  /** HTML réellement livré. Sur un guide payant, c'est déjà l'extrait. */
  html: string;
  locked: boolean;
  /** Part du texte livrée, en pourcentage — calculée, pas annoncée. */
  previewRatio: number;
  words: number;
  readingTime: number;
  outline: { title: string; locked: boolean }[];
  hiddenParts: number;
};

export type GuideDetail = Omit<GuideSummary, "readingTime"> & {
  reading: GuideReading;
  related: GuideSummary[];
  /**
   * Le lecteur connecté possède ce guide.
   *
   * Distinct de `!reading.locked`, qui vaut aussi pour un guide gratuit : c'est
   * ce booléen qui distingue « en accès libre » de « vous l'avez acheté ».
   */
  owned: boolean;
};

export type GuidesResult = {
  items: GuideSummary[];
  total: number;
  pages: number;
  page: number;
  facets: { categories: Facet[] } | null;
};

/** Avis certifié, avec le praticien qu'il concerne. */
export type PublicReview = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  context: string;
  quote: string;
  reply: string | null;
  certified: boolean;
  city: string;
  lawyer: { slug: string; name: string; type: "individuel" | "cabinet" };
};

export type Facets = {
  cities: Facet[];
  bars: Facet[];
  types: Facet[];
  specialties: Facet[];
};

export type HomePayload = {
  stats: PlatformStats;
  /** Effectifs réels par domaine, ville et barreau. */
  facets: Facets;
  /** Guide payant mis en scène derrière le paywall. Null si aucun n'existe. */
  featured: GuideDetail | null;
  lawyers: DirectoryEntry[];
  guides: GuideSummary[];
  reviews: PublicReview[];
};

export const emptyFacets: Facets = { cities: [], bars: [], types: [], specialties: [] };

/* -------------------------------------------------------------------------- */
/* Valeurs de repli                                                           */
/* -------------------------------------------------------------------------- */

export const emptyStats: PlatformStats = {
  lawyers: 0,
  firms: 0,
  directory: 0,
  pending: 0,
  clients: 0,
  guides: 0,
  reviews: 0,
  averageRating: 0,
  cities: 0,
  specialties: 0,
};

/* -------------------------------------------------------------------------- */
/* Lectures                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Tout ce dont la page d'accueil a besoin, en un seul aller-retour.
 *
 * Mémoïsé pour le rendu courant : plusieurs sections de la page appellent cette
 * fonction, et chacune ne doit pas déclencher sa propre requête HTTP.
 */
export const fetchHome = cache(async (): Promise<HomePayload> => {
  const response = await callWordPress<HomePayload>("/home");

  if (!response.ok || !response.data) {
    return {
      stats: emptyStats,
      facets: emptyFacets,
      featured: null,
      lawyers: [],
      guides: [],
      reviews: [],
    };
  }

  const data = response.data;

  return {
    stats: { ...emptyStats, ...(data.stats ?? {}) },
    facets: { ...emptyFacets, ...(data.facets ?? {}) },
    // `/home` sert le guide vedette à tout le monde, sans jeton : il est
    // toujours vu comme non possédé, ce que le repli rend explicite.
    featured: data.featured ? { ...data.featured, owned: false } : null,
    lawyers: Array.isArray(data.lawyers) ? data.lawyers : [],
    guides: Array.isArray(data.guides) ? data.guides : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
  };
});

/** Compteurs seuls, pour les pages qui n'ont pas besoin du reste. */
export const fetchStats = cache(async (): Promise<PlatformStats> => {
  const response = await callWordPress<PlatformStats>("/stats");

  return response.ok && response.data ? { ...emptyStats, ...response.data } : emptyStats;
});

/** Paramètres de recherche de l'annuaire, tels qu'ils viennent de l'URL. */
export type DirectoryQuery = {
  specialty?: string;
  city?: string;
  bar?: string;
  type?: string;
  plan?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  /** Demander les facettes : utile au premier rendu, inutile en pagination. */
  facets?: boolean;
};

/** Annuaire filtrable — GET /lawyers. */
export async function fetchDirectory(query: DirectoryQuery = {}): Promise<DirectoryResult> {
  const page = Math.max(1, query.page ?? 1);

  const response = await callWordPress<DirectoryResult>(
    withQuery("/lawyers", {
      specialty: query.specialty,
      city: query.city,
      bar: query.bar,
      type: query.type,
      plan: query.plan,
      search: query.search,
      sort: query.sort,
      page,
      per_page: query.perPage ?? 12,
      facets: query.facets ? 1 : undefined,
    }),
  );

  if (!response.ok || !response.data) {
    return { items: [], total: 0, pages: 0, page, facets: null };
  }

  return {
    items: Array.isArray(response.data.items) ? response.data.items : [],
    total: response.data.total ?? 0,
    pages: response.data.pages ?? 0,
    page,
    facets: response.data.facets ?? null,
  };
}

export type GuidesQuery = {
  category?: string;
  kind?: string;
  access?: string;
  author?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  facets?: boolean;
};

/** Bibliothèque filtrable — GET /guides. */
export async function fetchGuides(query: GuidesQuery = {}): Promise<GuidesResult> {
  const page = Math.max(1, query.page ?? 1);

  const response = await callWordPress<GuidesResult>(
    withQuery("/guides", {
      category: query.category,
      kind: query.kind,
      access: query.access,
      author: query.author,
      search: query.search,
      sort: query.sort,
      page,
      per_page: query.perPage ?? 12,
      facets: query.facets ? 1 : undefined,
    }),
  );

  if (!response.ok || !response.data) {
    return { items: [], total: 0, pages: 0, page, facets: null };
  }

  return {
    items: Array.isArray(response.data.items) ? response.data.items : [],
    total: response.data.total ?? 0,
    pages: response.data.pages ?? 0,
    page,
    facets: response.data.facets ?? null,
  };
}

/**
 * Lecture d'un guide — GET /guides/{slug}.
 *
 * Le contenu reçu est déjà celui auquel le visiteur a droit : sur un guide
 * payant, l'API n'envoie que l'extrait. Le front n'a donc rien à masquer, et
 * rien à protéger.
 *
 * Le jeton citoyen accompagne la requête quand il existe : c'est lui qui fait
 * envoyer le texte entier à qui a payé le guide. La route reste publique — sans
 * jeton, elle répond exactement comme avant.
 */
export const fetchGuide = cache(async (slug: string): Promise<GuideDetail | null> => {
  const token = await readClientToken();

  const response = await callWordPress<GuideDetail>(`/guides/${encodeURIComponent(slug)}`, {
    token,
  });

  if (!response.ok || !response.data) return null;

  // Les installations antérieures à la 1.3.0 du plugin ne renvoient pas
  // « owned » : sans ce repli, la page afficherait « vous possédez ce guide »
  // sur la foi d'un undefined.
  return { ...response.data, owned: response.data.owned === true };
});

/** Derniers avis certifiés — GET /reviews. */
export async function fetchReviews(limit = 6, minRating = 4): Promise<PublicReview[]> {
  const response = await callWordPress<{ items: PublicReview[] }>(
    withQuery("/reviews", { limit, min_rating: minRating }),
  );

  return response.ok && Array.isArray(response.data?.items) ? response.data.items : [];
}

/* -------------------------------------------------------------------------- */
/* Utilitaires                                                                */
/* -------------------------------------------------------------------------- */

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
