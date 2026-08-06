import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeaderEpure } from "@/components/epure/site-header-epure";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProfileCover } from "@/components/avocats/vitrine/profile-cover";
import { ProfileSidebar } from "@/components/avocats/vitrine/profile-sidebar";
import { VitrineBody } from "@/components/avocats/vitrine/vitrine-body";
import { buttonStyles } from "@/components/ui/button";
import { fetchVitrine } from "@/lib/api/vitrine";
import { fetchCurrentClient } from "@/lib/api/citizen";
import { IconAlert, IconPencil } from "@/components/ui/icons";

type Params = { params: Promise<{ slug: string }> };

/**
 * Les vitrines sont rendues à la demande : elles viennent de la base WordPress
 * et changent dès qu'un praticien modifie la sienne. Les pré-générer figerait
 * l'annuaire à l'état du dernier déploiement.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchVitrine(slug);

  if (!result) return { title: "Profil introuvable" };

  const { profile, isPreview } = result;

  return {
    title: `${profile.name}${profile.subtitle ? ` — ${profile.subtitle}` : ""}`,
    description: profile.headline || `${profile.name}, ${profile.bar}.`,
    alternates: { canonical: `/avocats/${profile.slug}` },
    // Une vitrine en attente de vérification ne doit pas être indexée : elle
    // deviendrait un résultat de recherche pointant vers une page que le public
    // ne peut pas ouvrir.
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * Espace Vitrine — la page publique d'un avocat ou d'un cabinet.
 *
 * La composition reprend la maquette de référence : couverture panoramique,
 * avatar débordant, identité et actions, barre d'onglets pleine largeur, puis
 * deux colonnes (informations à gauche, contenu à droite). Le contenu, lui,
 * est celui d'une place de marché : prestations tarifées, guides à la vente,
 * galerie et avis certifiés.
 */
export default async function VitrinePage({ params }: Params) {
  const { slug } = await params;

  const [result, session] = await Promise.all([fetchVitrine(slug), fetchCurrentClient()]);

  if (!result) notFound();

  const { profile, isOwner, isPreview } = result;

  // Le corps de la vitrine est un composant client : il ne peut pas lire le
  // cookie citoyen lui-même. On lui transmet le strict nécessaire — de quoi
  // pré-remplir une réservation, et de quoi savoir si un avis peut être déposé.
  const contact = session
    ? {
        name:
          [session.client.firstName, session.client.lastName].filter(Boolean).join(" ") ||
          session.client.pseudonym,
        email: session.client.email,
        phone: session.client.phone,
      }
    : null;

  return (
    <>
      <SiteHeaderEpure />

      <main id="contenu" className="bg-panel pb-24 lg:pb-0">
        {isOwner && (
          <div
            className={
              isPreview
                ? "bg-gold-50 ring-1 ring-gold-500/25 ring-inset"
                : "bg-marine-950 text-white"
            }
          >
            <div className="container-page flex flex-wrap items-center gap-3 py-3">
              {isPreview && (
                <IconAlert className="size-4.5 shrink-0 text-gold-700" />
              )}

              <p
                className={`min-w-0 flex-1 text-sm/relaxed ${
                  isPreview ? "text-marine-800" : "text-marine-200"
                }`}
              >
                {isPreview ? (
                  <>
                    <span className="font-semibold">Aperçu privé.</span> Cette
                    vitrine n’est pas encore visible du public : elle sera mise en
                    ligne après validation de vos justificatifs.
                  </>
                ) : (
                  <>
                    Vous consultez votre propre vitrine, telle que la voient les
                    citoyens.
                  </>
                )}
              </p>

              <Link
                href="/avocats/espace-praticien"
                className={buttonStyles({
                  // Sur le bandeau doré, le marine plein ressort ; sur le
                  // bandeau marine, seul le contour clair reste lisible.
                  variant: isPreview ? "marine" : "ghost",
                  size: "sm",
                })}
              >
                <IconPencil className="size-4" />
                Modifier ma vitrine
              </Link>
            </div>
          </div>
        )}

        <ProfileCover profile={profile} />
        <VitrineBody
          profile={profile}
          sidebar={<ProfileSidebar profile={profile} />}
          session={{ signedIn: session !== null, contact }}
          identity={contact ? { name: contact.name, email: contact.email } : null}
        />
      </main>

      <SiteFooter />
    </>
  );
}
