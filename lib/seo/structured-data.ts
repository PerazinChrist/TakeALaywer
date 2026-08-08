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
    /*
     * Un cabinet n'est pas une personne.
     *
     * Typer « Cabinet Mbala Ngassa » en `Person` avec `jobTitle: "Avocat"`
     * produisait un balisage faux : une entité collective décrite comme un
     * individu exerçant. Sur un site YMYL, la paternité est précisément ce que
     * Google examine — se tromper sur la nature de l'auteur y coûte plus cher
     * qu'ailleurs.
     */
    author:
      guide.author.type === "cabinet"
        ? {
            "@type": "Organization",
            name: guide.author.name,
            url: absoluteUrl(`/avocats/${guide.author.slug}`),
          }
        : {
            "@type": "Person",
            name: guide.author.name,
            url: absoluteUrl(`/avocats/${guide.author.slug}`),
            jobTitle: "Avocat",
          },
    /*
     * L'éditeur est décrit sur place, et non par une simple référence `@id`.
     *
     * Le nœud `Organization` n'est défini que sur l'accueil ; or Google évalue
     * chaque page isolément. Un `@id` seul y désigne donc un nœud fantôme, sans
     * type ni nom — le balisage paraît valide et ne référence rien.
     */
    publisher: {
      "@type": "Organization",
      "@id": ORGANISATION_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
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
 * `LegalService` et non `Attorney` : schema.org marque ce dernier comme
 * déprécié, `supersededBy` pointant explicitement vers `LegalService`, jugé
 * « plus inclusif et moins ambigu ». Le type déprécié continue d'être compris,
 * mais bâtir un annuaire entier dessus revient à parier sur une ressource que
 * son mainteneur a déjà rangée au placard.
 *
 * Un praticien indépendant reçoit en plus un nœud `Person` : c'est une personne
 * qui prête serment et engage sa responsabilité, pas un établissement. Le
 * cabinet, lui, n'est qu'un service. Cette distinction est précisément ce que
 * `Attorney` ne permettait pas d'exprimer.
 *
 * La note moyenne n'est incluse que s'il existe réellement des avis publiés :
 * un `aggregateRating` sans avis est le premier motif de rejet des résultats
 * enrichis.
 */
export function lawyerLd(profile: LawyerProfile): Record<string, unknown> {
  const url = absoluteUrl(`/avocats/${profile.slug}`);
  const individual = profile.type === "individuel";

  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${url}#praticien`,
    name: profile.name,
    description: profile.headline,
    url,
    image: profile.avatarUrl ?? undefined,
    areaServed: profile.city,
    availableLanguage: profile.languages,
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.address || undefined,
      addressLocality: profile.city,
      addressCountry: "CM",
    },
    ...(individual
      ? {
          employee: {
            "@type": "Person",
            name: profile.name,
            jobTitle: "Avocat",
            knowsAbout: profile.specialties,
            knowsLanguage: profile.languages,
            memberOf: { "@type": "Organization", name: profile.bar },
          },
        }
      : {}),
    // `knowsAbout` porte les domaines d'exercice : c'est le champ que les
    // moteurs génératifs exploitent pour répondre « quel avocat pour… ».
    knowsAbout: profile.specialties,
    memberOf: { "@type": "Organization", name: profile.bar },
    /*
     * Pas de `parentOrganization` vers TakeALawyer : la plateforme référence ce
     * praticien, elle ne le détient pas. L'affirmer reviendrait à déclarer que
     * chaque avocat de l'annuaire est une filiale — faux sur le fond, et
     * trompeur sur la nature d'un annuaire indépendant.
     */
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

/**
 * Page thématique regroupant plusieurs fiches.
 *
 * `CollectionPage` dit ce qu'une page de domaine est réellement : un point
 * d'entrée éditorial vers un ensemble, et non un article. Sans ce type, un
 * moteur hésite entre les deux et n'accorde à la page ni la crédibilité d'un
 * contenu rédigé, ni la structure d'un index.
 */
export function collectionLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name,
    description,
    url,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: SITE_NAME },
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
