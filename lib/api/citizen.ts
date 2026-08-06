/**
 * Lecture du compte citoyen connecté, côté serveur.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 *
 * Pendant du module `lib/api/account.ts`, qui fait le même travail pour les
 * praticiens. Deux modules plutôt qu'un : ils lisent deux cookies différents et
 * appellent deux familles d'endpoints, et les confondre reviendrait à laisser
 * une page citoyenne s'ouvrir sur une session d'avocat.
 */

import { cache } from "react";
import { callWordPress } from "@/lib/api/server";
import { readClientToken } from "@/lib/api/session";
import type { CheckoutOrder, ClientMeResult, ClientStats } from "@/lib/api/types";

/**
 * Retourne l'espace personnel associé au cookie citoyen.
 *
 * Le jeton n'est pas cru sur parole : il est présenté à WordPress, qui vérifie
 * qu'il n'a pas expiré et que le compte n'a pas été suspendu entre-temps.
 *
 * Mémoïsé par `cache()` : l'en-tête et la page l'appellent tous deux pendant le
 * même rendu, et une seule requête part vers WordPress. Sans cookie, aucune
 * requête n'est émise — les pages publiques ne paient rien.
 *
 * @returns L'espace complet (profil, achats, avis, journal), ou null si la
 *          session est absente, expirée ou révoquée.
 */
export const fetchCurrentClient = cache(async (): Promise<ClientMeResult | null> => {
  const token = await readClientToken();

  if (!token) return null;

  const result = await callWordPress<ClientMeResult>("/client/me", { token });

  if (!result.ok || !result.data) return null;

  // Les listes et les compteurs sont normalisés ici plutôt que dans chaque
  // composant : une panne partielle du backend ne doit pas faire tomber la page
  // sur un `.map` appliqué à undefined. Le transtypage en Partial est ce qui
  // rend les valeurs par défaut utiles — le type déclaré, lui, promet des
  // champs que la réponse peut très bien ne pas porter.
  const stats = (result.data.stats ?? {}) as Partial<ClientStats>;

  return {
    client: result.data.client,
    stats: { purchases: 0, spent: 0, reviews: 0, ...stats },
    purchases: Array.isArray(result.data.purchases) ? result.data.purchases : [],
    reviews: Array.isArray(result.data.reviews) ? result.data.reviews : [],
    activity: Array.isArray(result.data.activity) ? result.data.activity : [],
    // Les quatre champs ci-dessous sont apparus avec la 1.4.0 du plugin : une
    // installation plus ancienne ne les renvoie pas, et l'espace personnel ne
    // doit pas tomber sur un `.map` appliqué à undefined.
    needs: Array.isArray(result.data.needs) ? result.data.needs : [],
    bookings: Array.isArray(result.data.bookings) ? result.data.bookings : [],
    conversations: Array.isArray(result.data.conversations) ? result.data.conversations : [],
    notifications: result.data.notifications ?? 0,
  };
});

/**
 * Récapitulatif d'achat d'un guide — GET /client/guides/{slug}/checkout.
 *
 * Cette lecture ne débite rien et n'ouvre rien : elle décrit la commande — quel
 * guide, quel montant, quels moyens de paiement — pour que la page de paiement
 * ait quelque chose de vrai à afficher. Le débit reste le fait du déblocage,
 * confirmé après le choix du moyen de paiement.
 *
 * @returns L'ordre, ou null si le visiteur n'est pas connecté ou si le guide
 *          n'est plus publié.
 */
export async function fetchCheckout(slug: string): Promise<CheckoutOrder | null> {
  const token = await readClientToken();

  if (!token) return null;

  const result = await callWordPress<CheckoutOrder>(
    `/client/guides/${encodeURIComponent(slug)}/checkout`,
    { token },
  );

  if (!result.ok || !result.data?.guide) return null;

  return {
    ...result.data,
    methods: Array.isArray(result.data.methods) ? result.data.methods : [],
  };
}

/**
 * Indique si le visiteur possède un guide donné.
 *
 * Sert au bouton de déblocage de la page de lecture. La question est posée à la
 * bibliothèque déjà chargée plutôt qu'au backend : `fetchCurrentClient` est
 * mémoïsé pour le rendu, donc cette réponse ne coûte aucune requête de plus.
 */
export async function ownsGuide(slug: string): Promise<boolean> {
  const session = await fetchCurrentClient();

  if (!session) return false;

  return session.purchases.some(
    (purchase) => purchase.slug === slug && purchase.status === "paye",
  );
}
