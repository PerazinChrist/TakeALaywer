/**
 * Mémoire du paiement en cours, côté navigateur.
 *
 * Module client — il ne touche qu'à `sessionStorage` et ne connaît aucune clé
 * d'API. Son rôle : le citoyen valide le débit sur son téléphone, pas dans le
 * navigateur, et il arrive qu'il quitte la page entre-temps. Retenir la
 * référence de la transaction permet à un retour sur la page de reprendre
 * l'attente au lieu de proposer un second paiement pour un guide déjà réglé.
 *
 * `sessionStorage` plutôt que `localStorage` : une référence oubliée là ne doit
 * pas ressurgir des semaines plus tard sur un poste partagé.
 *
 * Exposé sous la forme d'un « external store » (au sens de
 * `useSyncExternalStore`) plutôt que lu dans un effet : c'est bien un système
 * extérieur à React, et cette forme rend le rendu serveur explicite — il voit
 * toujours `null`, donc pas de divergence d'hydratation.
 */

import type { CollectStart } from "@/lib/api/types";

const PREFIX = "tal:campay:";

/** Abonnés locaux : un `storage` event ne se déclenche pas dans l'onglet émetteur. */
const listeners = new Set<() => void>();

function key(slug: string) {
  return `${PREFIX}${slug}`;
}

/** S'abonne aux changements, dans cet onglet comme dans les autres. */
export function subscribePendingPayment(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Instantané courant, sous forme de chaîne brute.
 *
 * `useSyncExternalStore` compare les instantanés par identité : renvoyer un
 * objet fraîchement analysé à chaque appel provoquerait une boucle de rendu
 * infinie. L'analyse JSON est donc laissée à l'appelant, qui la mémoïse.
 */
export function readPendingPayment(slug: string): string | null {
  try {
    return window.sessionStorage.getItem(key(slug));
  } catch {
    // Stockage refusé (navigation privée stricte, cookies tiers bloqués) : la
    // reprise est un confort, pas une garantie. Le paiement reste vérifiable
    // auprès de CamPay avec sa référence.
    return null;
  }
}

/** Instantané côté serveur : il n'y a pas de session de navigateur à lire. */
export function readPendingPaymentOnServer(): string | null {
  return null;
}

/** Analyse un instantané. Retourne null si la valeur est absente ou abîmée. */
export function parsePendingPayment(raw: string | null): CollectStart | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CollectStart;

    return typeof parsed?.reference === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/** Retient la transaction engagée pour ce guide. */
export function savePendingPayment(slug: string, started: CollectStart) {
  try {
    window.sessionStorage.setItem(key(slug), JSON.stringify(started));
  } catch {
    /* voir readPendingPayment */
  }

  notify();
}

/** Oublie la transaction — paiement abouti, échoué ou abandonné. */
export function clearPendingPayment(slug: string) {
  try {
    window.sessionStorage.removeItem(key(slug));
  } catch {
    /* voir readPendingPayment */
  }

  notify();
}

function notify() {
  for (const listener of listeners) listener();
}
