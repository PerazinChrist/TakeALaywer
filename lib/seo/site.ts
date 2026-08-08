/**
 * Identité du site pour les moteurs de recherche.
 *
 * Une seule source de vérité pour l'adresse publique. Elle sert au
 * `metadataBase` du layout, aux URL canoniques, au sitemap, au robots.txt et
 * aux données structurées — cinq endroits qui doivent impérativement annoncer
 * le même domaine. Deux valeurs divergentes, et Google reçoit une canonique qui
 * pointe ailleurs que le sitemap : il choisit alors lui-même, souvent mal.
 */

/** Adresse servie si la variable d'environnement est absente ou inexploitable. */
const FALLBACK_URL = "https://takealawyer.com";

/**
 * Adresse publique du site, sans slash final.
 *
 * `NEXT_PUBLIC_SITE_URL` permet de la fixer au déploiement — indispensable le
 * jour où le site vit sur un domaine de préproduction, où il ne doit surtout
 * pas se déclarer canonique sous le domaine de production.
 */
export const SITE_URL = normalise(process.env.NEXT_PUBLIC_SITE_URL);

/**
 * Ramène une valeur saisie à la main à une URL absolue exploitable.
 *
 * Trois précautions, chacune pour une erreur déjà rencontrée :
 *
 * 1. **Le schéma est ajouté s'il manque.** « takealawyer.online » est ce qu'on
 *    écrit spontanément dans un champ « adresse du site » ; sans « https:// »,
 *    `new URL()` lève, et comme la valeur est lue à l'évaluation du module du
 *    layout, c'est *toutes* les pages du site qui tombent d'un coup sur un
 *    « Invalid URL » qui ne dit pas d'où il vient.
 * 2. **Le slash final est retiré**, pour ne jamais produire d'URL en `//`.
 * 3. **Une valeur illisible retombe sur le domaine par défaut** plutôt que de
 *    faire échouer le rendu. Un mauvais domaine dans une canonique est un
 *    problème de référencement ; un site entier en erreur est un problème tout
 *    court.
 */
function normalise(raw: string | undefined): string {
  const value = (raw ?? "").trim();

  if (value === "") return FALLBACK_URL;

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(withScheme).origin;
  } catch {
    return FALLBACK_URL;
  }
}

/** Nom de marque, tel qu'il doit apparaître dans les titres et le balisage. */
export const SITE_NAME = "TakeALawyer";

/** Langue et région servies, au format attendu par Open Graph et Schema.org. */
export const SITE_LOCALE = "fr_FR";

/**
 * Compose une URL absolue à partir d'un chemin.
 *
 * Les données structurées et Open Graph n'acceptent pas d'URL relative : un
 * `/guides` brut y est ignoré en silence, ce qui est le pire des cas — le
 * balisage paraît valide et ne référence rien.
 */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
