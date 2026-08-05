import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { formatFcfa, groupDigits } from "@/lib/utils";
import type { GuideSummary } from "@/lib/api/public";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconClock,
  IconCrown,
  IconDownload,
  IconFileText,
  IconSmartphone,
  IconTrendingUp,
} from "@/components/ui/icons";

/**
 * Carte de guide — module 3, utilisée par la page d'accueil et la bibliothèque.
 *
 * Elle ne montre jamais le contenu : celui-ci n'est pas chargé sur un index,
 * puisque l'API ne le renvoie qu'à la lecture d'un guide précis.
 */
export function GuideCard({ guide, compact = false }: { guide: GuideSummary; compact?: boolean }) {
  return (
    <article
      className={
        compact
          ? "group flex flex-col rounded-2xl border border-marine-950/8 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-marine-300 hover:shadow-card"
          : "group flex h-full flex-col rounded-3xl border border-marine-950/8 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-marine-300 hover:shadow-card"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[0.7rem] font-bold tracking-[0.14em] text-marine-400 uppercase">
          {guide.category}
        </span>
        <GuidePrice guide={guide} />
      </div>

      <h3
        className={
          compact
            ? "mt-3 font-serif text-lg/snug font-bold text-marine-950"
            : "mt-3 font-serif text-xl/snug font-bold text-marine-950"
        }
      >
        <Link href={`/guides/${guide.slug}`} className="group-hover:text-gold-700">
          {guide.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm/relaxed text-marine-600">
        {guide.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-marine-500">
        <span className="inline-flex items-center gap-1.5">
          <IconClock className="size-3.5 text-gold-600" />
          {guide.readingTime} min
        </span>

        {guide.downloads > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <IconTrendingUp className="size-3.5 text-trust-600" />
            {groupDigits(guide.downloads)} lectures
          </span>
        )}

        {guide.kind === "modele" && (
          <span className="inline-flex items-center gap-1.5">
            <IconFileText className="size-3.5 text-marine-400" />
            Modèle
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-marine-950/6 pt-3.5">
        <Link
          href={`/avocats/${guide.author.slug}`}
          className="flex min-w-0 items-center gap-2 hover:opacity-80"
        >
          <Avatar initials={guide.author.initials} imageUrl={guide.author.avatarUrl} size="sm" />
          <span className="min-w-0 text-sm/tight">
            <span className="flex items-center gap-1 truncate font-semibold text-marine-900">
              {guide.author.name}
              {guide.author.verified && (
                <IconBadgeCheck className="size-3.5 shrink-0 text-gold-500" />
              )}
            </span>
            <span className="text-marine-500">{guide.author.city}</span>
          </span>
        </Link>

        <IconArrowRight className="size-4 shrink-0 text-marine-300 transition-all group-hover:translate-x-0.5 group-hover:text-gold-600" />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */

/** Largeurs des lignes de texte simulées dans l'aperçu du document. */
const PREVIEW_LINES = ["100%", "94%", "98%", "72%", "96%", "88%", "60%"];

/**
 * Carte de guide « vitrine » — celle de l'accueil épuré, réutilisée telle quelle
 * par la bibliothèque.
 *
 * Elle rend uniquement l'`<article>` : c'est l'appelant qui décide de la largeur
 * (carte fixe dans le carrousel, cellule extensible dans la grille). `h-full`
 * l'étire sur la hauteur qu'on lui donne, donc les boutons d'une même ligne
 * restent alignés quelle que soit la longueur des titres.
 */
export function GuideShowcaseCard({ guide }: { guide: GuideSummary }) {
  const isModel = guide.kind === "modele";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-marine-950/6 transition-all duration-300 hover:-translate-y-1 hover:ring-gold-500/35">
      <DocumentPreview guide={guide} isModel={isModel} />

      <div className="flex flex-1 flex-col p-6 pt-5">
        <p className="text-[0.7rem] font-bold tracking-[0.14em] text-marine-400 uppercase">
          {guide.category}
        </p>

        <h3 className="mt-2 font-serif text-lg/snug font-bold text-balance text-marine-950">
          <Link
            href={`/guides/${guide.slug}`}
            className="transition-colors hover:text-gold-700"
          >
            {guide.title}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 text-sm/relaxed text-marine-600">
          {guide.description}
        </p>

        {/* `mt-auto` colle le bas de carte en bas, quelle que soit la
            longueur des textes : les boutons restent alignés sur la ligne. */}
        <div className="mt-auto pt-5">
          <Link
            href={`/avocats/${guide.author.slug}`}
            className="flex items-center gap-2 border-t border-marine-950/6 pt-4 transition-opacity hover:opacity-80"
          >
            <Avatar
              initials={guide.author.initials}
              imageUrl={guide.author.avatarUrl}
              size="sm"
            />
            <span className="min-w-0 text-sm/tight">
              <span className="flex items-center gap-1 font-semibold text-marine-900">
                <span className="truncate">{guide.author.name}</span>
                {guide.author.verified && (
                  <IconBadgeCheck className="size-3.5 shrink-0 text-gold-500" />
                )}
              </span>
              <span className="inline-flex items-center gap-1 text-marine-500">
                <IconDownload className="size-3.5" />
                {groupDigits(guide.downloads)} lectures
              </span>
            </span>
          </Link>

          {guide.free ? (
            <Link
              href={`/guides/${guide.slug}`}
              className={buttonStyles({ size: "sm", full: true, className: "mt-4" })}
            >
              <IconFileText className="size-4" />
              Lire gratuitement
            </Link>
          ) : (
            <>
              <Link
                href={`/guides/${guide.slug}`}
                className={buttonStyles({ size: "sm", full: true, className: "mt-4" })}
              >
                <IconSmartphone className="size-4" />
                Débloquer · {formatFcfa(guide.price, { short: true })}
              </Link>

              <Link
                href={`/guides/${guide.slug}`}
                className="mt-2.5 block text-center text-xs font-semibold text-marine-600 underline-offset-4 transition-colors hover:text-gold-700 hover:underline"
              >
                Lire un extrait gratuit
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Aperçu du document : une page qui dépasse du haut de la carte et se perd dans
 * le blanc. Les lignes de texte sont simulées — montrer le vrai contenu ici
 * reviendrait à distribuer ce que le paywall protège trois écrans plus loin.
 */
function DocumentPreview({
  guide,
  isModel,
}: {
  guide: GuideSummary;
  isModel: boolean;
}) {
  return (
    <div className="relative h-44 overflow-hidden bg-linear-to-b from-marine-100 to-panel px-6 pt-7">
      <div className="h-full rounded-t-xl bg-white px-4 pt-4 shadow-[0_-12px_30px_-20px_rgb(15_23_42/0.5)] ring-1 ring-marine-950/8 transition-transform duration-300 group-hover:-translate-y-1">
        <span className="block h-1 w-8 rounded-full bg-gold-500" aria-hidden="true" />

        <p
          className="mt-2.5 line-clamp-2 font-serif text-[0.62rem]/[1.3] font-bold text-marine-900"
          aria-hidden="true"
        >
          {guide.title}
        </p>

        <div className="mt-3 space-y-1.5" aria-hidden="true">
          {PREVIEW_LINES.map((width, i) => (
            <span
              key={width + i}
              className="block h-1 rounded-full bg-marine-950/12"
              style={{ width, opacity: 1 - i * 0.09 }}
            />
          ))}
        </div>
      </div>

      {/* Fondu vers le corps blanc de la carte. */}
      <div
        className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white via-white/85 to-transparent"
        aria-hidden="true"
      />

      <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-marine-700 uppercase ring-1 ring-marine-950/8 ring-inset backdrop-blur-sm">
        <IconFileText className="size-3.5" />
        {isModel ? "Modèle" : "Guide"}
      </span>

      {/* Le prix, à l'endroit où l'œil arrive en premier. */}
      <span className="absolute top-3.5 right-3.5 rounded-full bg-gold-500 px-3 py-1 font-serif text-sm font-bold text-marine-950 shadow-gold">
        {guide.free ? "Gratuit" : formatFcfa(guide.price)}
      </span>

      <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 text-[0.65rem] font-semibold tracking-wide text-marine-500 uppercase">
        <IconClock className="size-3" />
        {/* Un guide rédigé se mesure en minutes de lecture ; seuls les PDF
            déposés ont une pagination. */}
        {guide.format === "pdf" && guide.pages > 0
          ? `PDF · ${guide.pages} pages`
          : `Lecture · ${guide.readingTime} min`}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Étiquette d'accès : gratuit en émeraude, payant en or avec son montant. */
export function GuidePrice({ guide }: { guide: Pick<GuideSummary, "free" | "price"> }) {
  if (guide.free) {
    return <Badge tone="free">Gratuit</Badge>;
  }

  return (
    <Badge tone="premium">
      <IconCrown className="size-3.5" />
      {formatFcfa(guide.price)}
    </Badge>
  );
}
