"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Avatar } from "@/components/ui/avatar";
import { AdminCard, StatCard } from "@/components/avocats/admin/admin-ui";
import { SectionAbonnement } from "@/components/avocats/admin/admin-sections";
import { SectionAvis } from "@/components/avocats/admin/section-avis";
import { SectionCompte } from "@/components/avocats/admin/section-compte";
import { SectionGalerie } from "@/components/avocats/admin/section-galerie";
import { SectionGuides } from "@/components/avocats/admin/section-guides";
import { SectionPrestations } from "@/components/avocats/admin/section-prestations";
import { SectionVitrine } from "@/components/avocats/admin/section-vitrine";
import {
  SectionJustificatifs,
  SignOutButton,
} from "@/components/avocats/admin/section-justificatifs";
import { ProfileCover } from "@/components/avocats/vitrine/profile-cover";
import { cn } from "@/lib/utils";
import type { LawyerProfile } from "@/lib/data/lawyer-profile";
import {
  accountStatusLabels,
  type ApiAccount,
  type ApiDocument,
  type ReviewsResult,
} from "@/lib/api/types";
import {
  IconAlert,
  IconArrowRight,
  IconBadgeCheck,
  IconCheck,
  IconCrown,
  IconDownload,
  IconEye,
  IconFileText,
  IconGrid,
  IconImage,
  IconScale,
  IconSend,
  IconShieldCheck,
  IconStar,
  IconUser,
  IconUserCog,
} from "@/components/ui/icons";

const navigation = [
  { id: "tableau", label: "Tableau de bord", Icon: IconGrid },
  { id: "compte", label: "Mon compte", Icon: IconUserCog },
  { id: "vitrine", label: "Ma vitrine", Icon: IconUser },
  { id: "justificatifs", label: "Justificatifs", Icon: IconShieldCheck },
  { id: "galerie", label: "Photos & albums", Icon: IconImage },
  { id: "guides", label: "Guides publiés", Icon: IconFileText },
  { id: "prestations", label: "Prestations", Icon: IconScale },
  { id: "avis", label: "Avis clients", Icon: IconStar },
  { id: "abonnement", label: "Abonnement", Icon: IconCrown },
] as const;

/** Bandeau d'état du compte, affiché tant qu'il n'est pas vérifié. */
function StatusBanner({
  account,
  missing,
  onNavigate,
}: {
  account: ApiAccount;
  missing: number;
  onNavigate: (section: string) => void;
}) {
  if (account.status === "verifie") return null;

  const rejected = account.status === "refuse" || account.status === "suspendu";

  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-start gap-3 rounded-2xl p-4 text-sm/relaxed ring-1 ring-inset",
        rejected
          ? "bg-danger-50 text-danger-700 ring-danger-200"
          : "bg-gold-50 text-marine-800 ring-gold-500/25",
      )}
    >
      <IconAlert
        className={cn("mt-0.5 size-4.5 shrink-0", rejected ? "text-danger-600" : "text-gold-700")}
      />

      <div className="min-w-0 flex-1">
        <p className="font-semibold">{accountStatusLabels[account.status]}</p>
        <p className="mt-0.5">
          {rejected
            ? "Votre vitrine n’est pas publiée. Contactez-nous pour connaître le motif de cette décision."
            : missing > 0
              ? `Votre vitrine sera mise en ligne après contrôle de vos pièces. Il en reste ${missing} à déposer.`
              : "Vos pièces sont entre les mains de l’équipe de vérification. Comptez 48 heures ouvrées."}
        </p>
      </div>

      {!rejected && missing > 0 && (
        <button
          type="button"
          onClick={() => onNavigate("justificatifs")}
          className="shrink-0 rounded-full bg-marine-950 px-4 py-2 text-xs font-semibold text-white hover:bg-marine-800"
        >
          Déposer mes pièces
        </button>
      )}
    </div>
  );
}

/**
 * Espace de gestion du praticien.
 *
 * Un rail de navigation à gauche, une section à la fois à droite : chaque
 * section pilote un bloc précis de la vitrine publique, dans le même ordre que
 * celui où le visiteur les découvre.
 *
 * La vitrine est tenue ici, en un seul état, et non dans chaque section : une
 * photo ajoutée doit se voir immédiatement dans l'aperçu du tableau de bord, et
 * un guide publié dans le compteur de l'en-tête. Chaque section reçoit sa part
 * et remonte la version que le serveur vient de confirmer.
 */
