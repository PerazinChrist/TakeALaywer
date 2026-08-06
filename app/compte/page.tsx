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
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Sections que les liens de notification peuvent ouvrir directement. */
const SECTIONS = new Set([
  "tableau",
  "demandes",
  "rendez-vous",
  "guides",
  "avis",
  "activite",
  "compte",
]);

export default async function EspaceCitoyenPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [session, params] = await Promise.all([fetchCurrentClient(), searchParams]);

  if (!session) {
    redirect(CONNEXION);
  }

  const requested = Array.isArray(params.section) ? params.section[0] : params.section;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-8">
        <CitizenSpace
          session={session}
          initialSection={requested && SECTIONS.has(requested) ? requested : "tableau"}
        />
      </main>

      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
