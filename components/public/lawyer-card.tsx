import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { LawyerBadge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import type { DirectoryEntry } from "@/lib/api/public";
import {
  IconBadgeCheck,
  IconBuilding,
  IconClock,
  IconFileText,
  IconMapPin,
  IconUsers,
} from "@/components/ui/icons";

/**
 * Carte d'annuaire — module 2.1, avec les badges du module 8.3.
 *
 * Elle sert la page d'accueil comme la page `/avocats` : une seule carte pour
 * les deux évite qu'un ajout de badge n'apparaisse d'un côté seulement.
 */
export function LawyerCard({ lawyer }: { lawyer: DirectoryEntry }) {
  const isFirm = lawyer.type === "cabinet";

  return (
    <li className="group flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-marine-950/5 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <Avatar
          initials={lawyer.initials}
          imageUrl={lawyer.avatarUrl}
          size="lg"
          online={lawyer.online}
        />

        {lawyer.online && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-500/10 px-2.5 py-1 text-[0.7rem] font-semibold text-trust-600">
            <span className="size-1.5 rounded-full bg-trust-500" />
            En ligne
          </span>
        )}
      </div>

      <h3 className="mt-4 flex items-start gap-1.5 font-serif text-lg/snug font-bold text-marine-950">
        <Link href={`/avocats/${lawyer.slug}`} className="hover:text-gold-700">
          {lawyer.name}
        </Link>
        <IconBadgeCheck className="mt-1 size-4 shrink-0 text-gold-500" />
      </h3>

      <p className="mt-1 line-clamp-2 text-sm text-marine-600">
        {lawyer.specialties.slice(0, 3).join(" · ") || lawyer.subtitle}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-marine-500">
        <span className="inline-flex items-center gap-1">
          <IconMapPin className="size-3.5 text-gold-500" />
          {lawyer.city}
        </span>

        {isFirm ? (
          <span className="inline-flex items-center gap-1">
            <IconUsers className="size-3.5 text-gold-500" />
            {lawyer.headcount ?? 0} avocats
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <IconFileText className="size-3.5 text-gold-500" />
            {lawyer.guidesCount} {lawyer.guidesCount > 1 ? "guides" : "guide"}
          </span>
        )}
      </div>

      {/* Une note moyenne sans avis n'est pas « 0 sur 5 » : c'est une absence
          d'information, et l'afficher comme une note pénaliserait les fiches
          récentes. */}
      {lawyer.reviewsCount > 0 ? (
        <Rating value={lawyer.rating} reviews={lawyer.reviewsCount} className="mt-3" compact />
      ) : (
        <p className="mt-3 text-sm text-marine-400">Pas encore d’avis</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lawyerBadges(lawyer).map((badge) => (
          <LawyerBadge key={badge} kind={badge} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-marine-950/6 pt-4 text-sm font-medium text-marine-600">
        {lawyer.responseTime && (
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="size-4 text-trust-500" />
            Répond en {lawyer.responseTime}
          </span>
        )}

        {isFirm && (
          <span className="inline-flex items-center gap-1.5">
            <IconBuilding className="size-4 text-marine-400" />
            Cabinet
          </span>
        )}
      </div>

      <Link
        href={`/avocats/${lawyer.slug}`}
        className={buttonStyles({ variant: "outline", size: "sm", full: true, className: "mt-3" })}
      >
        Voir le profil
      </Link>
    </li>
  );
}

/**
 * Déduit les badges d'une fiche à partir de ses données réelles.
 *
 * Les badges du module 8.3 sont attribués par règle, jamais saisis à la main :
 * un « Expert auteur » sans guide publié se verrait au premier clic.
 */
export function lawyerBadges(lawyer: DirectoryEntry): Array<"verified" | "author" | "pioneer"> {
  const badges: Array<"verified" | "author" | "pioneer"> = ["verified"];

  if (lawyer.guidesCount > 0) badges.push("author");
  if (lawyer.plan === "pionnier") badges.push("pioneer");

  return badges;
}
