import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { HeroSection } from "@/components/home/hero-section";
import { SearchBand } from "@/components/home/search-band";
import { TrustBanner } from "@/components/home/trust-banner";
import { NeedCards } from "@/components/home/need-cards";
import { QuickDiagnostic } from "@/components/home/quick-diagnostic";
import { HowItWorks } from "@/components/home/how-it-works";
import { PopularArticles } from "@/components/home/popular-articles";
import { FeaturedLawyers } from "@/components/home/featured-lawyers";
import { Testimonials } from "@/components/home/testimonials";
import { LawyerCta } from "@/components/home/lawyer-cta";
import { SocialProofToaster } from "@/components/social-proof-toaster";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { fetchCurrentAccount } from "@/lib/api/account";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { fetchHome } from "@/lib/api/public";
import { buildSocialProof } from "@/lib/data/social-proof";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Donnees structurees — module 3.3 (optimisation SEO). */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://takealawyer.com/#organisation",
      name: "TakeALawyer",
      description:
        "Plateforme de mise en relation entre citoyens et avocats inscrits au Barreau.",
      url: "https://takealawyer.com",
    },
    {
      "@type": "WebSite",
      "@id": "https://takealawyer.com/#site",
      url: "https://takealawyer.com",
      name: "TakeALawyer",
      inLanguage: "fr-FR",
      publisher: { "@id": "https://takealawyer.com/#organisation" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://takealawyer.com/avocats?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/**
 * L'accueil lit la base à chaque requête : compteurs, annuaire, bibliothèque et
 * avis changent dès qu'un praticien publie ou qu'un avis est modéré. Une page
 * prérendue afficherait l'état du dernier déploiement.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // L'en-tête est un composant client : il ne peut pas lire les cookies de
  // session lui-même, on les lui transmet depuis le rendu serveur.
  const [isSignedIn, clientSignedIn, home] = await Promise.all([
    fetchCurrentAccount().then(Boolean),
    fetchCurrentClient().then(Boolean),
    fetchHome(),
  ]);

  return (
    <>
      <SiteHeader isSignedIn={isSignedIn} clientSignedIn={clientSignedIn} />

      {/* La marge basse laisse la place a la barre d'action mobile. */}
      <main id="contenu" className="pb-24 lg:pb-0">
        <HeroSection lawyers={home.lawyers} stats={home.stats} />
        <SearchBand />
        <TrustBanner stats={home.stats} />
        <NeedCards specialties={home.facets.specialties} />
        <QuickDiagnostic specialties={home.facets.specialties} stats={home.stats} />
        <HowItWorks />
        <PopularArticles featured={home.featured} guides={home.guides} stats={home.stats} />
        <FeaturedLawyers lawyers={home.lawyers} stats={home.stats} />
        <Testimonials reviews={home.reviews} />
        <LawyerCta />
      </main>

      <SiteFooter />

      <SocialProofToaster events={buildSocialProof(home)} />
      <MobileActionBar />

      {/* TEMPORAIRE — comparaison des colorimétries. À retirer une fois le
          thème arrêté. */}
      <ThemeSwitcher />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
