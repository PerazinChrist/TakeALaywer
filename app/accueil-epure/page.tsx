import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { HeroEpure } from "@/components/epure/hero-epure";
import { LawyersSpotlight } from "@/components/epure/lawyers-spotlight";
import { GuidesLibrary } from "@/components/epure/guides-library";
import { HowItWorksEpure } from "@/components/epure/how-it-works-epure";
import { GoldThemeLock } from "@/components/epure/gold-theme-lock";

/**
 * Page d'accueil — VARIANTE ÉPURÉE (proposition CPA).
 *
 * Quatre écrans, une seule idée par écran, beaucoup de vide autour des textes :
 *   1. Hero — le titre et les deux portes d'entrée.
 *   2. Avocats à la Une — carrousel des abonnés Premium / Pionnier.
 *   3. Bibliothèque — guides et modèles dès 250 FCFA.
 *   4. Comment ça marche — trois étapes puis trois garanties.
 *
 * Elle vit à côté de `/` le temps de l'arbitrage : même charte, même palette
 * or & ambre, mêmes primitives d'interface. Une fois la maquette retenue,
 * remplacer le contenu de app/page.tsx par celui-ci et supprimer cette route.
 */
export const metadata: Metadata = {
  title: "Votre réponse juridique claire, rapide et accessible",
  description:
    "Trouvez un avocat, posez une question anonyme ou téléchargez un guide pratique rédigé par un avocat dès 250 FCFA.",
  alternates: { canonical: "/accueil-epure" },
  // Maquette de comparaison : elle ne doit pas concurrencer « / » sur les
  // moteurs de recherche tant que l'arbitrage n'est pas fait.
  robots: { index: false, follow: false },
};

export default function AccueilEpurePage() {
  return (
    <>
      <GoldThemeLock />
      <SiteHeaderEpure />

      {/* La marge basse laisse la place à la barre d'action mobile. */}
      <main id="contenu" className="pb-24 lg:pb-0">
        <HeroEpure />
        <LawyersSpotlight />
        <GuidesLibrary />
        <HowItWorksEpure />
      </main>

      <SiteFooter />

      <MobileActionBar />
    </>
  );
}
