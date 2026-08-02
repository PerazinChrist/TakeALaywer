import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { cn } from "@/lib/utils";
import { toneGradient } from "@/components/avocats/vitrine/photo-tile";
import { VisualUploader } from "@/components/avocats/vitrine/visual-uploader";
import type { LawyerProfile } from "@/lib/data/lawyer-profile";
import {
  IconBadgeCheck,
  IconCalendar,
  IconCrown,
  IconEye,
  IconMapPin,
  IconMore,
  IconSend,
} from "@/components/ui/icons";

/**
 * En-tête de la vitrine : photo de couverture panoramique, avatar débordant
 * sur la couverture, identité à gauche et actions à droite. La composition
 * reprend celle de la maquette de référence fournie.
 *
 * `editable` n'est activé que depuis l'espace de gestion : sur la vitrine
 * publique, aucun bouton de modification n'apparaît.
 */
export function ProfileCover({
  profile,
  editable = false,
  onVisualChange,
}: {
  profile: LawyerProfile;
  editable?: boolean;
  /** Rappelé après un dépôt ou un retrait, avec l'URL résultante. */
  onVisualChange?: (slot: "avatar" | "couverture", url: string | null) => void;
}) {
  const cabinet = profile.type === "cabinet";

  return (
    <header>
      {/* ---------------- Couverture ---------------- */}
      <div className="relative">
        <div
          className={cn(
            "relative h-44 overflow-hidden bg-linear-to-br sm:h-60 lg:h-72 lg:rounded-b-3xl",
            toneGradient[profile.coverTone],
          )}
        >
          {profile.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.coverUrl}
              alt=""
              // La couverture est visible d'emblée : la charger paresseusement
              // ferait apparaître l'aplat une fraction de seconde avant elle.
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            /* Motif discret : des filets dorés en diagonale, pour que la
               couverture ne soit pas un aplat mort en l'absence de photo. */
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, transparent 0 38px, rgba(217,119,6,0.55) 38px 40px)",
              }}
              aria-hidden="true"
            />
          )}

          <div
            className="absolute inset-0 bg-linear-to-t from-marine-950/60 to-transparent"
            aria-hidden="true"
          />

          {editable && (
            <div className="absolute right-4 bottom-4">
              <VisualUploader
                slot="couverture"
                hasVisual={Boolean(profile.coverUrl)}
                label="Changer la photo de couverture"
                shortLabel="Couverture"
                onChange={(url) => onVisualChange?.("couverture", url)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Identité ---------------- */}
      <div className="container-page">
        <div className="flex flex-col gap-5 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Avatar débordant sur la couverture */}
            <div className="relative -mt-14 shrink-0 sm:-mt-20">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  decoding="async"
                  className="size-28 rounded-full object-cover ring-4 ring-white sm:size-36"
                />
              ) : (
                <span
                  className={cn(
                    "grid size-28 place-items-center rounded-full bg-linear-to-br font-serif text-4xl font-bold text-gold-200 ring-4 ring-white sm:size-36 sm:text-5xl",
                    toneGradient.night,
                  )}
                  aria-hidden="true"
                >
                  {profile.initials}
                </span>
              )}

              {editable && (
                <span className="absolute right-1 bottom-1">
                  <VisualUploader
                    slot="avatar"
                    compact
                    hasVisual={Boolean(profile.avatarUrl)}
                    label="Changer la photo de profil"
                    onChange={(url) => onVisualChange?.("avatar", url)}
                  />
                </span>
              )}
            </div>

            <div className="min-w-0 sm:pb-1">
              <h1 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-serif text-3xl/tight font-bold text-marine-950 sm:text-4xl/tight">
                {profile.name}{" "}
                {profile.subtitle && (
                  <span className="font-sans text-lg font-normal text-marine-500">
                    ({profile.subtitle})
                  </span>
                )}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-marine-600">
                <span className="font-semibold text-marine-900">
                  {profile.reviewsCount} avis
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-marine-900">
                  {profile.guides.filter((g) => g.status === "publie").length} guides
                  publiés
                </span>
                <span aria-hidden="true">·</span>
                <span>{profile.consultations} consultations</span>
              </p>

              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-marine-600">
                {(profile.district || profile.city) && (
                  <span className="inline-flex items-center gap-1.5">
                    <IconMapPin className="size-4 text-gold-500" />
                    {[profile.district, profile.city].filter(Boolean).join(", ")}
                  </span>
                )}
                <Rating value={profile.rating} />
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-gold-700 uppercase ring-1 ring-gold-500/30 ring-inset">
                  <IconBadgeCheck className="size-3.5" />
                  {cabinet ? "Cabinet vérifié" : "Avocat vérifié"}
                </span>

                {profile.plan === "pionnier" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-marine-950/6 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-marine-800 uppercase ring-1 ring-marine-950/10 ring-inset">
                    <IconCrown className="size-3.5" />
                    Pionnier
                  </span>
                )}

                {profile.memberSince && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-500/10 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-trust-600 uppercase ring-1 ring-trust-500/25 ring-inset">
                    <IconCalendar className="size-3.5" />
                    Membre depuis {profile.memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {editable ? (
              <Link
                href={`/avocats/${profile.slug}`}
                className={buttonStyles({ size: "sm" })}
              >
                <IconEye className="size-4" />
                Voir la vitrine publique
              </Link>
            ) : (
              <>
                <Link
                  href={`/besoin/nouveau?avocat=${profile.slug}`}
                  className={buttonStyles({ size: "sm" })}
                >
                  <IconSend className="size-4" />
                  Poser ma question
                </Link>
                <Link
                  href={`/avocats/${profile.slug}/rendez-vous`}
                  className={buttonStyles({
                    variant: "outline",
                    size: "sm",
                    className: "border-marine-950/15",
                  })}
                >
                  <IconCalendar className="size-4" />
                  Prendre rendez-vous
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label="Plus d’options"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-marine-950/15 bg-white text-marine-700 transition-colors hover:border-marine-950/35"
            >
              <IconMore className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
