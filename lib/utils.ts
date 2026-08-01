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
  const grouped = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} ${short ? "F" : "FCFA"}`;
}
