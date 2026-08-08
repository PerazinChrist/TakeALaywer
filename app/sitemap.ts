import type { MetadataRoute } from "next";
import { practiceAreas } from "@/lib/data/practice-areas";
import { fetchDirectory, fetchGuides } from "@/lib/api/public";
import { fetchNeeds } from "@/lib/api/community";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Plan du site.
 *
 * Il déclare quatre familles d'URL : les pages fixes, les vitrines d'avocats,
 * les guides et les questions de l'espace communautaire. Ces trois dernières
 * naissent en base et n'existent nulle part dans le code — sans plan du site,
 * un moteur ne les découvre qu'en suivant la pagination de l'annuaire, ce qui
 * laisse les vitrines récentes non explorées pendant des semaines.
 *
 * Les priorités sont volontairement peu contrastées. Google les ignore depuis
 * longtemps ; seule la présence de l'URL compte vraiment, et `lastModified`
 * sert d'indice de fraîcheur.
 *
 * ## Pages exclues
 *
 * Rien de privé n'y figure — espaces personnels, messagerie, notifications,
 * tunnels d'achat et pages de connexion portent déjà `robots: noindex`. Les
 * inscrire ici enverrait un signal contradictoire : « explore cette page » d'un
 * côté, « ne l'indexe pas » de l'autre.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = ([
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/avocats`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/domaines`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/communaute`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/comment-ca-marche`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/tarifs`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/avocats/inscription`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/besoin/nouveau`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cgu`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/charte-deontologique`, changeFrequency: "yearly", priority: 0.3 },
  ] satisfies MetadataRoute.Sitemap).map((entry) => ({ ...entry, lastModified: now }));

  const areaEntries: MetadataRoute.Sitemap = practiceAreas.map((area) => ({
    url: `${SITE_URL}/domaines/${area.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  /*
   * Les trois listes partent ensemble : une panne du backend ne doit pas
   * retarder les deux autres. Chacune se rabat sur une liste vide plutôt que de
   * faire échouer le plan entier — un sitemap amputé vaut mieux qu'un 500, qui
   * ferait retirer l'ensemble des URL déjà connues.
   */
  const [lawyers, guides, needs] = await Promise.all([
    fetchDirectory({ perPage: 200 }).catch(() => null),
    fetchGuides({ perPage: 200 }).catch(() => null),
    fetchNeeds({ perPage: 200 }).catch(() => null),
  ]);

  const lawyerEntries: MetadataRoute.Sitemap = (lawyers?.items ?? []).map((lawyer) => ({
    url: `${SITE_URL}/avocats/${lawyer.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guideEntries: MetadataRoute.Sitemap = (guides?.items ?? []).map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    // Date réelle de dernière modification du document : c'est elle qui décide
    // du réexamen, et l'inventer daterait tout le catalogue d'aujourd'hui.
    lastModified: parseDate(guide.publishedAt) ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const needEntries: MetadataRoute.Sitemap = (needs?.items ?? []).map((need) => ({
    url: `${SITE_URL}/communaute/${need.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...areaEntries,
    ...lawyerEntries,
    ...guideEntries,
    ...needEntries,
  ];
}

/** Date exploitable, ou null si la valeur ne s'analyse pas. */
function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
