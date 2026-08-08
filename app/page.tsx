import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { HeroEpure } from "@/components/epure/hero-epure";
import { LawyersSpotlight } from "@/components/epure/lawyers-spotlight";
import { GuidesLibrary } from "@/components/epure/guides-library";
import { HowItWorksEpure } from "@/components/epure/how-it-works-epure";
import { fetchHome } from "@/lib/api/public";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";

/**
 * Page d'accueil.
 *
 * Quatre écrans, une seule idée par écran, beaucoup de vide autour des textes :
 *   1. Hero — le titre et les deux portes d'entrée.
 *   2. Avocats à la Une — carrousel des abonnés Premium / Pionnier.
 *   3. Bibliothèque — guides et modèles dès 250 FCFA.
 *   4. Comment ça marche — trois étapes puis trois garanties.
 */
export const metadata: Metadata = {
  // `absolute` court-circuite le gabarit « %s | TakeALawyer » du layout : sur
  // l'accueil, le nom de marque doit ouvrir le titre, pas le fermer.
  title: {
    absolute: "TakeALawyer — Trouvez un avocat vérifié au Cameroun",
  },
  description:
    "Trouvez un avocat inscrit au Barreau, posez votre question juridique gratuitement et anonymement, ou téléchargez un guide pratique rédigé par un avocat dès 250 FCFA.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "TakeALawyer — Trouvez un avocat vérifié au Cameroun",
    description:
      "Avocats et cabinets vérifiés, question juridique gratuite et anonyme, guides pratiques dès 250 FCFA.",
  },
};

/**
 * L'accueil lit la base à chaque requête : compteurs, annuaire, bibliothèque et
 * avis changent dès qu'un praticien publie ou qu'un avis est modéré. Une page
 * prérendue afficherait l'état du dernier déploiement.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await fetchHome();

  /*
   * Données structurées de l'accueil.
   *
   * Construites ici plutôt qu'en constante de module : les compteurs viennent
   * de la base, et un `aggregateRating` figé dans le code finirait par
   * contredire la page — ce que Google sanctionne comme balisage trompeur.
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organisation`,
        name: "TakeALawyer",
        url: SITE_URL,
        description:
          "Plateforme de mise en relation entre citoyens et avocats inscrits au Barreau, au Cameroun.",
        areaServed: { "@type": "Country", name: "Cameroun" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        url: SITE_URL,
        name: "TakeALawyer",
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE_URL}/#organisation` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: absoluteUrl("/avocats?q={search_term_string}"),
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <SiteHeaderEpure />

      {/* La marge basse laisse la place à la barre d'action mobile. */}
      <main id="contenu" className="pb-24 lg:pb-0">
        <HeroEpure lawyers={home.lawyers} guides={home.guides} stats={home.stats} />
        <LawyersSpotlight lawyers={home.lawyers} stats={home.stats} />
        <GuidesLibrary guides={home.guides} stats={home.stats} />
        <HowItWorksEpure />
      </main>

      <SiteFooter />

      <MobileActionBar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
