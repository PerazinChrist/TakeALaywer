/**
 * Construction des événements de preuve sociale — module 8.2.
 *
 * Les messages sont dérivés de faits réels : un avis publié, un guide en tête
 * de la bibliothèque, un praticien connecté. C'est la différence avec la
 * maquette d'origine, dont les cinq messages figés se répétaient à l'identique
 * à chaque visite — au deuxième passage, le procédé se voyait, et le widget
 * cessait de rassurer pour devenir suspect.
 *
 * Ce module ne fabrique aucune activité qui n'a pas eu lieu. Quand la base est
 * vide, la liste l'est aussi et le widget ne s'affiche pas.
 */

import { groupDigits } from "@/lib/utils";
import type { SocialProofEvent } from "@/components/social-proof-toaster";
import type { DirectoryEntry, GuideSummary, PublicReview } from "@/lib/api/public";

export function buildSocialProof({
  reviews,
  guides,
  lawyers,
}: {
  reviews: PublicReview[];
  guides: GuideSummary[];
  lawyers: DirectoryEntry[];
}): SocialProofEvent[] {
  const events: SocialProofEvent[] = [];

  for (const review of reviews.slice(0, 3)) {
    events.push({
      id: `review-${review.id}`,
      message: `Nouvel avis ${review.rating}/5 pour ${review.lawyer.name}`,
      // La date relative vient du serveur : « il y a 3 jours », pas un compte à
      // rebours inventé côté navigateur.
      detail: review.date,
      tone: "review",
    });
  }

  for (const guide of guides.slice(0, 2)) {
    events.push({
      id: `guide-${guide.id}`,
      message: guide.free
        ? `Le guide « ${guide.title} » est en lecture libre`
        : `« ${guide.title} » : ${groupDigits(guide.downloads)} lectures`,
      detail: guide.category,
      tone: "purchase",
    });
  }

  const online = lawyers.filter((lawyer) => lawyer.online);

  if (online.length > 0) {
    events.push({
      id: "online",
      message: `${online.length} ${online.length > 1 ? "praticiens sont connectés" : "praticien est connecté"} en ce moment`,
      detail: "à l’instant",
      tone: "consult",
    });
  }

  return events;
}
