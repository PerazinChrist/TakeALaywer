/**
 * Lecture du compte connecté, côté serveur.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 */

import { cache } from "react";
import { callWordPress } from "@/lib/api/server";
import { readSessionToken } from "@/lib/api/session";
import type { MeResult, ReviewsResult } from "@/lib/api/types";

/**
 * Retourne le compte associé au cookie de session.
 *
 * Le jeton n'est pas cru sur parole : il est présenté à WordPress, qui vérifie
 * qu'il n'a pas expiré et que le compte n'a pas été suspendu entre-temps. Un
 * cookie encore présent après une suspension ne doit rien ouvrir.
 *
 * Mémoïsé par `cache()` : l'en-tête, la page et ses éventuels enfants
 * l'appellent tous pendant le même rendu, et une seule requête part vers
 * WordPress. Sans cookie, aucune requête n'est émise du tout — les pages
 * publiques ne paient rien.
 *
 * @returns Le compte, sa vitrine et ses justificatifs — ou null si la session
 *          est absente, expirée ou révoquée.
 */
export const fetchCurrentAccount = cache(async (): Promise<MeResult | null> => {
  const token = await readSessionToken();

  if (!token) return null;

  const result = await callWordPress<MeResult>("/auth/me", { token });

  return result.ok && result.data ? result.data : null;
});

/** Avis reçus, statuts de modération compris. */
const NO_REVIEWS: ReviewsResult = {
  items: [],
  counts: { en_attente: 0, publie: 0, rejete: 0 },
  average: 0,
};

/**
 * Retourne les avis du praticien connecté.
 *
 * Distinct de `fetchCurrentAccount` : `/auth/me` ne porte que la vitrine, donc
 * les seuls avis publiés. Le praticien doit aussi voir ceux qui sont encore en
 * modération — découvrir un avis le jour de sa publication ne laisse aucune
 * chance d'y préparer une réponse.
 */
export const fetchMyReviews = cache(async (): Promise<ReviewsResult> => {
  const token = await readSessionToken();

  if (!token) return NO_REVIEWS;

  const result = await callWordPress<ReviewsResult>("/me/reviews", { token });

  return result.ok && result.data
    ? { ...NO_REVIEWS, ...result.data, counts: { ...NO_REVIEWS.counts, ...result.data.counts } }
    : NO_REVIEWS;
});
