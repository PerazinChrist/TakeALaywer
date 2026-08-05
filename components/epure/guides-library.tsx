import Link from "next/link";
import { AutoCarousel } from "@/components/epure/auto-carousel";
import { GuideShowcaseCard } from "@/components/public/guide-card";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatFcfa, groupDigits } from "@/lib/utils";
import type { GuideSummary, PlatformStats } from "@/lib/api/public";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";

const PROMISES = [
  "Rédigés par des avocats inscrits au Barreau",
  "Modèles prêts à remplir",
  "Débloqué en 1 clic par Mobile Money",
];

/**
 * ÉCRAN 3 — la bibliothèque, dès 250 FCFA.
 *
 * Chaque carte doit donner envie d'ouvrir le document : un aperçu de la page
 * qui dépasse du bas, la signature de l'avocat auteur, et le prix affiché en
 * gros. Le prix bas est l'argument de démocratisation — il est repris dans le
 * bouton d'achat. La carte elle-même vit dans `GuideShowcaseCard`, partagée
 * avec la bibliothèque (`/guides`).
 */
export function GuidesLibrary({
  guides,
  stats,
}: {
  guides: GuideSummary[];
  stats: PlatformStats;
}) {
  if (guides.length === 0) return null;

  // Le prix d'appel est celui réellement pratiqué, pas un chiffre rond choisi
  // pour la maquette : si le moins cher des guides passe à 500 FCFA, la
  // promesse de la section suit.
  const cheapest = guides.reduce(
    (min, guide) => (guide.price > 0 && guide.price < min ? guide.price : min),
    Number.POSITIVE_INFINITY,
  );

  const entryPrice = Number.isFinite(cheapest) ? cheapest : 250;

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
          description="Rédigés par des avocats. Lisibles immédiatement, à partir du prix d’un trajet en taxi."
        />

        {/* L'argument choc, isolé sur une ligne. */}
        <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 rounded-2xl bg-gold-500/10 px-6 py-4 text-center text-[0.95rem]/relaxed text-marine-800 ring-1 ring-gold-500/25 ring-inset">
          <span className="font-serif text-2xl font-bold text-gold-700">
            {formatFcfa(entryPrice)}
          </span>{" "}
          <span className="text-left">
            le guide complet, écrit et signé par un avocat.
          </span>
        </p>
      </div>

      <AutoCarousel label="Guides et modèles de documents" className="mt-14">
        {guides.map((guide) => (
          // Largeur fixe : dans un carrousel, c'est la carte qui dicte le pas.
          <li key={guide.slug} className="w-[19rem] shrink-0 sm:w-[20.5rem]">
            <GuideShowcaseCard guide={guide} />
          </li>
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
            {groupDigits(stats.guides)} guides et modèles publiés par des avocats vérifiés.
          </p>
        </div>
      </div>
    </section>
  );
}
