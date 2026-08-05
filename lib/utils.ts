/**
 * Concatenation conditionnelle de classes.
 * Equivalent minimal de `clsx` (non installe dans ce projet).
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Montant en francs CFA : 250 -> « 250 FCFA », 2500 -> « 2 500 FCFA ».
 * Groupement fait a la main plutot que par `toLocaleString` : le resultat doit
 * etre identique sur le serveur et dans le navigateur (pas de dependance a
 * l'ICU installe), sinon l'hydratation signale une divergence.
 */
export function formatFcfa(amount: number, { short = false } = {}) {
  return `${groupDigits(amount)} ${short ? "F" : "FCFA"}`;
}

/**
 * Entier avec separateur de milliers : 4015 -> « 4 015 ».
 *
 * Meme raison que `formatFcfa` de ne pas passer par `toLocaleString` : le
 * resultat doit etre identique sur le serveur et dans le navigateur.
 */
export function groupDigits(value: number) {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Transforme une liste de facettes en table de correspondance.
 *
 * Les composants interrogent un domaine par son libelle (« Droit du travail »)
 * plutot que de parcourir un tableau a chaque rendu.
 *
 * Vit ici et non dans `lib/api/public` : ce dernier est un module serveur — il
 * lit les cookies et les variables d'environnement — et des composants clients
 * ont besoin de cette fonction. L'y laisser tirait tout le module dans le
 * bundle du navigateur, ce que le bundler refuse.
 */
export function facetMap(facets: { value: string; total: number }[]) {
  return Object.fromEntries(facets.map((facet) => [facet.value, facet.total]));
}
