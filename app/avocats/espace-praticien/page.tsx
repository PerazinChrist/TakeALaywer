import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { PractitionerSpace } from "@/components/avocats/admin/practitioner-space";
import { fetchCurrentAccount, fetchMyBookings, fetchMyReviews } from "@/lib/api/account";
import { toLawyerProfile } from "@/lib/api/profile";

export const metadata: Metadata = {
  title: "Espace praticien",
  description:
    "Gérez votre vitrine publique : identité, galerie photo, guides publiés, prestations, avis et abonnement.",
  alternates: { canonical: "/avocats/espace-praticien" },
  robots: { index: false, follow: false },
};

const CONNEXION = "/avocats/connexion?suite=/avocats/espace-praticien";

/**
 * Espace de gestion — le pendant privé de la vitrine publique.
 * Chaque section pilote un bloc de `/avocats/[slug]`.
 *
 * Composant serveur : la session est lue dans le cookie httpOnly puis validée
 * auprès de WordPress avant tout rendu. Le jeton ne descend jamais dans le
 * navigateur, et une page protégée n'est pas envoyée puis masquée côté client —
 * elle n'est simplement pas rendue.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Sections que les notifications peuvent ouvrir directement. */
const SECTIONS = new Set([
  "tableau",
  "compte",
  "vitrine",
  "justificatifs",
  "galerie",
  "guides",
  "prestations",
  "rendez-vous",
  "avis",
  "abonnement",
]);

export default async function EspacePraticienPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await fetchCurrentAccount();

  if (!session) {
    redirect(CONNEXION);
  }

  const profile = toLawyerProfile(session.profile);

  if (!profile) {
    // Compte sans vitrine exploitable : anomalie qui se règle côté
    // administration, pas quelque chose que le praticien puisse corriger ici.
    redirect(CONNEXION);
  }

  // Les avis en modération et l'agenda ne figurent pas dans `/auth/me` : deux
  // lectures propres, faites en parallèle pour que les sections s'ouvrent déjà
  // remplies.
  const [reviews, bookings, params] = await Promise.all([
    fetchMyReviews(),
    fetchMyBookings(),
    searchParams,
  ]);

  const requested = Array.isArray(params.section) ? params.section[0] : params.section;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel display-none pb-24 lg:pb-8">
        <PractitionerSpace
          profile={profile}
          account={session.account}
          documents={session.documents}
          reviews={reviews}
          bookings={bookings}
          unreadMessages={session.counters?.messages ?? 0}
          initialSection={requested && SECTIONS.has(requested) ? requested : "tableau"}
        />
      </main>

      <SiteFooter />
    </>
  );
}
