/**
 * Lecture d'une vitrine publique, côté serveur.
 *
 * ⚠️ Module serveur : ne jamais l'importer depuis un fichier « use client ».
 */

import { cache } from "react";
import { callWordPress } from "@/lib/api/server";
import { fetchCurrentAccount } from "@/lib/api/account";
import { toLawyerProfile } from "@/lib/api/profile";
import { getProfile } from "@/lib/data/lawyer-profile";
import type { LawyerProfile } from "@/lib/data/lawyer-profile";

export type VitrineResult = {
  profile: LawyerProfile;
  /** Vrai lorsque le visiteur est le praticien lui-même. */
  isOwner: boolean;
  /** Vrai lorsque la vitrine n'est visible que parce que son titulaire la consulte. */
  isPreview: boolean;
};

/**
 * Charge la vitrine d'un slug, avec repli sur les profils de démonstration.
 *
 * Trois cas se présentent, dans cet ordre :
 *
 *  1. la vitrine est publiée — l'API publique la renvoie à tout le monde ;
 *  2. elle ne l'est pas, mais le visiteur connecté en est le titulaire : il
 *     obtient un aperçu, signalé comme tel. C'est indispensable — sans lui, un
 *     praticien ne pourrait jamais relire sa vitrine avant la vérification,
 *     donc jamais la corriger avant qu'elle ne devienne publique ;
 *  3. aucun compte ne correspond : on retombe sur les profils de démonstration,
 *     ce qui laisse les maquettes navigables sans backend.
 *
 * Mémoïsé par `cache()` : `generateMetadata` et la page appellent tous deux
 * cette fonction pendant le même rendu.
 */
export const fetchVitrine = cache(async (slug: string): Promise<VitrineResult | null> => {
  const published = await callWordPress<Record<string, unknown>>(
    `/lawyers/${encodeURIComponent(slug)}`,
  );

  if (published.ok && published.data) {
    const profile = toLawyerProfile(published.data);

    if (profile) {
      const session = await fetchCurrentAccount();
      const owner = ownsSlug(session, slug);

      return { profile, isOwner: owner, isPreview: false };
    }
  }

  // Vitrine absente de l'annuaire : elle existe peut-être, mais n'est pas
  // publiée. Seul son titulaire peut la voir.
  const session = await fetchCurrentAccount();

  if (ownsSlug(session, slug)) {
    const profile = toLawyerProfile(session?.profile);

    if (profile) {
      return { profile, isOwner: true, isPreview: !profile.isPublished };
    }
  }

  const demo = getProfile(slug);

  return demo ? { profile: demo, isOwner: false, isPreview: false } : null;
});

/** Le compte connecté est-il celui de cette vitrine ? */
function ownsSlug(
  session: Awaited<ReturnType<typeof fetchCurrentAccount>>,
  slug: string,
): boolean {
  const profile = session?.profile;

  return Boolean(
    profile && typeof profile.slug === "string" && profile.slug === slug,
  );
}
