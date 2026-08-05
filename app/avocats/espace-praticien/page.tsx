import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { PractitionerSpace } from "@/components/avocats/admin/practitioner-space";
import { fetchCurrentAccount, fetchMyReviews } from "@/lib/api/account";
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
export default async function EspacePraticienPage() {
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

  // Les avis en modération ne figurent pas dans `/auth/me` : ils demandent leur
  // propre lecture, faite ici pour que la section s'ouvre déjà remplie.
  const reviews = await fetchMyReviews();

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel display-none pb-24 lg:pb-8">
        <PractitionerSpace
          profile={profile}
          account={session.account}
          documents={session.documents}
          reviews={reviews}
        />
      </main>

      <SiteFooter />
    </>
  );
}
