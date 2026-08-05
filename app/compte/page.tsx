import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { CitizenSpace } from "@/components/compte/citizen-space";
import { fetchCurrentClient } from "@/lib/api/citizen";

export const metadata: Metadata = {
  title: "Mon espace",
  description:
    "Vos guides débloqués, vos avis et l’historique de vos démarches sur TakeALawyer.",
  alternates: { canonical: "/compte" },
  robots: { index: false, follow: false },
};

/** La bibliothèque change dès qu'un guide est débloqué. */
export const dynamic = "force-dynamic";

const CONNEXION = "/compte/connexion?suite=/compte";

/**
 * Espace personnel du citoyen.
 *
 * Composant serveur : la session est lue dans le cookie httpOnly puis validée
 * auprès de WordPress avant tout rendu. Le jeton ne descend jamais dans le
 * navigateur, et une page protégée n'est pas envoyée puis masquée côté client —
 * elle n'est simplement pas rendue.
 */
export default async function EspaceCitoyenPage() {
  const session = await fetchCurrentClient();

  if (!session) {
    redirect(CONNEXION);
  }

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-8">
        <CitizenSpace session={session} />
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
