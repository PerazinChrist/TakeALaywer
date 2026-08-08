/**
 * Données structurées Schema.org.
 *
 * Un moteur lit une page d'avocat comme du texte ; ce balisage lui dit que
 * c'est un professionnel du droit, dans quelle ville, avec quelle note et quels
 * domaines. C'est ce qui rend une vitrine éligible aux résultats enrichis, et
 * c'est aussi ce que les moteurs génératifs citent en priorité, parce que le
 * fait y est explicite plutôt qu'à déduire d'une phrase.
 *
 * Règle tenue partout ici : **ne jamais baliser ce que la page n'affiche pas**.
 * Un avis, une note ou un prix présents dans le JSON-LD mais absents à l'écran
 * sont un motif de sanction manuelle, et la tentation est grande puisque
 * personne ne le voit.
 */

import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/site";
import type { DirectoryEntry, GuideSummary } from "@/lib/api/public";
import type { LawyerProfile } from "@/lib/data/lawyer-profile";

/** Nœud de l'organisation, référencé par les autres balisages. */
export const ORGANISATION_ID = `${SITE_URL}/#organisation`;

/**
 * Fil d'Ariane.
 *
 * Il remplace l'URL par le chemin de navigation dans les résultats de
 * recherche. Sur des adresses longues comme `/guides/{slug}`, c'est la
 * différence entre une ligne lisible et une suite de tirets.
 */
export function breadcrumbLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Guide juridique — un article signé.
 *
 * `Article` plutôt que `Product`, même sur un guide payant : ce qui est vendu
 * est une lecture, et c'est la paternité — l'avocat auteur, inscrit à un
 * barreau — qui fait la valeur de la page aux yeux d'un moteur. `isAccessible
 * ForFree` et `hasPart` disent honnêtement qu'une partie est réservée ; sans
 * eux, Google constate un contenu tronqué et tient la page pour du camouflage.
 */
export function guideLd(
  // La durée de lecture ne sert pas au balisage : l'accepter absente permet de
  // baliser aussi bien une carte d'index (`GuideSummary`) qu'une page de
  // lecture (`GuideDetail`, qui la porte dans son bloc `reading`).
  guide: Omit<GuideSummary, "readingTime">,
): Record<string, unknown> {
  const url = absoluteUrl(`/guides/${guide.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: guide.title,
    description: guide.description,
    url,
    inLanguage: "fr-FR",
    datePublished: guide.publishedAt || undefined,
    articleSection: guide.category,
    isAccessibleForFree: guide.free,
    author: {
      "@type": "Person",
      name: guide.author.name,
      url: absoluteUrl(`/avocats/${guide.author.slug}`),
      jobTitle: "Avocat",
    },
    publisher: { "@id": ORGANISATION_ID },
    ...(guide.free
      ? {}
      : {
          hasPart: {
            "@type": "WebPageElement",
            isAccessibleForFree: false,
            // Le sélecteur doit désigner le bloc réellement masqué : c'est lui
            // que Google compare à ce qu'il reçoit. Il correspond à la classe
            // portée par `GuidePaywall` — les deux doivent bouger ensemble.
            cssSelector: ".guide-paywalled",
          },
        }),
  };
}

/**
 * Avocat ou cabinet.
 *
 * `Attorney` est la spécialisation de `LegalService` reconnue par Google pour
 * les professionnels du droit. La note moyenne n'est incluse que s'il existe
 * réellement des avis publiés : un `aggregateRating` sans avis est le premier
 * motif de rejet des résultats enrichis.
 */
export function lawyerLd(profile: LawyerProfile): Record<string, unknown> {
  const url = absoluteUrl(`/avocats/${profile.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Attorney",
    "@id": `${url}#praticien`,
    name: profile.name,
    description: profile.headline,
    url,
    image: profile.avatarUrl ?? undefined,
    areaServed: profile.city,
    knowsLanguage: profile.languages,
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.address || undefined,
      addressLocality: profile.city,
      addressCountry: "CM",
    },
    // `knowsAbout` porte les domaines d'exercice : c'est le champ que les
    // moteurs génératifs exploitent pour répondre « quel avocat pour… ».
    knowsAbout: profile.specialties,
    memberOf: { "@type": "Organization", name: profile.bar },
    parentOrganization: { "@id": ORGANISATION_ID },
    ...(profile.reviewsCount > 0 && profile.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile.rating,
            reviewCount: profile.reviewsCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/**
 * Liste d'un index (annuaire, bibliothèque).
 *
 * `ItemList` dit au moteur que la page est un point d'entrée vers N fiches, et
 * lui donne leur ordre. Sans elle, un index n'est qu'un long document dont il
 * doit deviner la structure.
 */
export function itemListLd(
  name: string,
  paths: string[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: paths.length,
    itemListElement: paths.map((path, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(path),
    })),
  };
}

/** Raccourci : chemins des vitrines d'un annuaire. */
export function directoryPaths(entries: DirectoryEntry[]): string[] {
  return entries.map((entry) => `/avocats/${entry.slug}`);
}

/** Questions fréquentes, pour les pages qui en affichent réellement. */
export function faqLd(
  entries: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `Questions fréquentes — ${SITE_NAME}`,
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
