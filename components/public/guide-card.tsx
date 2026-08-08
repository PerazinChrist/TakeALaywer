import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { formatFcfa, groupDigits } from "@/lib/utils";
import type { GuideSummary } from "@/lib/api/public";
import {
  IconBadgeCheck,
  IconClock,
  IconCrown,
  IconEye,
  IconFileText,
  IconSmartphone,
} from "@/components/ui/icons";

/** Largeurs des lignes de texte simulées dans l'aperçu du document. */
const PREVIEW_LINES = ["100%", "94%", "98%", "72%", "96%", "88%", "60%"];

/**
 * Carte de guide — la seule du site.
 *
 * Elle sert partout où un guide est présenté à un visiteur : accueil,
 * bibliothèque, page de domaine, guides liés en fin de lecture, bibliothèque
 * personnelle du citoyen et vitrine d'un praticien. Une carte unique n'est pas
 * qu'une affaire de cohérence visuelle : le prix, le badge d'accès et le bouton
 * d'achat sont des éléments sur lesquels le visiteur apprend à s'orienter, et
 * deux mises en forme concurrentes lui font relire à chaque fois ce qu'il avait
 * déjà compris.
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
                <IconEye className="size-3.5" />
                {groupDigits(guide.views)} lectures
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
