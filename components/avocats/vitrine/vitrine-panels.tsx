import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { PhotoTile } from "@/components/avocats/vitrine/photo-tile";
import { ReviewForm, type ReviewIdentity } from "@/components/avocats/vitrine/review-form";
import {
  ReserveButton,
  type BookingSession,
} from "@/components/avocats/vitrine/reserve-button";
import { GuideShowcaseCard } from "@/components/public/guide-card";
import { cn, formatFcfa } from "@/lib/utils";
import type { GuideSummary } from "@/lib/api/public";
import type {
  LawyerProfile,
  Prestation,
  ProfileGuide,
  ProfileReview,
} from "@/lib/data/lawyer-profile";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconBuilding,
  IconCalendar,
  IconFileText,
  IconGlobe,
  IconMapPin,
  IconPhone,
  IconQuote,
  IconSend,
  IconStar,
  IconVideo,
} from "@/components/ui/icons";

/* -------------------------------------------------------------------------- */
/* Coquille commune                                                           */
/* -------------------------------------------------------------------------- */

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6 sm:p-7",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-marine-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Les trois raccourcis de la boîte de contact partagent une seule apparence. */
const actionStyles =
  "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-marine-700 transition-colors hover:bg-marine-50";

function SeeAll({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
    >
      {label}
      <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Prestations — le cœur marketplace                                          */
/* -------------------------------------------------------------------------- */

const modeLabels = {
  visio: { label: "En visioconférence", Icon: IconVideo },
  cabinet: { label: "Au cabinet", Icon: IconBuilding },
  telephone: { label: "Par téléphone", Icon: IconPhone },
  document: { label: "Sur pièces", Icon: IconFileText },
} as const;

export function PrestationCard({
  prestation,
  lawyerSlug,
  lawyerName,
  session,
}: {
  prestation: Prestation;
  lawyerSlug: string;
  lawyerName: string;
  session: BookingSession;
}) {
  const { label, Icon } = modeLabels[prestation.mode];

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-marine-950/10 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/40 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-marine-50 px-2.5 py-1 text-[0.7rem] font-semibold text-marine-600">
          <Icon className="size-3.5" />
          {label}
        </span>
        {prestation.popular && (
          <span className="shrink-0 rounded-full bg-gold-500/12 px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-gold-700 uppercase">
            Le plus demandé
          </span>
        )}
      </div>

      <h3 className="mt-3.5 font-serif text-lg/snug font-bold text-marine-950">
        {prestation.title}
      </h3>
      <p className="mt-2 flex-1 text-sm/relaxed text-marine-600">
        {prestation.description}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-marine-950/6 pt-4">
        <p>
          <span className="block font-serif text-xl font-bold text-marine-950">
            {formatFcfa(prestation.price)}
          </span>
          <span className="text-xs text-marine-500">{prestation.unit}</span>
        </p>
        <ReserveButton
          prestation={prestation}
          lawyerSlug={lawyerSlug}
          lawyerName={lawyerName}
          session={session}
        />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Guides                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Carte de guide de la vitrine.
 *
 * Elle délègue à `GuideShowcaseCard`, la carte unique du site : un visiteur qui
 * a repéré un guide dans la bibliothèque doit retrouver exactement la même
 * présentation sur la vitrine de son auteur, sinon il doute d'avoir affaire au
 * même document.
 *
 * Le seul travail restant est l'adaptation : la vitrine sert un `ProfileGuide`,
 * qui ne porte pas son auteur — la page entière est consacrée à lui. On le
 * reconstitue depuis le profil.
 */
export function GuideCard({
  guide,
  profile,
}: {
  guide: ProfileGuide;
  profile: LawyerProfile;
}) {
  return <GuideShowcaseCard guide={toGuideSummary(guide, profile)} />;
}

/** Convertit un guide de vitrine en guide de bibliothèque. */
function toGuideSummary(guide: ProfileGuide, profile: LawyerProfile): GuideSummary {
  return {
    id: guide.id ?? guide.slug,
    slug: guide.slug,
    kind: guide.kind,
    format: guide.format,
    title: guide.title,
    description: guide.description,
    category: guide.category,
    price: guide.price,
    free: guide.free,
    pages: guide.pages,
    views: guide.views,
    // `downloads` arrive mis en forme (« 4 015 ») : on en retire les
    // séparateurs pour retrouver le nombre attendu par le type.
    downloads: Number(guide.downloads.replace(/\D/g, "")) || 0,
    coverUrl: guide.coverUrl ?? null,
    publishedAt: guide.updatedAt ?? "",
    updatedAt: guide.updatedAt ?? "",
    readingTime: guide.readingTime,
    author: {
      slug: profile.slug,
      name: profile.name,
      initials: profile.initials,
      type: profile.type,
      city: profile.city,
      avatarUrl: profile.avatarUrl ?? null,
      rating: profile.rating,
      // La vitrine n'est publique que pour un compte vérifié : y afficher un
      // guide, c'est déjà l'attester.
      verified: profile.isPublished !== false,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Avis                                                                       */
/* -------------------------------------------------------------------------- */

export function ReviewItem({ review }: { review: ProfileReview }) {
  return (
    <article className="rounded-2xl border border-marine-950/8 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar initials={review.initials} size="sm" />
          <div>
            <p className="font-semibold text-marine-950">{review.author}</p>
            <p className="text-xs text-marine-500">
              {review.context} · {review.date}
            </p>
          </div>
        </div>
        <Rating value={review.rating} className="shrink-0" />
      </div>

      <p className="mt-4 flex gap-2.5 text-sm/relaxed text-marine-700">
        <IconQuote className="mt-0.5 size-4 shrink-0 text-gold-400" />
        {review.quote}
      </p>

      {review.reply && (
        <p className="mt-4 rounded-xl bg-marine-50 p-4 text-sm/relaxed text-marine-700">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wide text-marine-900 uppercase">
            <IconBadgeCheck className="size-3.5 text-gold-500" />
            Réponse de l’avocat
          </span>
          {review.reply}
        </p>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Panneau « Tout »                                                           */
/* -------------------------------------------------------------------------- */

export function PanelApercu({
  profile,
  session,
  onNavigate,
}: {
  profile: LawyerProfile;
  session: BookingSession;
  onNavigate: (tab: string) => void;
}) {
  const published = profile.guides.filter((g) => g.status === "publie");
  const firstAlbum = profile.albums[0];
  const previewPhotos = profile.albums.flatMap((a) => a.photos).slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Boîte de contact — équivalent du bloc de composition de la maquette */}
      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/6">
        <div className="flex items-center gap-3">
          <Avatar initials={profile.initials} />
          <Link
            href={`/besoin/nouveau?avocat=${profile.slug}`}
            className="flex-1 rounded-full bg-marine-50 px-5 py-3 text-sm text-marine-500 transition-colors hover:bg-marine-100"
          >
            Décrivez votre situation à {profile.name} — c’est anonyme.
          </Link>
        </div>

        <div className="mt-4 grid gap-2 border-t border-marine-950/6 pt-4 sm:grid-cols-3">
          {[
            {
              label: "Poser une question",
              Icon: IconSend,
              tone: "text-gold-600",
              href: `/besoin/nouveau?avocat=${profile.slug}`,
            },
            {
              label: "Prendre rendez-vous",
              Icon: IconCalendar,
              tone: "text-trust-600",
              href: `/avocats/${profile.slug}/rendez-vous`,
            },
          ].map(({ label, Icon, tone, href }) => (
            <Link
              key={label}
              href={href}
              className={actionStyles}
            >
              <Icon className={cn("size-4.5", tone)} />
              {label}
            </Link>
          ))}

          {/* Les guides sont un onglet de cette même page, pas une autre URL :
              un lien d'ancrage pointerait vers un identifiant qui n'existe que
              lorsque l'onglet est déjà ouvert. */}
          <button type="button" onClick={() => onNavigate("guides")} className={actionStyles}>
            <IconFileText className="size-4.5 text-marine-600" />
            Voir les guides
          </button>
        </div>
      </section>

      {/* Chaque bloc s'efface quand il n'a rien à montrer : une vitrine
          fraîchement créée afficherait sinon quatre cartes vides, ce qui donne
          l'impression d'un profil abandonné plutôt que d'un profil récent. */}
      {profile.prestations.length > 0 && (
        <SectionCard
          title="Prestations & honoraires"
          action={<SeeAll label="À propos du cabinet" onClick={() => onNavigate("apropos")} />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.prestations.slice(0, 4).map((prestation) => (
              <PrestationCard
                key={prestation.id}
                prestation={prestation}
                lawyerSlug={profile.slug}
                lawyerName={profile.name}
                session={session}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {published.length > 0 && (
        <SectionCard
          title="Guides publiés"
          action={<SeeAll label="Tous les guides" onClick={() => onNavigate("guides")} />}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {published.slice(0, 3).map((guide) => (
              <GuideCard key={guide.slug} guide={guide} profile={profile} />
            ))}
          </div>
        </SectionCard>
      )}

      {previewPhotos.length > 0 && (
        <SectionCard
          title="Galerie"
          action={<SeeAll label="Voir les albums" onClick={() => onNavigate("galerie")} />}
        >
          <p className="-mt-2 mb-4 text-sm text-marine-500">
            {profile.albums.length} albums ·{" "}
            {profile.albums.reduce((n, a) => n + a.photos.length, 0)} photos.
            {firstAlbum && ` Dernière mise à jour ${firstAlbum.updatedAt}.`}
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {previewPhotos.map((photo) => (
              <PhotoTile
                key={photo.id}
                caption={photo.caption}
                tone={photo.tone}
                url={photo.url}
                className="aspect-square"
              />
            ))}
          </div>
        </SectionCard>
      )}

      {profile.reviews.length > 0 && (
        <SectionCard
          title="Avis certifiés"
          action={<SeeAll label="Tous les avis" onClick={() => onNavigate("avis")} />}
        >
          <div className="space-y-4">
            {profile.reviews.slice(0, 2).map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Panneau « À propos »                                                       */
/* -------------------------------------------------------------------------- */

export function PanelAPropos({ profile }: { profile: LawyerProfile }) {
  return (
    <div className="space-y-5">
      <SectionCard title={profile.type === "cabinet" ? "Le cabinet" : "Présentation"}>
        <p className="font-serif text-xl/snug font-bold text-balance text-marine-950">
          {profile.headline}
        </p>
        <div className="mt-4 space-y-4">
          {profile.about.map((paragraph) => (
            <p key={paragraph} className="text-[0.95rem]/relaxed text-marine-700">
              {paragraph}
            </p>
          ))}
        </div>
      </SectionCard>

      {profile.milestones && (
        <SectionCard title="Parcours">
          <ol className="relative space-y-6 border-l border-marine-950/10 pl-6">
            {profile.milestones.map((step) => (
              <li key={step.year} className="relative">
                <span
                  className="absolute top-1.5 -left-[1.9rem] size-2.5 rounded-full bg-gold-500 ring-4 ring-white"
                  aria-hidden="true"
                />
                <p className="font-serif text-sm font-bold text-gold-700">
                  {step.year}
                </p>
                <p className="mt-0.5 font-semibold text-marine-950">{step.label}</p>
                <p className="text-sm text-marine-500">{step.place}</p>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      {profile.team && (
        <SectionCard title={`L’équipe · ${profile.headcount} avocats`}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {profile.team.map((member) => (
              <li
                key={member.name}
                className="flex items-center gap-3 rounded-2xl border border-marine-950/8 p-4"
              >
                <Avatar initials={member.initials} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-marine-950">
                    {member.name}
                  </p>
                  <p className="text-sm text-marine-600">{member.role}</p>
                  <p className="text-xs text-marine-500">{member.specialty}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Coordonnées & mentions légales">
        <dl className="divide-y divide-marine-950/6">
          {[
            { label: "Adresse", value: `${profile.address}, ${profile.district}, ${profile.city}`, Icon: IconMapPin },
            { label: "Barreau", value: profile.bar, Icon: IconBadgeCheck },
            ...(profile.legalForm
              ? [{ label: "Forme juridique", value: profile.legalForm, Icon: IconBuilding }]
              : []),
            ...(profile.rccm
              ? [{ label: "RCCM", value: profile.rccm, Icon: IconFileText }]
              : []),
            // Les langues ne sont pas reprises ici : la colonne de gauche les
            // affiche déjà deux fois (faits et bloc honoraires).
            { label: "Site web", value: profile.website, Icon: IconGlobe },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
            >
              <dt className="text-sm text-marine-500">{row.label}</dt>
              <dd className="text-right text-sm font-semibold text-marine-950">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Panneau « Guides »                                                         */
/* -------------------------------------------------------------------------- */

export function PanelGuides({ profile }: { profile: LawyerProfile }) {
  const published = profile.guides.filter((g) => g.status === "publie");

  return (
    <SectionCard title={`Guides & modèles · ${published.length}`}>
      <p className="-mt-2 mb-5 text-sm/relaxed text-marine-600">
        Rédigés et signés par {profile.name}. Téléchargement immédiat après
        paiement Mobile Money.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {published.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} profile={profile} />
        ))}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Panneau « Galerie »                                                        */
/* -------------------------------------------------------------------------- */

export function PanelGalerie({ profile }: { profile: LawyerProfile }) {
  return (
    <div className="space-y-5">
      {profile.albums.map((album) => (
        <SectionCard
          key={album.id}
          title={album.title}
          action={
            <span className="text-sm text-marine-500">
              {album.photos.length} photos · {album.updatedAt}
            </span>
          }
        >
          <p className="-mt-2 mb-4 text-sm/relaxed text-marine-600">
            {album.description}
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {album.photos.map((photo) => (
              <PhotoTile
                key={photo.id}
                caption={photo.caption}
                tone={photo.tone}
                url={photo.url}
                className="aspect-square"
              />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Panneau « Avis »                                                           */
/* -------------------------------------------------------------------------- */

export function PanelAvis({
  profile,
  identity,
}: {
  profile: LawyerProfile;
  /** Identité du citoyen connecté — le dépôt d'un avis l'exige. */
  identity: ReviewIdentity | null;
}) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: profile.reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = profile.reviews.length || 1;

  return (
    <div className="space-y-5">
      <SectionCard title="Ce que disent les clients">
        <div className="grid gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="text-center sm:text-left">
            <p className="font-serif text-5xl font-bold text-marine-950">
              {profile.rating.toFixed(1).replace(".", ",")}
            </p>
            <Rating value={profile.rating} className="mt-2" />
            <p className="mt-1 text-sm text-marine-500">
              {profile.reviewsCount} avis certifiés
            </p>
          </div>

          <ul className="space-y-2">
            {distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-3">
                <span className="inline-flex w-10 shrink-0 items-center gap-1 text-xs font-semibold text-marine-600">
                  {row.star}
                  <IconStar className="size-3 text-gold-400" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-marine-100">
                  <span
                    className="block h-full rounded-full bg-gold-500"
                    style={{ width: `${(row.count / total) * 100}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right text-xs text-marine-500">
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 flex items-start gap-2 rounded-xl bg-trust-500/8 p-4 text-sm/relaxed text-marine-700">
          <IconBadgeCheck className="mt-0.5 size-4 shrink-0 text-trust-600" />
          Seuls les clients ayant réellement consulté peuvent déposer un avis.
        </p>
      </SectionCard>

      {profile.reviews.length > 0 ? (
        <SectionCard title={`Tous les avis · ${profile.reviews.length}`}>
          <div className="space-y-4">
            {profile.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Aucun avis publié pour l’instant">
          <p className="text-sm/relaxed text-marine-600">
            Cette fiche n’a pas encore reçu d’avis vérifié. Si vous avez
            travaillé avec ce praticien, votre retour aidera les prochains
            visiteurs à se décider.
          </p>
        </SectionCard>
      )}

      {/* Dépôt d'un avis — le formulaire clôt le panneau plutôt que de l'ouvrir :
          on lit d'abord ce que d'autres ont écrit, on écrit ensuite. */}
      <SectionCard title="Vous avez consulté ce praticien ?">
        <ReviewForm slug={profile.slug} name={profile.name} identity={identity} />
      </SectionCard>
    </div>
  );
}