export function PractitionerSpace({
  profile: initialProfile,
  account: initialAccount,
  documents = [],
  reviews = { items: [], counts: {}, average: 0 },
}: {
  profile: LawyerProfile;
  /** Absent en démonstration statique ; présent dès qu'une session est ouverte. */
  account?: ApiAccount;
  documents?: ApiDocument[];
  /** Avis reçus, modération comprise. Chargés côté serveur avec la page. */
  reviews?: ReviewsResult;
}) {
  const [section, setSection] = useState<string>("tableau");
  const [profile, setProfile] = useState(initialProfile);
  const [account, setAccount] = useState(initialAccount);

  const missing = documents.filter(
    (item) => item.required && item.status === "manquant",
  ).length;

  // Sans session, les onglets qui écrivent n'auraient ni compte à modifier ni
  // endpoint à appeler : ils n'apparaissent que lorsque le compte est connu.
  const sections = account
    ? navigation
    : navigation.filter((entry) => entry.id !== "justificatifs" && entry.id !== "compte");

  const patch = (changes: Partial<LawyerProfile>) =>
    setProfile((current) => ({ ...current, ...changes }));

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-10 lg:py-10">
      {/* ---------------- Rail de navigation ---------------- */}
      {/* `min-w-0` : sans lui, la largeur du rail défilant ci-dessous devient
          la largeur minimale de la colonne de grille, et c'est toute la page
          qui déborde à l'horizontale sur mobile. */}
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-marine-950/6">
          <Avatar initials={profile.initials} imageUrl={profile.avatarUrl} online />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-semibold text-marine-950">
              {profile.name}
              <IconBadgeCheck className="size-4 shrink-0 text-gold-500" />
            </p>
            <p className="truncate text-xs text-marine-500">{profile.bar}</p>
          </div>
        </div>

        <nav
          className="scrollbar-none flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible"
          aria-label="Sections de l’espace praticien"
        >
          {sections.map(({ id, label, Icon }) => {
            const active = id === section;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-marine-950 text-white"
                    : "text-marine-700 hover:bg-white hover:text-marine-950",
                )}
              >
                <Icon
                  className={cn("size-4.5", active ? "text-gold-400" : "text-marine-400")}
                />
                {label}
              </button>
            );
          })}
        </nav>

        <Link
          href={`/avocats/${profile.slug}`}
          className={buttonStyles({
            variant: "outline",
            size: "sm",
            full: true,
            className: "mt-5 border-marine-950/15 bg-white",
          })}
        >
          <IconEye className="size-4" />
          Voir ma vitrine
        </Link>

        {account && <SignOutButton />}
      </aside>

      {/* ---------------- Section active ----------------
          `min-w-0` pour la même raison que le rail : les lignes du tableau des
          guides ont une largeur intrinsèque supérieure à un écran de
          téléphone, et sans cela elles élargiraient la colonne. */}
      <div className="min-w-0">
        {account && (
          <StatusBanner account={account} missing={missing} onNavigate={setSection} />
        )}

        {section === "tableau" && (
          <SectionTableau
            profile={profile}
            reviews={reviews}
            onNavigate={setSection}
            onVisualChange={(slot, url) =>
              patch(slot === "avatar" ? { avatarUrl: url } : { coverUrl: url })
            }
          />
        )}

        {section === "compte" && account && (
          <SectionCompte
            account={account}
            onSaved={(next) => {
              setAccount(next);
              // Le barreau, la ville et l'adresse de la vitrine sont recopiés du
              // compte : les rafraîchir évite un en-tête qui contredit le
              // formulaire qu'on vient de valider.
              patch({
                bar: next.bar,
                city: next.city,
                district: next.district,
                address: next.address,
                website: next.website,
                specialties: next.specialties,
                languages: next.languages,
              });
            }}
          />
        )}

        {section === "justificatifs" && account && (
          <SectionJustificatifs documents={documents} />
        )}

        {section === "vitrine" && (
          <SectionVitrine profile={profile} onSaved={setProfile} />
        )}

        {section === "galerie" && (
          <SectionGalerie albums={profile.albums} onChange={(albums) => patch({ albums })} />
        )}

        {section === "guides" && (
          <SectionGuides guides={profile.guides} onChange={(guides) => patch({ guides })} />
        )}

        {section === "prestations" && (
          <SectionPrestations
            prestations={profile.prestations}
            onChange={(prestations) => patch({ prestations })}
          />
        )}

        {section === "avis" && <SectionAvis initial={reviews} />}
        {section === "abonnement" && <SectionAbonnement profile={profile} />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tableau de bord                                                            */
/* -------------------------------------------------------------------------- */

function SectionTableau({
  profile,
  reviews,
  onNavigate,
  onVisualChange,
}: {
  profile: LawyerProfile;
  reviews: ReviewsResult;
  onNavigate: (section: string) => void;
  onVisualChange: (slot: "avatar" | "couverture", url: string | null) => void;
}) {
  const published = profile.guides.filter((g) => g.status === "publie").length;
  const photos = profile.albums.reduce((count, album) => count + album.photos.length, 0);

  // Les avis en modération comptent aussi : la réponse se prépare avant la
  // publication, pas après. `profile.reviews` ne porte que les avis publiés.
  const pendingReplies = reviews.items.filter((review) => !review.reply).length;

  // La liste décrit l'état réel de la vitrine plutôt qu'un parcours figé : une
  // case cochée d'avance ne pousse personne à compléter quoi que ce soit.
  const checklist = [
    {
      label: "Photo de profil ajoutée",
      done: Boolean(profile.avatarUrl),
      section: "tableau",
    },
    {
      label: "Photo de couverture personnalisée",
      done: Boolean(profile.coverUrl),
      section: "tableau",
    },
    {
      label: profile.about.length > 0 ? "Présentation rédigée" : "Rédiger votre présentation",
      done: profile.about.length > 0,
      section: "vitrine",
    },
    {
      label:
        profile.prestations.length > 0
          ? `${profile.prestations.length} prestations tarifées`
          : "Déclarer une première prestation",
      done: profile.prestations.length > 0,
      section: "prestations",
    },
    {
      label: published > 0 ? `${published} guides publiés` : "Publier un premier guide",
      done: published > 0,
      section: "guides",
    },
    {
      label: photos > 0 ? `${photos} photos en ligne` : "Ajouter des photos de votre cabinet",
      done: photos > 0,
      section: "galerie",
    },
    ...(pendingReplies > 0
      ? [
          {
            label: `Répondre aux ${pendingReplies} avis en attente`,
            done: false,
            section: "avis",
          },
        ]
      : []),
  ];

  const remaining = checklist.filter((item) => !item.done).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Prestations tarifées"
          value={String(profile.prestations.length)}
          icon={<IconScale className="size-5" />}
        />
        <StatCard
          label="Guides publiés"
          value={String(published)}
          icon={<IconDownload className="size-5" />}
        />
        <StatCard
          label="Photos en ligne"
          value={String(photos)}
          icon={<IconImage className="size-5" />}
        />
        <StatCard
          label="Note moyenne"
          value={
            profile.reviewsCount > 0
              ? profile.rating.toFixed(1).replace(".", ",")
              : "—"
          }
          icon={<IconStar className="size-5" />}
        />
      </div>

      {/* Aperçu de la vitrine, avec les commandes de modification */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-marine-950/6">
        <div className="scale-[0.98] origin-top">
          <ProfileCover profile={profile} editable onVisualChange={onVisualChange} />
        </div>
      </div>

      <AdminCard
        title="Compléter votre vitrine"
        description={
          remaining === 0
            ? "Tout est en place."
            : `${remaining} action${remaining > 1 ? "s" : ""} augmenteraient votre visibilité.`
        }
      >
        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onNavigate(item.section)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                  item.done
                    ? "border-marine-950/8 bg-white"
                    : "border-gold-500/30 bg-gold-50 hover:border-gold-500",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    item.done
                      ? "bg-trust-500 text-white"
                      : "border-2 border-gold-500 bg-white",
                  )}
                >
                  {item.done && <IconCheck className="size-3.5" strokeWidth={3} />}
                </span>

                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.done
                      ? "text-marine-500 line-through decoration-marine-300"
                      : "font-semibold text-marine-900",
                  )}
                >
                  {item.label}
                </span>

                {!item.done && (
                  <IconArrowRight className="size-4 text-gold-600 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </AdminCard>

      {reviews.items.length > 0 && (
        <AdminCard
          title="Derniers avis"
          action={
            <button
              type="button"
              onClick={() => onNavigate("avis")}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-800"
            >
              Tout voir
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          }
        >
          <ul className="divide-y divide-marine-950/6">
            {reviews.items.slice(0, 3).map((review) => (
              <li key={review.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                <Avatar initials={review.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-marine-950">{review.author}</span>
                    <Rating value={review.rating} />
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm/relaxed text-marine-600">
                    {review.quote}
                  </p>
                </div>
                {!review.reply && (
                  <span className="shrink-0 rounded-full bg-gold-500/12 px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-gold-700 uppercase">
                    À répondre
                  </span>
                )}
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <AdminCard
        title="Faire connaître votre vitrine"
        description="Partagez ce lien : il fonctionne dès que votre compte est vérifié."
      >
        <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-marine-50 p-4">
          <IconSend className="size-4.5 shrink-0 text-marine-400" />
          <code className="min-w-0 flex-1 truncate text-sm text-marine-800">
            /avocats/{profile.slug}
          </code>
          <Link
            href={`/avocats/${profile.slug}`}
            className={buttonStyles({
              variant: "outline",
              size: "sm",
              className: "border-marine-950/15 bg-white",
            })}
          >
            <IconEye className="size-4" />
            Ouvrir
          </Link>
        </p>
      </AdminCard>
    </div>
  );
}
