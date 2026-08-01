import Link from "next/link";
import { AutoCarousel } from "@/components/epure/auto-carousel";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { practicalGuides, type PracticalGuide } from "@/lib/data/home";
import { formatFcfa } from "@/lib/utils";
import {
  IconArrowRight,
  IconBadgeCheck,
  IconCheck,
  IconDownload,
  IconFileText,
  IconSmartphone,
} from "@/components/ui/icons";

/** Largeurs des lignes de texte simulées dans l'aperçu du document. */
const PREVIEW_LINES = ["100%", "94%", "98%", "72%", "96%", "88%", "60%"];

const PROMISES = [
  "Rédigés par des avocats inscrits au Barreau",
  "Modèles prêts à remplir",
  "Débloqué en 1 clic par Mobile Money",
];

/**
 * ÉCRAN 3 — la bibliothèque, dès 250 FCFA.
 *
 * Chaque carte doit donner envie d'ouvrir le document : un aperçu de la page
 * qui dépasse du bas, ce que l'achat débloque concrètement, la signature de
 * l'avocat auteur, et le prix affiché en gros. Le prix bas est l'argument de
 * démocratisation — il est repris dans le bouton d'achat.
 */
export function GuidesLibrary() {
  return (
    <section className="bg-panel py-20 lg:py-28" aria-labelledby="guides-titre">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Bibliothèque juridique"
          title={
            <span id="guides-titre">
              Guides Juridiques Pratiques &amp; Modèles de Documents
            </span>
          }
          description="Rédigés par des avocats. Téléchargeables instantanément à partir de 250 FCFA."
        />

        {/* L'argument choc, isolé sur une ligne. */}
        <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 rounded-2xl bg-gold-500/10 px-6 py-4 text-center text-[0.95rem]/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <span className="font-serif text-2xl font-bold text-gold-700">
            250 FCFA
          </span>{" "}
          <span className="text-left">
            le guide complet, écrit et signé par un avocat.
          </span>
        </p>
      </div>

      <AutoCarousel label="Guides et modèles de documents" className="mt-14">
        {practicalGuides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </AutoCarousel>

      <div className="container-page">
        <div className="mt-12 flex flex-col items-center gap-6">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2.5">
            {PROMISES.map((promise) => (
              <li
                key={promise}
                className="inline-flex items-center gap-2 text-sm text-marine-700"
              >
                <IconCheck className="size-4 shrink-0 text-trust-600" />
                {promise}
              </li>
            ))}
          </ul>

          <Link
            href="/guides"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Explorer toute la bibliothèque
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <p className="text-sm text-marine-500">
            128 guides et modèles publiés par 340 avocats auteurs.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function GuideCard({ guide }: { guide: PracticalGuide }) {
  const isModel = guide.kind === "modele";

  return (
    <li className="w-[19rem] shrink-0 sm:w-[20.5rem]">
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

          <p className="mt-2.5 line-clamp-2 text-sm/relaxed text-marine-600">
            {guide.excerpt}
          </p>

          {/* Ce que l'achat débloque — l'argument qui déclenche la décision. */}
          <ul className="mt-4 space-y-2 border-t border-marine-950/6 pt-4">
            {guide.unlocks.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[0.8rem]/snug text-marine-800"
              >
                <IconCheck className="mt-px size-3.5 shrink-0 text-trust-600" />
                {item}
              </li>
            ))}
          </ul>

          {/* `mt-auto` colle le bas de carte en bas, quelle que soit la
              longueur des textes : les boutons restent alignés sur la ligne. */}
          <div className="mt-auto pt-5">
            <div className="flex items-center gap-2">
              <Avatar initials={guide.author.initials} size="sm" />
              <span className="min-w-0 text-sm/tight">
                <span className="flex items-center gap-1 font-semibold text-marine-900">
                  <span className="truncate">{guide.author.name}</span>
                  <IconBadgeCheck className="size-3.5 shrink-0 text-gold-500" />
                </span>
                <span className="inline-flex items-center gap-1 text-marine-500">
                  <IconDownload className="size-3.5" />
                  {guide.downloads} téléchargements
                </span>
              </span>
            </div>

            <Link
              href={`/guides/${guide.slug}/acheter`}
              className={buttonStyles({
                size: "sm",
                full: true,
                className: "mt-4",
              })}
            >
              <IconSmartphone className="size-4" />
              Acheter · {formatFcfa(guide.price, { short: true })}
            </Link>

            <Link
              href={`/guides/${guide.slug}`}
              className="mt-2.5 block text-center text-xs font-semibold text-marine-600 underline-offset-4 transition-colors hover:text-gold-700 hover:underline"
            >
              Lire un extrait gratuit
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Aperçu du document : une page qui dépasse du haut de la carte et se perd
 * dans le blanc. Les lignes de texte sont simulées — le vrai rendu du PDF
 * viendra du module 3 ; l'important ici est de montrer qu'il y a bien un
 * document derrière le prix.
 */
function DocumentPreview({
  guide,
  isModel,
}: {
  guide: PracticalGuide;
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
        {formatFcfa(guide.price)}
      </span>

      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-semibold tracking-wide text-marine-500 uppercase">
        PDF · {guide.pages} pages
      </span>
    </div>
  );
}
