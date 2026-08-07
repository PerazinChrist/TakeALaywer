/**
 * Props de la composition publicitaire.
 *
 * Tout ce qui est un *chiffre* est ici, et non en dur dans une scene. La
 * raison est ecrite noir sur blanc en tete de `lib/data/home.ts` : un chiffre
 * affiche doit venir de la base, une formulation doit venir du contenu de
 * marque. Melanger les deux, c'est finir par « publier 7 000 avocats sur un
 * annuaire qui en compte cent quatre-vingts » — sur le site c'est un bug, dans
 * une publicite c'est une allegation trompeuse.
 *
 * Les valeurs par defaut ci-dessous sont donc des ESPACES RESERVES destines a
 * l'apercu dans le Studio. Avant tout rendu diffuse, elles doivent etre
 * remplacees par les compteurs reels, par exemple via :
 *
 *   npx remotion render remotion/index.ts PubTakeALawyer out/pub.mp4 \
 *     --props='{"lawyersCount":182,"averageRating":4.8,"reviewsCount":641}'
 */

export type AdProps = {
  /** Nombre d'avocats reellement repertories (`PlatformStats.directory`). */
  lawyersCount: number;
  /** Note moyenne reelle (`PlatformStats.averageRating`). */
  averageRating: number;
  /** Nombre d'avis certifies (`PlatformStats.reviews`). */
  reviewsCount: number;

  /**
   * Praticien mis en scene sur la carte de la scene « confiance ».
   *
   * Volontairement fictif par defaut. Ne remplacez ce nom par celui d'un
   * avocat de l'annuaire qu'avec son accord ecrit : une fiche reelle utilisee
   * en publicite engage son image et sa deontologie, pas seulement la votre.
   */
  lawyerName: string;
  lawyerInitials: string;
  lawyerSpecialty: string;
  lawyerCity: string;
  lawyerResponseTime: string;
};

export const DEFAULT_AD_PROPS: AdProps = {
  lawyersCount: 180,
  averageRating: 4.8,
  reviewsCount: 640,

  lawyerName: "Me A. Mbarga",
  lawyerInitials: "AM",
  lawyerSpecialty: "Droit du travail",
  lawyerCity: "Douala",
  lawyerResponseTime: "Répond en moins de 2h",
};
